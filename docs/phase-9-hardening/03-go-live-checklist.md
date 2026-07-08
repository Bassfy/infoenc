# 03 — Go-Live Checklist

The launch gate. Every item is green before GA, with an owner and evidence. Ordered by "would block
launch" severity. This is the artifact stakeholders sign.

## Security (blocking)

- [ ] **External penetration test passed** — no open High/Critical; cross-tenant + evidence
      exfiltration scenarios explicitly scoped (NFR-017, doc 01). Retest of any findings verified.
- [ ] **Tenant-isolation + negative-RLS suites green** on the release build (already CI-gated every
      deploy, Phase 5 doc 06 §5).
- [ ] **Authz-matrix suite green** (role × action × resource-state).
- [ ] **Secrets audit** — no secrets in repo/images; all from the secrets manager; rotation configured
      (NFR-015). Gitleaks + secret-scanning clean.
- [ ] **CI security gates enforced** — CodeQL/SAST, dependency audit (no High/Critical), container
      scan block deploy (NFR-016).
- [ ] **Security headers live** — strict CSP (no unsafe-inline), HSTS preload, frame-ancestors, on all
      surfaces (NFR-011); verified with an external header scanner.
- [ ] **Responsible-disclosure page + security.txt + PGP key** published (FR-CO-007).

## Reliability (blocking)

- [ ] **Load tests meet NFR-031/032/033** on staging — k6 thresholds green (reads p95 ≤300ms, writes
      ≤600ms, lab provision ≤25s, 500 concurrent).
- [ ] **DR exercise completed** — region failover rehearsed within RTO ≤4h; restore verified (doc 02).
- [ ] **Backup restore tested this quarter** (NFR-024).
- [ ] **Rollback rehearsed** — a production deploy rolled back in ≤10 min on staging (NFR-082).
- [ ] **SLOs + burn-rate alerts live** and routing to on-call (doc 04); status page driven by real
      probes.
- [ ] **On-call rotation active** with escalation + bilingual comms templates (NFR-085).

## Performance & SEO (blocking for marketing surfaces)

- [ ] **Core Web Vitals "good" at p75**, both locales (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1) — NFR-030.
- [ ] **Lighthouse ≥95** perf/a11y/SEO/best-practices on marketing pages, both locales.
- [ ] **SEO surfaces live** — robots, per-locale sitemaps, hreflang pairs, JSON-LD (NFR-055).
- [ ] **OG/Twitter cards** render for shareable content (cert/badge cards, blog).

## Accessibility & i18n (blocking)

- [ ] **WCAG 2.2 AA** — axe-core clean on the top-10 journeys, both locales, both themes (NFR-060).
- [ ] **i18n parity gate green** — no untranslated keys (already CI-gated, Phase 6).
- [ ] **RTL verified** on the top journeys — bidi-safe mixed content, no left/right leakage (doc 04 §4).
- [ ] **Reduced-motion** dignified fallbacks on all cinematic surfaces (NFR-062).

## Content & product (blocking per Phase 1 R2)

- [ ] **≥6 complete bilingual learning paths** and **≥60 labs** published (content floor).
- [ ] **Free-tier lab quotas + cost controls verified** — free tier cannot exceed the margin model
      (FR-AC-096, NFR-042); cost-per-learner telemetry live.
- [ ] **Payments end-to-end** in staging — Stripe + PayPal checkout, webhook idempotency, invoice PDF
      (both locales), refund path.
- [ ] **Certificate verification** works publicly (bilingual PDF, unguessable URL) — FR-AC-065.
- [ ] **Client portal** — findings feed RLS-scoped, evidence download attributed + watermarked, report
      delivery approval-gated (Phase 7).

## Compliance & legal (blocking)

- [ ] **Privacy policy, terms, cookie consent** live, both locales; PDPL/GDPR DSR flows work (NFR-070).
- [ ] **DSR export + deletion** tested end-to-end with the legal carve-outs (Phase 3 doc 05 §3).
- [ ] **PCI SAQ-A posture confirmed** — no card data touches our systems (NFR-071).
- [ ] **Tax + invoicing** correct per launch jurisdiction (KSA 15% etc.); sequential legal numbering
      (FR-AD-042).

## Operations (blocking)

- [ ] **Runbooks published** — DR, incident, on-call (doc 02).
- [ ] **Observability complete** — traces/metrics/logs, error IDs surfaced to support (NFR-080).
- [ ] **Automation human-gates staffed** — the review queue has owners; no workflow is auto without an
      earned autonomy record (Phase 8).
- [ ] **Chat-ops** — deploy/alert/big-signup notifications wired (FR-AU-063).

## Sign-off

| Area | Owner | Evidence link | Green? |
|---|---|---|---|
| Security | CTO/CISO | pentest report, CI runs | ☐ |
| Reliability | SRE | load-test + DR reports | ☐ |
| Perf/SEO/a11y | Product | Lighthouse + axe reports | ☐ |
| Content | Content lead | catalog counts | ☐ |
| Compliance | Legal/Finance | policy + DSR evidence | ☐ |

**All green = authorized for GA.**
