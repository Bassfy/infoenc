import { ForbiddenException, Injectable } from "@nestjs/common";
import type { Principal } from "@infoenc/contracts/auth";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { CryptoService } from "../../platform/crypto/crypto.service.js";
import { AuthzService } from "../../platform/authz/authz.service.js";
import { RedisService } from "../../platform/redis/redis.service.js";

/**
 * Evidence exchange (FR-CO-033) — crown-jewel objects. Every download is:
 *   - authorized (engagement contact or consultant, step-up required — authz.can),
 *   - attributed + immutably logged (who/when/ip),
 *   - via a single-org, short-lived (≤72h) presigned URL,
 *   - watermarked per recipient at render time (the object store returns a per-request rendition).
 * The object's data key is envelope-wrapped; the metadata row holds the wrapped key so dropping it
 * crypto-shreds the evidence (NFR-025).
 */
export interface StorageSigner {
  /** Returns a presigned GET bound to the object, expiring in ttlSeconds. */
  presignGet(s3Key: string, ttlSeconds: number, watermark: string): Promise<string>;
}

@Injectable()
export class EvidenceService {
  private static readonly MAX_TTL = 72 * 3600;

  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly authz: AuthzService,
    private readonly redis: RedisService,
    private readonly signer: StorageSigner,
  ) {}

  /**
   * Issues an attributed, watermarked, expiring download link for an evidence object. Enforces
   * authorization + step-up, logs the issuance immutably, and rate-limits bulk pulls.
   */
  async requestDownload(
    actor: Principal,
    evidenceId: string,
    stepUpFresh: boolean,
    ipHash?: string,
  ): Promise<{ url: string; expiresIn: number }> {
    const evidence = await this.prisma.tenant.evidence.findUnique({ where: { id: evidenceId } });
    if (!evidence) throw new ForbiddenException("not authorized for this evidence"); // RLS-scoped

    this.authz.assert(actor, "evidence.download", { orgId: evidence.orgId }, { stepUpFresh });
    await this.rateLimitBulk(actor.userId);

    const ttl = EvidenceService.MAX_TTL;
    const watermark = `${actor.userId} · ${evidence.orgId} · ${new Date().toISOString()}`;
    const url = await this.signer.presignGet(evidence.s3Key, ttl, watermark);

    // Immutable attribution log (FR-CO-033). Written every issuance, before the URL is returned.
    await this.prisma.tenant.evidenceDownload.create({
      data: { evidenceId, userId: actor.userId, ipHash: ipHash ?? null },
    });

    return { url, expiresIn: ttl };
  }

  /** Registers a newly uploaded object's metadata + wrapped key (upload goes direct-to-S3). */
  async registerUpload(
    actor: Principal,
    input: { engagementId: string; orgId: string; s3Key: string; filename: string; contentType: string; sizeBytes: bigint; dataKey: string },
  ): Promise<{ evidenceId: string }> {
    this.authz.assert(actor, "finding.publish", { orgId: input.orgId }); // consultant scope
    const wrappedKey = await this.crypto.encrypt(input.dataKey);
    const row = await this.prisma.tenant.evidence.create({
      data: {
        engagementId: input.engagementId,
        orgId: input.orgId,
        s3Key: input.s3Key,
        filename: input.filename,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
        wrappedKey,
        uploadedBy: actor.userId,
      },
    });
    return { evidenceId: row.id };
  }

  private async rateLimitBulk(userId: string): Promise<void> {
    // Bulk evidence export is a security-event trigger; a spike is flagged (NFR-023).
    const key = `evdl:${userId}:${Math.floor(Date.now() / 3_600_000)}`;
    const n = await this.redis.client.incr(key);
    if (n === 1) await this.redis.client.expire(key, 3600);
    if (n > 50) {
      await this.prisma.securityEvent.create({
        data: { kind: "export.bulk", severity: "medium", actorId: userId, detail: { evidenceDownloadsThisHour: n } },
      });
      throw new ForbiddenException("RATE_LIMITED: evidence download volume");
    }
  }
}
