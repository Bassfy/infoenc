import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import type { Request } from "express";
import { Observable } from "rxjs";
import type { Principal } from "@infoenc/contracts/auth";
import { runWithTenant } from "../tenant/tenant-context.js";

/**
 * Binds the authenticated Principal (set by AuthGuard) as the request's RLS tenant context
 * (Phase 5, Phase 2 doc 06 §3). Every DB query in the handler and its async descendants then runs
 * scoped to this org/user — the AsyncLocalStorage context propagates across awaits because
 * next.handle().subscribe() runs INSIDE runWithTenant.
 *
 * Requests with no principal (public routes) run without tenant context; RLS on scoped tables
 * returns zero rows in that case (fail-closed), so this is safe.
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<Request & { principal?: Principal }>();
    const principal = req.principal;
    if (!principal) return next.handle();

    return new Observable((subscriber) => {
      runWithTenant(
        {
          userId: principal.userId,
          orgId: principal.orgId,
          roles: principal.roles,
          isStaff: principal.isStaff,
        },
        () => {
          next.handle().subscribe({
            next: (v) => subscriber.next(v),
            error: (e) => subscriber.error(e),
            complete: () => subscriber.complete(),
          });
        },
      );
    });
  }
}
