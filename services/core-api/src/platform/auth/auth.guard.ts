import { CanActivate, ExecutionContext, Injectable, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import type { Principal } from "@infoenc/contracts/auth";
import { TokenService } from "../../modules/identity/token.service.js";
import { RedisService } from "../redis/redis.service.js";

/** Marks a route as public (skips authentication). */
export const Public = () => SetMetadata("isPublic", true);

/**
 * Authentication guard (Phase 2 doc 05). Verifies the Bearer access token, rejects denylisted
 * sessions (revocation ≤60s — NFR-002), and attaches the resolved Principal to the request. The
 * TenantInterceptor then binds that principal as RLS tenant context. Guards run before
 * interceptors in Nest, so the principal exists by the time the interceptor runs.
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>("isPublic", [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request & { principal?: Principal }>();
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) throw new UnauthorizedException("missing bearer token");

    const claims = this.tokens.verifyAccess(header.slice(7));
    if (!claims) throw new UnauthorizedException("invalid or expired token");

    if (await this.redis.isSessionDenied(claims.sid)) {
      throw new UnauthorizedException("session revoked");
    }

    req.principal = {
      userId: claims.sub,
      sessionId: claims.sid,
      orgId: claims.org,
      roles: claims.roles,
      amr: claims.amr,
      locale: claims.locale,
      isStaff: claims.roles.some((r) => r.startsWith("staff:")),
    };
    return true;
  }
}
