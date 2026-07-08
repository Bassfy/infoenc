# 04 — Migration & Seed Strategy

## 1. Migration tooling

- **Prisma Migrate** generates SQL migrations from schema diffs; migrations are committed, reviewed, and applied in order. Production applies via `prisma migrate deploy` in the CD pipeline (Phase 2 doc 08 §5) — never `migrate dev` outside local.
- **Raw-SQL migrations** for anything Prisma can't express: RLS policies, the `uuid_generate_v7()` function, partial indexes, hash-chain triggers, GRANT statements. These live in the same migration directory as hand-authored `.sql` steps (Prisma supports `--create-only` then edit).

## 2. The expand/contract rule (ADR-010, NFR-082)

Every schema change is backward-compatible across one deploy so a rollback never hits a schema it can't read:

1. **Expand:** add the new column/table/index (nullable or defaulted); deploy. Old and new code both work.
2. **Migrate data:** backfill in a job, not a blocking migration (large tables).
3. **Switch:** deploy code that uses the new shape.
4. **Contract:** in a *later* deploy, drop the old column/constraint once no running version references it.

Destructive steps (DROP, NOT NULL tightening, type narrowing) never ship in the same release as the code that stops using the old shape. This is what makes "rollback ≤10 min, tested" real (Phase 2 doc 08 §5).

## 3. RLS bootstrap (the security-critical migration)

RLS is not in the Prisma schema (doc 01 §2); it's applied by hand-authored SQL migrations. The bootstrap migration:

1. Creates two roles: `infoenc_app` (the application role — **no BYPASSRLS**, no superuser) and `infoenc_migrator` (owns DDL, used only by `migrate deploy`).
2. For each tenant-scoped table: `ALTER TABLE … ENABLE ROW LEVEL SECURITY; FORCE ROW LEVEL SECURITY;` then a policy of the form
   `USING (org_id = current_setting('app.current_org', true)::uuid)`
   with `WITH CHECK` on writes, plus staff-scope policy variants for admin surfaces.
3. Grants `infoenc_app` only `SELECT/INSERT/UPDATE/DELETE` on data tables — **INSERT-only** on `audit_logs` (no UPDATE/DELETE, enforcing immutability at the privilege level, FR-AD-002).
4. Installs a `BEFORE UPDATE/DELETE` trigger on `audit_logs` that raises, as belt-and-braces beyond the missing grant.

The Prisma client extension (Phase 2 doc 06 §3) wraps every transaction with `SET LOCAL app.current_org/current_user/current_roles`. **The migration and the extension are two halves of one guarantee** — CI's tenant-isolation and negative-RLS tests (doc 06 §5) verify they hold together on every deploy.

## 4. `uuid_generate_v7()`

Postgres 16 has no native UUIDv7 yet, so the first migration installs a SQL/PLpgSQL `uuid_generate_v7()` (timestamp-prefixed, random tail — the standard implementation) used by every model's `@default(dbgenerated(...))`. When the deployment's Postgres gains native v7, the function becomes a thin wrapper — no schema change to models. `pgcrypto` provides the random bytes; both extensions are declared in `schema.prisma`.

## 5. Seed strategy (bilingual, synthetic — NFR-083)

Seeds are **code, not SQL dumps**, run through the real domain services so they exercise production code paths and stay valid as the schema evolves. Layered:

| Layer | Contents | Used in |
|---|---|---|
| `reference` | Plans + prices (all currencies), ranks, badges, roles, categories, framework/compliance taxonomies | every environment (these are semi-static platform data) |
| `demo` | 6 paths, ~40 courses, ~60 labs, CTF challenges, forums — **fully bilingual ar/en**; demo orgs (personal, business, client), a sample engagement with synthetic findings | local, preview, staging |
| `load` | Generated bulk users/progress/sessions for k6 load tests (NFR-033) | staging load runs only |

Hard rules:
- **No production data ever seeds a lower environment** (Phase 2 doc 08 §4). The `demo` layer is invented, not anonymized-real, so there's no leakage path.
- Every seeded content item has both `ar` and `en` translations — the seed is itself a test of the bilingual pipeline and the CI locale-parity gate.
- The demo engagement's findings are obviously fake ("Example Corp") — evidence-encryption and portal-isolation paths get exercised without any real client data existing.
- Seed is idempotent (upsert by business key) so re-running is safe.

## 6. Indexing & performance validation

- Composite indexes lead with `orgId` on tenant tables (doc 01 §6) so RLS predicates stay indexed.
- A CI step runs `EXPLAIN` on the hot queries (leaderboard reads bypass to Redis, but catalog listing, dashboard, findings feed, ticket queue are checked) and fails if a sequential scan appears on a tenant table (Phase 2 doc 06 §5).
- `pg_trgm` (declared in schema) backs fuzzy fallback search and ILIKE admin lookups; primary search is Meilisearch (ADR-011).

## 7. Backup/restore alignment (NFR-024)

Migrations are forward-only in production; PITR + the tested quarterly restore (Phase 2 doc 08 §7) is the recovery path, not down-migrations. Down-migrations exist for local/preview convenience only and are never relied on in prod — the expand/contract discipline (§2) is the production safety mechanism.
