import { ForbiddenException, Injectable } from "@nestjs/common";
import type { FindingSeverity } from "@prisma/client";
import type { Principal } from "@infoenc/contracts/auth";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";
import { CryptoService } from "../../platform/crypto/crypto.service.js";
import { AuthzService } from "../../platform/authz/authz.service.js";

/**
 * Findings (Phase 2 doc 05, doc 06 §4) — CROWN JEWEL. Every protection converges here:
 *   - Tenant isolation: RLS scopes findings to the client org (the query can't cross tenants).
 *   - Field-level encryption: the finding body is AES-256-GCM ciphertext at rest (bodyCipher),
 *     decrypted only for authorized readers (NFR-020).
 *   - Authorization: publishing requires staff:consultant AND same-org (authz.can, doc 05 §5).
 *   - Auditability: publish is an auditable, notifiable event; critical severity alerts immediately
 *     regardless of digest prefs (FR-CO-032 AC).
 * A finding is invisible to the client until `publishedAt` is set (consultant controls the reveal).
 */
@Injectable()
export class FindingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly crypto: CryptoService,
    private readonly authz: AuthzService,
  ) {}

  /** Creates a draft finding with an encrypted body. Not visible to the client until published. */
  async create(
    actor: Principal,
    input: {
      engagementId: string;
      orgId: string;
      severity: FindingSeverity;
      cvssVector?: string;
      cvssScore?: number; // x10
      affectedAsset?: string;
      body: string; // plaintext in → ciphertext at rest
      templateId?: string;
    },
  ): Promise<{ findingId: string }> {
    // Consultant + same engagement org (the engagement is loaded to confirm org binding).
    this.authz.assert(actor, "finding.publish", { orgId: input.orgId });

    const bodyCipher = await this.crypto.encrypt(input.body);
    const finding = await this.prisma.tenant.finding.create({
      data: {
        engagementId: input.engagementId,
        orgId: input.orgId,
        severity: input.severity,
        cvssVector: input.cvssVector ?? null,
        cvssScore: input.cvssScore ?? null,
        affectedAsset: input.affectedAsset ?? null,
        templateId: input.templateId ?? null,
        bodyCipher,
        status: "open",
      },
    });
    return { findingId: finding.id };
  }

  /**
   * Publishes a finding to the client. Sets publishedAt (making it visible under RLS), emits the
   * event, and — for critical severity — signals the immediate-alert path (FR-CO-032 AC).
   */
  async publish(actor: Principal, findingId: string): Promise<void> {
    const finding = await this.prisma.tenant.finding.findUniqueOrThrow({ where: { id: findingId } });
    this.authz.assert(actor, "finding.publish", { orgId: finding.orgId });
    if (finding.publishedAt) return; // idempotent

    await this.prisma.$transaction(async (tx) => {
      await tx.finding.update({ where: { id: findingId }, data: { publishedAt: new Date() } });
      await this.outbox.emit(tx, {
        name: "engagements.finding.published",
        aggregateId: findingId,
        orgId: finding.orgId,
        payload: {
          engagementId: finding.engagementId,
          findingId,
          severity: finding.severity,
          immediate: finding.severity === "critical" || finding.severity === "high",
        },
      });
    });
  }

  /** Returns the decrypted body for an AUTHORIZED reader. RLS already scoped the row to the org. */
  async readBody(actor: Principal, findingId: string): Promise<{ severity: FindingSeverity; body: string }> {
    const finding = await this.prisma.tenant.finding.findUnique({ where: { id: findingId } });
    // RLS returns null if the finding is not in the actor's org — treat as forbidden, not 404-leak.
    if (!finding) throw new ForbiddenException("not authorized for this finding");
    // Client contacts only see published findings; staff see drafts too.
    if (!actor.isStaff && !finding.publishedAt) {
      throw new ForbiddenException("finding not yet available");
    }
    return { severity: finding.severity, body: await this.crypto.decrypt(finding.bodyCipher) };
  }
}
