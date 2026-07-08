# 06 — Multi-Tenancy & Data Isolation

The requirement that shapes this design: **client engagement data is the crown jewel** (NFR-021). A cross-tenant leak of pentest findings would end the company. Therefore isolation is enforced in the database, not only in application code. Decision record: ADR-004.

## 1. Tenancy model

- **Everything belongs to an organization.** Individual learners get a personal org (type `personal`, size 1) created at registration — one code path for entitlements, billing, and data scoping; no "null org" special cases scattered through the codebase.
- Org types: `personal`, `business` (corporate academy), `client` (services client), `internal` (INFOENC staff org). An org can be both `business` and `client` (the flywheel case) via capability flags rather than type explosion.
- **Shared-schema, shared-database** tenancy with `org_id` discriminator columns + Postgres **row-level security**. Full-schema-per-tenant and database-per-tenant were rejected for v1 (operational cost at 100k personal orgs is absurd); however, the design keeps a **tenant-pinning escape hatch**: the `org_id` scoping discipline means a future dedicated-instance Enterprise/government tenant (NFR-072 KSA residency) can be satisfied by replicating the stack per region and homing the org there — no schema redesign.

## 2. Data classes and their scoping

| Class | Examples | Scoping |
|---|---|---|
| Public content | catalog, blog, challenges | No RLS; published-state filter |
| User-private | progress, XP, attempts, notifications | `user_id` RLS (user context) |
| Org-scoped | seats, assignments, team reports, private leaderboards | `org_id` RLS |
| **Engagement-scoped (crown jewel)** | engagements, findings, evidence, reports, portal messages | `org_id` RLS **plus** engagement-contact ACL **plus** field-level encryption (NFR-020) **plus** separate S3 bucket with object-lock |
| Financial | subscriptions, invoices, payouts | `org_id` RLS + staff ABAC (finance role + MFA) |
| Platform-internal | audit log, outbox, automation traces | No tenant context; staff-only via ABAC; audit is append-only |

## 3. RLS mechanics

- App connects via PgBouncer as a **non-superuser role with no BYPASSRLS**; every pooled connection is initialized per-transaction with `SET LOCAL app.current_org / app.current_user / app.current_roles` from the verified JWT (Prisma client extension wraps every query in this context — it is impossible to run a domain query without tenancy context; missing context = policies evaluate to deny).
- Policies per protected table, e.g. conceptually: `USING (org_id = current_setting('app.current_org')::uuid)` with staff-scope variants for admin surfaces (staff access still row-logged via audit middleware).
- **Background jobs carry tenant context in the event payload** and re-establish it before touching data — a consumer processing org A's event physically cannot read org B's rows.
- Cross-org aggregates (leaderboards, analytics) run through dedicated read models built by consumers, never through RLS bypass on transactional tables.

## 4. Engagement data extra layers

1. **Field-level encryption** for finding bodies and evidence metadata: AES-256-GCM with per-engagement data keys wrapped by KMS (envelope pattern); keys never leave the crypto service module; crypto-shredding = drop the wrapped key on retention expiry (NFR-025).
2. **Evidence objects** in a dedicated bucket: per-org/per-engagement prefixes, deny-by-default bucket policy, presigned GETs ≤72h bound to a named user, every issuance audited (FR-CO-033); PDFs watermarked per recipient at render time.
3. **Automation boundary:** LLM context builders for engagement workflows accept an engagement ID and load only that engagement's rows through the same RLS context (doc 03 §5) — no free-form retrieval over engagement data.

## 5. Proving isolation (NFR-021 "tested per deploy")

- **Isolation test suite** (packages/testing): provisions two orgs + one engagement each, then attempts every read/write path (GraphQL, REST, WS subscriptions, presigned URL reuse, event replay with forged org context) cross-tenant and asserts deny. Runs in CI on every deploy, not per release.
- **Negative RLS test:** a canary test runs a query with deliberately missing tenant context and asserts zero rows — guards against a policy accidentally defaulting open.
- **Query-plan check in CI** for the hot paths to confirm RLS predicates use indexes (`org_id` leading composite indexes as a schema rule for Phase 3) — RLS correctness must not cost NFR-031 latency.
- Annual external pentest explicitly scopes cross-tenant attack scenarios (NFR-017).

## 6. Org context UX contract

The active org is explicit in the session (`org` claim): org switcher in academy/portal UIs; API requests are evaluated against the active org only. Switching orgs re-issues the access token — no request ever carries ambient access to multiple tenants (confused-deputy prevention).
