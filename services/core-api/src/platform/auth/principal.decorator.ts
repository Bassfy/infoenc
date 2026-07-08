import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";
import type { Principal } from "@infoenc/contracts/auth";

/**
 * Injects the authenticated Principal into a handler param: `@CurrentPrincipal() p: Principal`.
 * Populated by AuthGuard; undefined only on @Public routes (handlers that need it are guarded).
 */
export const CurrentPrincipal = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Principal | undefined => {
    return ctx.switchToHttp().getRequest<Request & { principal?: Principal }>().principal;
  },
);
