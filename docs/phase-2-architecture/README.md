# Phase 2 — System Architecture

**Status:** Awaiting stakeholder approval
**Baseline:** Phase 1 requirements package (approved). Every decision here traces to FR/NFR IDs from Phase 1.
**Approval gate:** Sign-off on the architecture and ADRs before Phase 3 (Database Design) begins.

---

## Objectives

1. Define a system structure that a team of 3–6 engineers can actually build and operate, while meeting the NFR baseline (99.9% SLO, tenant isolation, lab isolation, 10× scale headroom — NFR-021/022/033/040).
2. Fix the decomposition: which applications exist, which services exist, where the boundaries are, and why.
3. Lock the cross-cutting mechanics every later phase depends on: auth, multi-tenancy, API strategy, events/jobs, i18n plumbing, observability.
4. Design the lab infrastructure — the highest-risk, highest-cost subsystem (R1, R3) — with security isolation as the first constraint.
5. Record every consequential decision as an ADR with alternatives and reversibility noted.

## Deliverables in this package

| # | Document | Covers |
|---|----------|--------|
| 01 | [Architecture Overview](01-architecture-overview.md) | Principles, system context, container view, request flows |
| 02 | [Monorepo & Code Structure](02-monorepo-and-code-structure.md) | Full folder structure, package boundaries, tooling |
| 03 | [Backend Architecture](03-backend-architecture.md) | NestJS module map, API strategy (REST/GraphQL), events, jobs, search, storage |
| 04 | [Frontend Architecture](04-frontend-architecture.md) | Next.js apps, rendering strategy, i18n/RTL plumbing, state, performance budgets |
| 05 | [Auth & Authorization](05-auth-and-authorization.md) | Identity, tokens, OAuth, passkeys, MFA, RBAC/ABAC, org context |
| 06 | [Multi-Tenancy & Data Isolation](06-multi-tenancy-and-data-isolation.md) | Tenancy model, Postgres RLS, isolation testing |
| 07 | [Lab Infrastructure](07-lab-infrastructure.md) | Orchestration, isolation layers, terminal/desktop delivery, VPN, quotas, cost reaping |
| 08 | [Infrastructure & Delivery](08-infrastructure-and-delivery.md) | AWS/Cloudflare topology, Terraform, Kubernetes, CI/CD, environments, observability, DR |
| 09 | [Architecture Decision Records](09-architecture-decision-records.md) | ADR-001 … ADR-014 |

## The architecture in one paragraph

INFOENC runs as a **pnpm/Turborepo monorepo** producing three Next.js applications (company site, academy, admin) and two NestJS backends: the **core API** — a modular monolith owning identity, catalog, learning, gamification, commerce, CRM, engagements, support, and automation — and a separately deployed **lab orchestrator** that is the only component allowed to touch the isolated lab Kubernetes cluster. PostgreSQL (with row-level security for tenant isolation) is the system of record; Redis carries cache, queues (BullMQ), rate limits, and realtime fan-out; S3-compatible storage holds objects; Meilisearch serves bilingual search; Cloudflare fronts everything (DNS, CDN, WAF, Stream for video). Frontends talk GraphQL to the core API; public/partner surfaces and webhooks are REST with OpenAPI. Everything deploys to AWS EKS via Terraform + GitHub Actions with preview/staging/production environments.

## What would Stripe/Apple/Vercel/Microsoft push back on — pre-answered

- *"Why not microservices?"* — ADR-001. A 5-person team operating 20 services fails NFR-040 in practice. The monolith is modular with enforced boundaries; the two genuinely different workloads (lab orchestration, and later MSSP telemetry) are already separate.
- *"Why build auth in-house?"* — ADR-006. Passkeys + MFA + org-scoped RBAC/ABAC + Arabic email flows + PDPL data residency make hosted identity (Auth0 class) both expensive and constraining; we build on audited standard libraries, not from cryptographic scratch.
- *"Why both REST and GraphQL?"* — ADR-005. One protocol per audience, not two protocols for the same job: GraphQL for our own frontends, REST for the world.
- *"Biggest risk?"* — the lab cluster. Hence doc 07 treats it as a hostile-workload platform first and a product feature second.

## Approval checklist

- [ ] Monolith-first decomposition and the two-backend split (ADR-001, ADR-008)
- [ ] Domain strategy: `infoenc.com`, `academy.infoenc.com`, `admin.infoenc.com` (ADR-012)
- [ ] In-house auth on standard libraries (ADR-006)
- [ ] Postgres RLS as the tenant-isolation mechanism (ADR-004)
- [ ] Lab isolation stack: dedicated cluster + gVisor + per-session namespaces + default-deny networking (ADR-008/009)
- [ ] AWS me-south-1 (Bahrain) as launch region with eu-central-1 DR (ADR-013)
