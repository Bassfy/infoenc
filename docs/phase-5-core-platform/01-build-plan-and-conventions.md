# 01 — Build Plan & Conventions

How the skeleton is organized and the rules Phases 6–8 follow when they add domain modules.

## 1. Anatomy of a domain module

Every domain module (identity, catalog, learning, commerce, engagements, …) follows one shape so
the codebase stays predictable and its boundaries stay enforceable (Phase 2 doc 03 §1):

```
src/modules/<domain>/
├── <domain>.module.ts        # Nest module: providers, controllers/resolvers, queue processors
├── public-api.ts             # THE only surface other modules may import (facade + types)
├── <domain>.service.ts       # domain logic; uses prisma.tenant (RLS-scoped) for data
├── <domain>.resolver.ts      # GraphQL (first-party) — persisted queries, DataLoader
├── <domain>.controller.ts    # REST (public/partner/webhooks) when the domain exposes it
├── dto/                       # nestjs-zod DTOs derived from packages/contracts (no ad-hoc shapes)
├── events/                   # outbox emitters + queue consumers for this domain
└── <domain>.spec.ts          # unit + authz-matrix cases for this domain
```

**Rules the boundary linter enforces (`.dependency-cruiser.cjs`, fails CI):**
- A module imports another module only through its `public-api.ts` — never its internals.
- Cross-module side effects go through **events** (outbox → BullMQ), not direct calls, unless a
  synchronous facade call in the same transaction is genuinely required.
- `platform/` depends on nothing in `modules/`.
- No circular dependencies.

This is what keeps "modular monolith" (ADR-001) true as the codebase grows to 20 modules.

## 2. Data access convention

- Domain services use **`prisma.tenant`** (the RLS-scoped client) for all tenant data — never the
  base client. The base client is for genuinely context-free reads (auth lookups, public catalog).
- **Never** hand-write a raw `WHERE org_id = …`; RLS does the scoping. Adding such a clause is a
  smell (it implies distrust of RLS) and is flagged in review.
- Money is `money` from contracts (integer minor units + currency). Percentages/progress are `bps`.
- Every state change others care about emits an **outbox event** in the same transaction (never a
  post-commit publish — that's the dual-write bug the outbox exists to prevent).

## 3. API convention

- **First-party UI → GraphQL** (`/graphql`, persisted queries only in prod, depth/cost limits,
  DataLoader per request). Resolvers are thin; logic lives in services.
- **World → REST** (`/api/v1`, OpenAPI from zod). All inbound webhooks are REST with idempotency
  keys.
- Every DTO derives from a `packages/contracts` zod schema via `nestjs-zod` — one schema becomes
  validation + OpenAPI + client types. No shape is defined twice.
- Errors use the shared envelope (`errorEnvelope`): stable machine `code`, localized `message`,
  support-referenceable `errorId`.

## 4. Coding conventions

- TypeScript **strict** + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` (base tsconfig).
  The compiler is a design tool, not a formality.
- Files read like the code around them; comment density matches the domain's complexity.
- Public functions and non-obvious invariants get a comment stating the *why* (the tenant-context
  fail-closed behavior is the model: the code says what, the comment says why it's safe).
- Tests live beside the code (`*.spec.ts` unit; `test/` integration). Money paths, entitlements,
  XP, and authz require the coverage floors in Phase 1 doc 08 §7.

## 5. How Phases 6–8 consume this skeleton

| Phase | Adds |
|-------|------|
| **6 Academy** | identity (full OAuth/passkey/MFA), orgs, catalog, learning, gamification, labs (metadata), commerce, community, career modules; the `academy` + `web` Next.js apps; browser-lab integration with the orchestrator |
| **7 Company** | crm, engagements (crown-jewel, field encryption), support modules; the client portal on `web`; the admin engagement/report tooling |
| **8 Automation** | automation module (workflow engine, LLM gateway, gate queues); the FR-AU catalog in priority order |

Each new module: define its contracts first (`packages/contracts`), scaffold the module in the
shape above, wire events, add RLS policies for any new tenant tables (following the
`apply_org_rls` / `apply_user_rls` helpers), and register in `app.module.ts`. The boundary linter,
isolation suite, and authz-matrix suite catch regressions automatically.

## 6. Local development

`pnpm infra:up` (docker-compose) then `pnpm dev` (Turbo runs core-api + apps). `pnpm prisma:deploy`
applies the RLS bootstrap + schema; `pnpm db:seed` loads synthetic bilingual data (Phase 3 doc 04
§5). Target: **clone-to-running under 15 minutes** (Phase 2 doc 02 §4) — onboarding speed is a
bus-factor mitigation (R10).
