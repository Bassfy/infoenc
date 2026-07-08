# Phase 9 — Hardening & Launch

**Status:** Awaiting stakeholder approval (launch gate)
**Baseline:** Phases 1–8. The structural security controls are already in from Phase 5; Phase 9
*proves and tunes* them rather than retrofitting.
**Approval gate:** This is the **GA sign-off gate** — the last gate before public launch.

---

## Objectives

Turn a feature-complete platform into a *launchable* one: prove the NFR baseline under real load and
adversarial testing, rehearse failure, and close the SEO/perf/content gaps — then go live.

The Phase-5 security baseline (doc 05 §4) said the structural controls (tenant isolation, authz,
audit immutability, secrets, RLS) are in from the first line of product code, so Phase 9 is a
**hardening exercise, not a remediation one**. This phase is where that claim gets tested.

## What landed (real code)

| Artifact | Purpose |
|----------|---------|
| `infra/load/k6-academy.js` | Load test to the NFR-031/032/033 targets (p95 read ≤300ms, write ≤600ms, lab provision ≤25s, 500 concurrent) — thresholds fail the run on regression |
| `.github/workflows/deploy-production.yml` | Progressive rollout (canary → SLO analysis → promote) with automated rollback, image signing + SBOM, expand/contract migrations (NFR-082) |
| `apps/web/src/app/robots.ts`, `sitemap.ts` | robots + hreflang sitemap; blocks portal/admin/auth from indexing (NFR-055) |
| `apps/web/src/lib/structured-data.ts` | Schema.org JSON-LD (Organization, Service, Course) generated from content |

## Deliverables

| Doc | Covers |
|-----|--------|
| [Security Hardening & Pentest Scope](01-security-hardening.md) | The external-pentest scope, the CI security gates already live, and the ASVS/OWASP checklist |
| [DR & Incident Runbook](02-dr-and-incident-runbook.md) | Backup/restore, region-failure recovery, incident severity matrix + comms |
| [Go-Live Checklist](03-go-live-checklist.md) | The launch gate — everything that must be green before GA |
| [SLOs & Alerting](04-slos-and-alerting.md) | Service SLOs, error budgets, burn-rate alerts |

## The launch gate (summary — full checklist in doc 03)

Nothing ships to GA until:

- [ ] **External pentest passed** (NFR-017) — cross-tenant + evidence-exfiltration scenarios scoped (doc 01)
- [ ] **Load tests meet NFR-031/032/033** on staging (k6, green thresholds)
- [ ] **Tenant-isolation + authz suites green** every deploy (already CI-gated from Phase 5)
- [ ] **DR exercise completed** — region failover rehearsed, restore verified (NFR-024/084, doc 02)
- [ ] **Core Web Vitals green** at p75, both locales; Lighthouse ≥95 on marketing (NFR-030)
- [ ] **Content floor met** — ≥6 complete bilingual paths, ≥60 labs (Phase 1 R2)
- [ ] **SEO surfaces live** — robots, sitemaps, JSON-LD, hreflang (NFR-055)
- [ ] **Status page + on-call rotation** active; alerts firing to the right place (doc 04)
- [ ] **Backup restore tested** this quarter (NFR-024)

## What Phase 9 does NOT do

- It doesn't add product features — that's Phases 6–8.
- It doesn't build the fast-follows (mobile, cloud labs, marketplace) — that's Phase 10.
- It assumes the security controls exist (they do, from Phase 5) and *verifies* them.

## Approval checklist

- [ ] The pentest scope (doc 01) and the go-live gate (doc 03)
- [ ] The DR/incident runbook (doc 02) and a scheduled pre-GA DR exercise
- [ ] The SLO targets and alert routing (doc 04)
