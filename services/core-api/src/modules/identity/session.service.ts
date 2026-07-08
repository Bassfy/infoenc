import { Injectable, UnauthorizedException } from "@nestjs/common";
import { createHash } from "node:crypto";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { TokenService } from "./token.service.js";
import { loadEnv } from "../../config/env.js";

/**
 * Refresh-token sessions with rotation + family reuse-detection (Phase 2 doc 05 §3, NFR-002).
 *
 * Each session belongs to a rotation family. Presenting a refresh token issues a NEW token and
 * marks the old one consumed. If a already-consumed token is presented again (theft/replay), the
 * WHOLE family is revoked and a security event is raised — the legitimate user is forced to
 * re-authenticate, and the attacker's stolen token is dead.
 */
export interface SessionMeta {
  userAgent?: string;
  ipHash?: string;
  approxLocation?: string;
  amr: string[];
}

@Injectable()
export class SessionService {
  private readonly env = loadEnv();

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}

  /** Opens a new session (new family) and returns the plaintext refresh token for the cookie. */
  async create(
    userId: string,
    activeOrgId: string,
    meta: SessionMeta,
  ): Promise<{ sessionId: string; refreshToken: string }> {
    const { token, hash } = this.tokens.newRefreshToken();
    const familyId = crypto.randomUUID();
    const session = await this.prisma.session.create({
      data: {
        userId,
        familyId,
        refreshHash: hash,
        activeOrgId,
        userAgent: meta.userAgent ?? null,
        ipHash: meta.ipHash ?? null,
        approxLocation: meta.approxLocation ?? null,
        amr: meta.amr,
        expiresAt: new Date(Date.now() + this.env.REFRESH_TOKEN_TTL_SECONDS * 1000),
      },
    });
    return { sessionId: session.id, refreshToken: token };
  }

  /** Rotates a refresh token. Detects reuse of a consumed token and kills the family. */
  async rotate(refreshToken: string): Promise<{ sessionId: string; refreshToken: string; userId: string; orgId: string }> {
    const hash = this.tokens.hashRefreshToken(refreshToken);
    const session = await this.prisma.session.findUnique({ where: { refreshHash: hash } });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      // Unknown/expired token. If it matches a revoked row's family, that's a reuse signal.
      if (session?.revokedAt) await this.revokeFamily(session.familyId, "refresh_reuse_detected");
      throw new UnauthorizedException("invalid refresh token");
    }

    // Consume the old, issue the new — same family.
    const next = this.tokens.newRefreshToken();
    await this.prisma.$transaction([
      this.prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() },
      }),
      this.prisma.session.create({
        data: {
          userId: session.userId,
          familyId: session.familyId,
          refreshHash: next.hash,
          activeOrgId: session.activeOrgId,
          userAgent: session.userAgent,
          ipHash: session.ipHash,
          approxLocation: session.approxLocation,
          amr: session.amr,
          expiresAt: new Date(Date.now() + this.env.REFRESH_TOKEN_TTL_SECONDS * 1000),
        },
      }),
    ]);

    const created = await this.prisma.session.findFirstOrThrow({
      where: { refreshHash: next.hash },
    });
    return {
      sessionId: created.id,
      refreshToken: next.token,
      userId: session.userId,
      orgId: session.activeOrgId ?? "",
    };
  }

  /** Revokes a single session (logout). The access-token denylist propagation is <=60s. */
  async revoke(sessionId: string): Promise<void> {
    await this.prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
  }

  private async revokeFamily(familyId: string, reason: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await this.prisma.securityEvent.create({
      data: { kind: "auth.refresh_reuse", severity: "high", detail: { familyId, reason } },
    });
  }
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
