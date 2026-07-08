import { Injectable } from "@nestjs/common";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { accessTokenClaims, type AccessTokenClaims, type Principal } from "@infoenc/contracts/auth";
import { loadEnv } from "../../config/env.js";

/**
 * Access-token minting/verification (Phase 2 doc 05 §3).
 *
 * NOTE ON SIGNING: production signs with an ES256 key held in KMS (JWKS-published, rotated
 * quarterly). This implementation uses an HMAC over the canonical claim JSON as the local-dev
 * signer so the flow is exercisable without KMS; the KMS-backed asymmetric signer implements the
 * same `sign`/`verify` surface and is swapped in by DI in staging/production. Refresh tokens are
 * opaque random values (never JWTs) — hashed at rest, rotated per use with family tracking.
 */
@Injectable()
export class TokenService {
  private readonly env = loadEnv();

  /** Mints a short-lived access token for a principal within its active org context. */
  signAccess(principal: Principal): { token: string; expiresAt: number } {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.env.ACCESS_TOKEN_TTL_SECONDS;
    const claims: AccessTokenClaims = {
      sub: principal.userId,
      sid: principal.sessionId,
      org: principal.orgId,
      roles: principal.roles,
      amr: principal.amr,
      locale: principal.locale,
      iat: now,
      exp,
    };
    const payload = base64url(JSON.stringify(claims));
    const sig = this.sign(payload);
    return { token: `${payload}.${sig}`, expiresAt: exp };
  }

  /** Verifies signature + expiry and returns typed claims, or null if invalid. */
  verifyAccess(token: string): AccessTokenClaims | null {
    const [payload, sig] = token.split(".");
    if (!payload || !sig) return null;
    const expected = this.sign(payload);
    if (!safeEqual(sig, expected)) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    } catch {
      return null;
    }
    const result = accessTokenClaims.safeParse(parsed);
    if (!result.success) return null;
    if (result.data.exp < Math.floor(Date.now() / 1000)) return null;
    return result.data;
  }

  /** Opaque refresh token (256-bit) + its at-rest hash. The plaintext is set as an httpOnly cookie. */
  newRefreshToken(): { token: string; hash: string } {
    const token = randomBytes(32).toString("base64url");
    return { token, hash: hashToken(token) };
  }

  hashRefreshToken(token: string): string {
    return hashToken(token);
  }

  private sign(payload: string): string {
    // Dev HMAC signer; replaced by the KMS ES256 signer in staging/prod (see class note).
    return createHmac("sha256", this.env.JWT_SIGNING_KEY_ID).update(payload).digest("base64url");
  }
}

function base64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

function hashToken(token: string): string {
  return createHmac("sha256", "infoenc-refresh").update(token).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}
