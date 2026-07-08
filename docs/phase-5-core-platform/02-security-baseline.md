# 02 — Security Baseline

The concrete security posture that exists at the skeleton stage, and the checklist Phases 6–8
inherit. INFOENC's platform is a trophy target (Phase 1 doc 08); the baseline is deliberately
stricter than typical SaaS.

## 1. Live at the skeleton

| Control | Where | Requirement |
|---|---|---|
| **Tenant isolation via RLS** | `prisma.service.ts` + RLS migrations + non-BYPASSRLS role | NFR-021 |
| **Fail-closed tenant context** | `tenant-context.ts` (missing ctx ⇒ zero rows) | NFR-021 |
| **Deny-by-default authorization** | `authz.service.ts` (`can()`; unknown action ⇒ deny) | NFR-005 |
| **Step-up for sensitive actions** | authz policies require `stepUpFresh` (refunds, evidence, impersonation) | doc 05 §5 |
| **Config validated at boot** | `config/env.ts` (refuses invalid/missing config) | NFR-015 |
| **Security headers** | helmet in `main.ts`; strict CSP at the app/edge layer | NFR-011 |
| **Audit-log immutability** | INSERT-only grant + `BEFORE UPDATE/DELETE` trigger | FR-AD-002 |
| **UUIDv7 IDs (no enumeration)** | `uuid_generate_v7()` migration | Phase 3 doc 01 §1 |
| **Secrets never in repo** | `.gitignore`, `.env.example` only, KMS key ids in config | NFR-015 |
| **CI security gates** | CodeQL SAST, dependency audit, gitleaks secret scan, isolation suite | NFR-016 |
| **Module boundaries** | dependency-cruiser (blast-radius containment) | ADR-001 |

## 2. Verified every deploy (not every release)

Per Phase 2 doc 06 §5, these run in the CI integration job on every push:
- **Tenant-isolation suite** — two orgs + an engagement each; every read/write path (GraphQL,
  REST, WS, presigned-URL reuse, event replay with forged org context) attempted cross-tenant and
  asserted denied.
- **Negative-RLS test** — a scoped query with no tenant context asserts zero rows.
- **Authz-matrix suite** — role × action × resource-state allow/deny (slice shipped this phase in
  `authz.service.spec.ts`).

A regression in any of these fails the build. Isolation is a continuously-tested property, not a
launch checkbox.

## 3. Inherited checklist for Phases 6–8

Every new module must, before merge:

1. **Carry `orgId` + register an RLS policy** for any new tenant-scoped table (via the
   `apply_org_rls` / `apply_user_rls` helpers), and add it to the isolation suite's coverage.
2. **Guard every mutation and sensitive read** through `authz.can()` with the right action, and add
   its cases to the authz-matrix suite.
3. **Validate all input at the boundary** with a contracts-derived zod DTO; parameterized queries
   only (Prisma) — no string-built SQL.
4. **Rate-limit** by endpoint sensitivity (auth, flag submission, payment, export get tighter
   tiers — NFR-013).
5. **Emit audit events** for admin/state-changing/data-export actions; **security events** for
   anomalies (NFR-023).
6. **Encrypt crown-jewel fields** (engagement findings/evidence) with the envelope pattern; never
   store plaintext (NFR-020). Automation touching that data records its `scopeRef` boundary.
7. **Ship both locales**; no raw keys; the i18n parity gate must pass.
8. **Meet the coverage floors** (money/entitlements/XP/authz ≥90% branch; Phase 1 doc 08 §7).

## 4. Deferred to the hardening phase (Phase 9)

- External penetration test (we test our own platform with our own methodology — NFR-017).
- Full WAF tuning, DDoS runbooks, DR exercise, load tests to NFR-033 targets.
- SIEM alerting rules maturation (the platform SOC — NFR-023).
- ISO 27001 control evidence collection (we must pass our own audit — NFR-074).

The baseline above is what makes those a *hardening* exercise rather than a *remediation* one:
the structural controls (isolation, authz, immutability, secrets) are in from the first line of
product code, so Phase 9 tunes and proves rather than retrofits.
