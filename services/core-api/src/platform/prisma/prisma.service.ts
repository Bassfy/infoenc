import { Injectable, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";
import { getTenantContext, type TenantContext } from "../tenant/tenant-context.js";

/**
 * Prisma service with automatic RLS tenant-context injection (Phase 2 doc 06 §3, Phase 3 doc 04).
 *
 * THE security guarantee: every domain query runs inside a transaction that first executes
 * `set_config('app.current_org'|'current_user'|'current_roles'|'is_staff', …, true)` — the LOCAL
 * form, so the settings apply only to that transaction. Postgres row-level security policies
 * (installed by the RLS bootstrap migration) read those settings to scope every row. The app
 * connects as a role WITHOUT BYPASSRLS, so there is no path to cross-tenant data — even a query
 * missing a WHERE clause is constrained by the database.
 *
 * Fail-closed: a query with NO bound tenant context still runs, but SET LOCAL is skipped, so
 * tenant-scoped policies see NULL settings and return zero rows. The failure mode is "no rows",
 * never "all rows".
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /** Domain code uses this client; it applies tenant context automatically. */
  readonly tenant: PrismaClient;

  constructor() {
    super();
    this.tenant = this.withTenantRls();
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }

  private withTenantRls(): PrismaClient {
    const base = this;
    return this.$extends({
      query: {
        async $allOperations({ model, operation, args, query }) {
          const ctx = getTenantContext();
          // Context-free ops (auth lookups, public catalog) run unscoped; RLS on scoped tables
          // still returns zero rows without context, so this is safe.
          if (!ctx) return query(args);

          return base.$transaction(async (tx) => {
            await setTenantGucs(tx, ctx);
            // Re-dispatch the original operation onto the transaction client so it inherits the
            // GUCs set above. Model operations go through tx[model][operation]; raw/$-ops (no
            // model) fall back to the extension's own query() on the same transaction.
            if (model) {
              const delegate = (tx as unknown as Record<string, Record<string, (a: unknown) => Promise<unknown>>>)[
                lowerFirst(model)
              ];
              return delegate[operation](args);
            }
            return query(args);
          });
        },
      },
    }) as unknown as PrismaClient;
  }
}

/** Sets the four app.* settings with transaction-LOCAL scope (the RLS inputs). */
function setTenantGucs(tx: Prisma.TransactionClient, ctx: TenantContext): Promise<unknown> {
  return tx.$executeRaw`
    SELECT
      set_config('app.current_org',   ${ctx.orgId},                'true'),
      set_config('app.current_user',  ${ctx.userId},               'true'),
      set_config('app.current_roles', ${ctx.roles.join(",")},      'true'),
      set_config('app.is_staff',      ${ctx.isStaff ? "true" : "false"}, 'true')
  `;
}

function lowerFirst(s: string): string {
  return s.charAt(0).toLowerCase() + s.slice(1);
}
