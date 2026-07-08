import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Request-scoped tenant context (Phase 2 doc 06 §3).
 *
 * Carried through the whole request/job lifecycle via AsyncLocalStorage so the Prisma RLS
 * extension can read it on every query WITHOUT threading it through every function signature.
 * This is the value that becomes `SET LOCAL app.current_org/current_user/current_roles` on the
 * database transaction — the input to Postgres row-level security.
 *
 * If this context is missing when a domain query runs, the RLS policies evaluate to DENY
 * (current_setting returns NULL → predicate false), so the failure mode is "no rows", never
 * "all rows". That fail-closed property is the whole point.
 */
export interface TenantContext {
  readonly userId: string;
  readonly orgId: string;
  readonly roles: readonly string[];
  /** true for INFOENC staff — enables staff-scope RLS policy variants for admin surfaces. */
  readonly isStaff: boolean;
}

const storage = new AsyncLocalStorage<TenantContext>();

export function runWithTenant<T>(ctx: TenantContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getTenantContext(): TenantContext | undefined {
  return storage.getStore();
}

/** Use where a tenant context is required; throws rather than silently running unscoped. */
export function requireTenantContext(): TenantContext {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new Error("TENANT_CONTEXT_MISSING: no tenant context bound to this execution");
  }
  return ctx;
}
