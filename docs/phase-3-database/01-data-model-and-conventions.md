# 01 — Data Model Overview & Conventions

Every table in the schema obeys these rules. They exist so a schema spanning ~90 tables and 20 modules stays coherent, RLS-safe, and performant as it grows.

## 1. Identifiers

- **Primary keys are UUIDv7** (`@id @default(dbgenerated("uuid_generate_v7()"))`), stored as `uuid`. Rationale: globally unique (no cross-region collisions on the ADR-004 residency path), time-sortable (index locality like an autoincrement without the enumeration leak), safe to expose in URLs.
- **No sequential integer PKs exposed anywhere.** The MVP's `INT AUTO_INCREMENT` leaked enumeration; gone.
- **Human-facing identifiers are separate columns:** `slug` (content), `certificateNumber`, sequential per-jurisdiction `invoiceNumber` — these are business keys with their own uniqueness and generation rules, never the PK.

## 2. Tenancy (the load-bearing convention — doc 06)

- Every tenant-scoped table has **`orgId String @db.Uuid`** and a relation to `Organization`.
- **The leading column of the primary lookup index is `orgId`** (e.g., `@@index([orgId, status, createdAt])`), so RLS predicates (`org_id = current_setting('app.current_org')`) always ride an index — RLS correctness must not cost latency (NFR-031).
- Non-tenant tables (global catalog, platform-internal) are explicitly listed in doc 05 and carry no `orgId`.
- RLS policies are **not expressible in Prisma schema**; they live in migration SQL (doc 04 §3). The Prisma client extension sets tenant context per transaction; the schema's job is to make every scoped table *carry* `orgId` so policies can attach.

## 3. Timestamps & lifecycle

- `createdAt DateTime @default(now())` and `updatedAt DateTime @updatedAt` on every mutable table.
- **Soft delete via `deletedAt DateTime?`** on user-generated and content tables (recoverable, audit-friendly); hard delete on ephemeral rows (sessions, rate counters, expired tokens) and on legally-mandated erasure (doc 05 DSR).
- Soft-deleted rows are excluded by a Prisma middleware default scope; queries that need them opt in explicitly.
- Timestamps are `timestamptz`, always UTC in storage; locale/timezone formatting is a presentation concern (Phase 2 doc 04 §3).

## 4. Bilingual content (NFR-050 — the model that avoids schema churn)

Content that must exist in Arabic and English uses a **translation-row pattern**, not paired columns:

```
ContentEntity (id, slug, status, … language-neutral fields …)
  └─ ContentTranslation (id, entityId, locale, title, body, …)
       @@unique([entityId, locale])
```

Why not `title_ar`/`title_en`:
- A third locale (French for North Africa, later) is a data row, not a migration.
- Translation completeness is queryable (`FR-AD-031` completeness board) — "which entities lack `ar`?" is a `LEFT JOIN`, not a scan of nullable columns.
- The CI locale-parity gate (Phase 2 doc 02 §2.5) checks UI strings; this pattern makes *content* parity a first-class query.

Language-neutral fields (slug, difficulty, price, ordering, media that isn't localized) stay on the parent. Fallback logic (show `en` when `ar` missing, with a notice — FR-AC-029) is application-layer over these rows.

## 5. Money & integrity-critical data

- **Currency amounts are integer minor units** (`Int`/`BigInt`, e.g., cents/halalas) with an explicit `currency` (ISO 4217) column — never `Float`, never `Decimal` implicitly (avoids rounding drift; matches Stripe's model).
- **XP is an append-only event log** (`XpEvent`), never a mutable counter as the source of truth. A user's XP total is a maintained read model (`UserProgressSummary`) rebuilt from events — the MVP's `users.points` counter is exactly the integrity anti-pattern we're removing (FR-AC-060 idempotency/audit AC).
- **Invoices are immutable ledgers:** issued rows never mutate; corrections are credit notes (doc 03 commerce, FR-AD-042).
- **Payments and webhook effects are idempotent:** unique `idempotencyKey` / `providerEventId` columns make replays no-ops (Phase 2 doc 03 §4).

## 6. Indexing rules

1. Every foreign key used in lookups gets an index (Prisma doesn't auto-create FK indexes on Postgres).
2. Tenant-scoped tables lead composite indexes with `orgId` (§2).
3. Uniqueness constraints on business keys: `(orgId, slug)`, `(userId, courseId)` enrollment, `(userId, locale)` etc. — the MVP's unique keys carry forward, now tenant-aware.
4. Partial indexes for hot filtered reads (e.g., `WHERE status = 'published' AND deletedAt IS NULL`).
5. Leaderboards, catalog listings, and dashboard aggregates are served from read models / Redis, not from wide scans of transactional tables (Phase 2 doc 01 §4).

## 7. Enums vs. lookup tables

- **Enums** for closed, code-coupled sets (`OrgType`, `SubscriptionStatus`, `Difficulty`, `FindingSeverity`) — in `enums.prisma`.
- **Lookup tables** for sets that admins extend at runtime (categories, tags, ranks, badge definitions) — data, not code.

## 8. JSON columns — deliberate, not lazy

The MVP used `JSON` liberally (`tags`, `options`, `answers`, `metadata`). Policy here:
- JSON (`Json`) is allowed for genuinely schemaless or provider-shaped data: quiz answer payloads, automation run traces, webhook raw bodies, notification metadata, flexible content blocks.
- JSON is **not** allowed where relational integrity or querying matters: tags become a `Tag` table + join (filterable), quiz options become `QuizOption` rows (orderable, translatable). Every JSON column has a zod schema in `packages/contracts` (Phase 2 doc 02 §2.2) — "schemaless in Postgres" still means "typed in the app."

## 9. Referential actions

- `onDelete: Cascade` only where the child is meaningless without the parent (translations, quiz options, session rows).
- `onDelete: Restrict`/`SetNull` where deletion should be blocked or preserved (an instructor with published courses can't be hard-deleted; a category deletion nulls course FKs).
- Crown-jewel data (engagements/findings) is **never cascade-deleted** by user action — retention/legal-hold governs it (doc 05).

## 10. Naming

- Models `PascalCase` singular (`Course`); fields `camelCase`; DB tables/columns `snake_case` via `@@map`/`@map` (Postgres convention). Join tables named for the relationship (`CourseTag`, `OrgMembership`).
- Boolean fields read as assertions (`isPublished`, `emailVerified`), matching the MVP's readable style where it was good.
