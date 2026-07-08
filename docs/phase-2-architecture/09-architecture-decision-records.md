# 09 — Architecture Decision Records

Format: each ADR states context, decision, alternatives rejected, consequences, and reversibility. Status is `Accepted` unless noted. These are the decisions a reviewer at Stripe/Vercel/Microsoft would interrogate; each is pre-answered.

---

## ADR-001 — Modular monolith, not microservices (for the core)

**Context.** Team of 3–6 engineers, 20+ functional domains (doc 03 §1), NFR-040 99.9% SLO. Microservices multiply operational surface (deploys, networking, distributed tracing, data consistency) that a small team pays for continuously.

**Decision.** One deployable `core-api` (+`core-worker` from the same codebase) organized as modules with **compiler- and lint-enforced boundaries** (dependency-cruiser + eslint-plugin-boundaries, module `public-api.ts` facades, event-based cross-module comms). Extract a service only when a domain has a genuinely distinct scaling profile, security domain, or failure domain.

**Rejected.** (a) Microservices from day one — premature distribution tax, violates "operable by few." (b) Unstructured monolith — becomes a big ball of mud; boundaries decay without enforcement.

**Consequences.** Fast local dev, single transaction across modules when needed, one deploy. Risk: boundary erosion — mitigated by CI enforcement that fails the build on cross-module internal imports.

**Reversibility.** High. Enforced module seams + event contracts mean a module can be lifted into a service later with its events already defined. The discipline now is what makes extraction cheap later.

---

## ADR-002 — pnpm + Turborepo monorepo

**Context.** Three frontends, two backends, many shared packages (contracts, ui, i18n, pdf) that must stay version-locked.

**Decision.** Single monorepo; pnpm workspaces; Turborepo for task graph + remote caching.

**Rejected.** Polyrepo (version-skew hell across shared contracts; atomic cross-cutting changes become multi-PR dances). Nx (heavier; Turborepo suffices).

**Consequences.** Atomic contract changes, shared config, one CI. Needs remote cache + affected-only builds to stay fast (configured).

**Reversibility.** Moderate — splitting a package out later is mechanical.

---

## ADR-003 — Next.js 15 (App Router, RSC) for all web frontends

**Context.** Marketing needs SSG/SEO/cinema; academy needs app-grade interactivity; admin needs dynamic SSR. i18n/RTL and performance budgets (NFR-030/050) are hard requirements.

**Decision.** Next.js 15 App Router across `web`, `academy`, `admin`; rendering posture per app (doc 04 §1).

**Rejected.** SPA (Vite/React) — fails SEO/LCP for marketing and content. Remix — viable, but Next's ecosystem, image/font pipeline, and edge OG rendering fit the mandate and hiring pool better.

**Consequences.** One framework, three deploy targets; RSC discipline (server fetches, client interacts).

**Reversibility.** Low-moderate — framework choice is load-bearing; mitigated by keeping domain logic in `services`, not apps.

---

## ADR-004 — Shared-schema multi-tenancy with Postgres RLS

**Context.** 100k+ personal orgs plus business/client orgs; engagement data is the crown jewel (NFR-021).

**Decision.** `org_id` discriminator + Row-Level Security enforced via a non-BYPASSRLS app role and per-transaction tenant context (doc 06). Personal accounts are orgs-of-one.

**Rejected.** Schema-per-tenant / DB-per-tenant (operationally absurd at 100k consumer tenants). App-code-only scoping (one missing `WHERE` = a breach; unacceptable for this data class).

**Consequences.** Isolation enforced in the database; every query needs tenant context (Prisma extension makes this automatic and fail-closed). RLS predicates must be indexed (Phase-3 rule).

**Reversibility.** Moderate — the `org_id` discipline is exactly what enables per-region dedicated instances for a future government tenant without a rewrite (NFR-072).

---

## ADR-005 — GraphQL for first-party, REST for third-party/webhooks

**Context.** Internal UIs are nested-read-heavy; external consumers and webhook providers speak REST/OpenAPI.

**Decision.** `/graphql` (persisted queries, depth/cost limits, DataLoader) for web/academy/admin; `/api/v1/*` REST (OpenAPI 3.1) for public API, enterprise export, and all inbound webhooks; WS for realtime.

**Rejected.** REST-only (over/under-fetch in dashboards; N+1 waterfalls). GraphQL-only (webhooks and simple partner integrations are worse in GraphQL; public introspection is an abuse surface).

**Consequences.** Two API styles, but one per audience with no overlap; both generated from the same zod contracts, so types stay unified.

**Reversibility.** High per-endpoint.

---

## ADR-006 — Build auth in-house on audited standard libraries

**Context.** Requirements: passkeys, TOTP, org-scoped RBAC/ABAC, refresh rotation with reuse detection, Arabic email flows, PDPL residency, staff step-up. Requirement set is unusually rich and security-brand-critical.

**Decision.** Own the auth service inside `identity`/`authz`, built on certified libraries (`openid-client`, `@simplewebauthn`, `otplib`, Argon2) — **not** rolling crypto, **not** outsourcing identity.

**Rejected.** Hosted identity (Auth0/Clerk/Cognito) — cost scales punishingly with a large free-tier user base, constrains the org/ABAC model and bilingual flows, and adds a residency dependency. Rolling our own crypto — never.

**Consequences.** More code to own and test (mitigated by the authz-matrix suite and standard libs). Full control over the exact model the product needs; no per-MAU identity bill.

**Reversibility.** Moderate — standard protocols (OIDC/SAML/WebAuthn) mean a future migration isn't a lock-in trap.

---

## ADR-007 — Redis + BullMQ for queues/cache/realtime (no Kafka)

**Context.** Need reliable async fan-out (outbox consumers), cache, rate limits, realtime pub/sub. Volumes at v1 scale (NFR-033) are well within Redis's envelope.

**Decision.** Redis for cache + rate-limit + pub/sub; BullMQ for job queues with per-domain queues and concurrency pools; transactional outbox as the source of truth for events.

**Rejected.** Kafka/Kinesis — event volumes don't justify the operational weight at v1; revisit if analytics/telemetry (MSSP ingestion) demands a real log. RabbitMQ — BullMQ on existing Redis is one fewer system to run.

**Consequences.** One infra dependency serves four needs. Outbox guarantees no lost events despite Redis being non-durable for the bus (Postgres is the durable record; Redis is delivery).

**Reversibility.** High — outbox pattern means swapping the bus (to Kafka) later is a relay change, not an app rewrite.

---

## ADR-008 — Dedicated lab cluster in a separate VPC, no peering

**Context.** Labs run hostile-by-design workloads (doc 07 threat model). A break-out must not reach production data.

**Decision.** Second EKS cluster in its own VPC with **no route** to the app VPC; the only bridge is the orchestrator's single mTLS API. Lab nodes are dedicated, tainted, short-lived.

**Rejected.** Labs as namespaces in the app cluster (a container escape lands in the same network as Postgres/S3 — unacceptable). Per-lab cloud accounts (operationally heavy at session scale; revisit for cloud-labs fast-follow).

**Consequences.** Network isolation is structural, not policy-dependent. Extra cluster to run — justified by being the one workload that genuinely warrants separation.

**Reversibility.** Low by design — this wall is meant to be permanent.

---

## ADR-009 — gVisor runtime + default-deny networking for lab pods

**Context.** Learner-controlled pods need sandboxing stronger than standard containers; kernel-exploit escapes must be contained.

**Decision.** gVisor (runsc) as the runtime for learner pods; per-session namespace; NetworkPolicy default-deny with only scenario-declared flows; blocked IMDS; egress via filtered logged proxy when required. Firecracker/Kata microVM pools as the documented upgrade for scenarios needing a real kernel.

**Rejected.** Standard runc containers (shared host kernel — one kernel 0-day = mass escape). Full VMs for every session (cost/startup at scale; reserved for scenarios that need it).

**Consequences.** Strong isolation at a modest syscall-overhead cost acceptable for lab workloads. Some kernel-level labs need the microVM path — planned.

**Reversibility.** High per-scenario (runtime is a scheduling choice).

---

## ADR-010 — Prisma as ORM with expand/contract migrations

**Context.** TypeScript-first data access; RLS requires per-transaction context; rollbacks must be safe (NFR-082).

**Decision.** Prisma with a client extension injecting tenant context per transaction (fail-closed); migrations follow expand/contract (backward-compatible) so a deploy and its rollback can share a schema state.

**Rejected.** TypeORM (weaker types, migration ergonomics). Raw SQL everywhere (loses type safety; RLS-context discipline harder to guarantee uniformly). Note: Prisma's RLS ergonomics are handled explicitly via the extension — a known sharp edge, addressed in Phase 3.

**Consequences.** Type-safe data layer, uniform tenant-context enforcement; some raw SQL for complex analytics (allowed via the read replica).

**Reversibility.** Moderate.

---

## ADR-011 — Meilisearch for search (rebuildable, not a source of truth)

**Context.** Bilingual search (ar tokenization, en) across catalog/labs/forum (FR-AC-131); must be operable by a small team.

**Decision.** Meilisearch, separate `*_ar`/`*_en` indexes, populated by queue consumers from Postgres; treated as a rebuildable cache.

**Rejected.** Elasticsearch/OpenSearch (heavier to operate; overkill at v1 volumes — but it's the SIEM store, so we run OpenSearch there, deliberately kept separate from product search). Postgres FTS (weaker Arabic support and relevance/typo-tolerance).

**Consequences.** Good bilingual relevance out of the box; a rebuild path if the index is lost. Two search systems (product vs. SIEM) with clearly separate purposes.

**Reversibility.** High — source of truth is Postgres; reindex anywhere.

---

## ADR-012 — Domain strategy: three subdomains, portal on the company site

**Context.** Distinct audiences and security postures for marketing, academy, admin; services clients are close to the company brand.

**Decision.** `infoenc.com` (company + `/portal`), `academy.infoenc.com`, `admin.infoenc.com`; shared SSO at `auth.infoenc.com`; shared `packages/ui`.

**Rejected.** Single app for everything (couples release cadence and security posture; a marketing experiment could destabilize the learning app). Separate domain for the academy (weakens brand unity and SEO consolidation; a subdomain keeps authority together with clear separation).

**Consequences.** Independent deploys and CSP/security postures per surface; unified brand via shared design system.

**Reversibility.** High.

---

## ADR-013 — AWS me-south-1 (Bahrain) primary, eu-central-1 DR

**Context.** Go-to-market beachhead is KSA/GCC/Egypt (Phase 1 doc 10); latency and data-residency posture matter (NFR-072).

**Decision.** Primary in me-south-1; DR in eu-central-1; Cloudflare global edge in front so the rest of the world still gets fast static delivery.

**Rejected.** us-east-1 primary (higher latency + worse residency story for the target market). Multi-region active-active at v1 (complexity unjustified before scale demands it; the RLS/`org_id` design leaves the door open — ADR-004).

**Consequences.** In-region MENA data, low regional latency; me-south-1 has fewer AZs and a smaller service menu than us-east-1 — accepted, and validated as sufficient for the v1 stack. A dedicated KSA-hosted tenant option (NFR-072) is reachable by homing an org's stack in-region later.

**Reversibility.** Moderate — region moves are real work, but the IaC (ADR: Terraform) makes standing up a new region a module instantiation.

---

## ADR-014 — Mobile via React Native (Expo), scaffolded now, built as fast-follow

**Context.** Mobile apps are a Phase-1 cutline (fast-follow, FR-AC-133), but choosing the approach now prevents a shared-logic fork later.

**Decision.** React Native (Expo) in `apps/mobile`; reuse `packages/contracts` (types/clients), `packages/i18n` (catalogs), and design tokens; scaffold the app + auth now so the fast-follow build isn't a cold start. Labs on mobile are console-only (view/light interaction), not full desktop sessions.

**Rejected.** Flutter (a second language/toolchain and a duplicate contracts layer for a TS-everywhere shop). Native iOS+Android separately (two more codebases for a small team). PWA-only (loses app-store presence and offline-lesson UX the mobile requirement calls for).

**Consequences.** Shared TypeScript contracts and i18n across web and mobile; one skill set. Expo's constraints accepted for v1 mobile scope.

**Reversibility.** Moderate — sharing contracts/i18n means even a later native rewrite keeps the API layer.

---

## Decision-to-requirement traceability

| ADR | Primary requirements served |
|-----|------------------------------|
| 001 | NFR-040 (operability), all FR (velocity) |
| 004, 006 | NFR-001/005/021 (zero-trust, RBAC/ABAC, tenancy) |
| 008, 009 | NFR-022, R1, R3 (lab isolation, cost, breach) |
| 003, 012 | NFR-030/050/055 (perf, i18n, SEO) |
| 007, 010 | FR-AC-060, NFR-082 (events/XP integrity, safe rollback) |
| 013 | NFR-072 (residency), doc 10 go-to-market |
| 014 | FR-AC-133 (mobile fast-follow) |
