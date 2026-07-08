# Phase 5 — Core Platform Build

**Status:** Awaiting stakeholder approval
**Baseline:** Phases 1–4. This is the first phase that produces the running skeleton the product is built on.
**Approval gate:** Sign-off before Phase 6 (Academy Build).

---

## Objectives

Stand up the **working foundation** every later feature plugs into — the monorepo, the shared type contracts, the API with its security-critical tenant-isolation layer, the authorization gate, CI/CD, and local dev — so Phases 6–8 add features rather than plumbing.

## What shipped this phase (real code)

```
Monorepo root
├── package.json · pnpm-workspace.yaml · turbo.json · tsconfig.base.json · .npmrc
├── .gitignore · .env.example
└── .github/workflows/ci.yml            # lint/typecheck/boundaries/unit · integration+isolation ·
                                         # SAST/deps/secrets · i18n parity · web budgets

packages/contracts/                      # the source-of-truth types (zod)
├── src/primitives.ts                    # uuid, money (minor units), bps, error envelope, codes
├── src/auth/index.ts                    # AccessTokenClaims, Principal, authz action shape
├── src/events/index.ts                  # domain event taxonomy + typed payloads
└── src/commerce/index.ts                # plan features, checkout, price quote

services/core-api/                       # NestJS modular monolith skeleton
├── src/main.ts · worker.ts             # HTTP/WS + BullMQ-worker entrypoints (one codebase)
├── src/config/env.ts                    # zod-validated env — refuses to boot if misconfigured
├── src/platform/
│   ├── tenant/tenant-context.ts         # AsyncLocalStorage tenant context (fail-closed)
│   ├── prisma/prisma.service.ts         # ★ RLS tenant-context injection on every query
│   ├── authz/authz.service.ts           # ★ the single can() gate (RBAC + ABAC)
│   ├── authz/authz.service.spec.ts      # authz-matrix test slice
│   └── platform.module.ts               # global infra module
├── src/modules/health/                  # liveness/readiness
└── .dependency-cruiser.cjs              # module-boundary enforcement

prisma/migrations/
├── 0000_rls_bootstrap/migration.sql     # ★ uuid_generate_v7(), infoenc_app role, GUC helpers
└── 0002_rls_policies/migration.sql      # ★ ENABLE+FORCE RLS + policies + audit immutability

infra/docker/docker-compose.yml          # local: postgres, redis, meilisearch, minio, mailpit
```

★ = security-critical. The two RLS migrations and the two `★` platform files are the load-bearing
tenant-isolation machinery (Phase 2 doc 06); everything else is scaffolding around them.

## The tenant-isolation guarantee (the phase's centerpiece)

Three pieces, working as one — verified together by CI on every deploy:

1. **`tenant-context.ts`** binds `{ userId, orgId, roles, isStaff }` to the request via
   `AsyncLocalStorage`. Missing context ⇒ RLS predicates see NULL ⇒ **zero rows** (fail-closed).
2. **`prisma.service.ts`** wraps every domain query in a transaction that first runs
   `set_config('app.current_org'|…, …, true)` from that context.
3. **The RLS migrations** enable `FORCE ROW LEVEL SECURITY` on tenant tables with
   `USING (org_id = app_current_org() OR app_is_staff())`, and connect the app as a role **without
   BYPASSRLS**. Even a query missing a `WHERE` clause cannot cross tenants — the database refuses.

A cross-tenant read/write that succeeds **fails the build** (integration job, doc 06 §5). A
"negative RLS" test runs a scoped query with no context and asserts zero rows, guarding against a
policy defaulting open. Audit-log immutability is enforced by privilege (INSERT-only grant) *and*
a trigger.

## Deliverables

| Doc | Covers |
|-----|--------|
| [Build Plan & Conventions](01-build-plan-and-conventions.md) | How the skeleton is organized, coding conventions, how domain modules get added in Phases 6–8 |
| [Security Baseline](02-security-baseline.md) | The concrete controls live at v1 skeleton and the checklist Phases 6–8 inherit |

## Not in this phase (arrives with the features that need it)

Domain modules (identity flows, catalog, learning, commerce, engagements…) are Phases 6–8 — the
skeleton defines *where* they go and *how* they're bounded, not their business logic. Frontend
apps are scaffolded structurally (Phase 2 doc 02) and built out in Phase 6. Full OAuth/passkey/MFA
implementation is Phase 6 (identity module); the token/claim *shapes* and the authz gate are here.

## Approval checklist

- [ ] Monorepo tooling (pnpm/Turbo/strict TS) and the contracts-as-source-of-truth approach
- [ ] The tenant-isolation design as implemented (context + Prisma extension + RLS SQL)
- [ ] The `can()` authorization model and its deny-by-default policy table
- [ ] CI gate set (especially: isolation suite every deploy, i18n parity, security scans)
