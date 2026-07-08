# 08 — Non-Functional Requirements

Cross-cutting requirements that constrain every architectural decision in Phase 2. A cybersecurity company's platform is a trophy target; several of these are stricter than typical SaaS norms on purpose — being breached is an existential brand event for INFOENC in a way it is not for a generic startup.

## 1. Security (NFR-001 … NFR-029)

### Identity & access
| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-001 | Zero-trust posture: every internal service call authenticated and authorized; no implicit trust by network location | M |
| NFR-002 | Auth: short-lived access tokens + rotating refresh tokens with reuse detection; session revocation propagates ≤60s | M |
| NFR-003 | Password policy per NIST 800-63B (length over composition rules, breach-corpus check); Argon2id hashing | M |
| NFR-004 | MFA available to all users, enforced for staff and org-admins; passkey support tracked as FR-AC-003 | M |
| NFR-005 | RBAC everywhere + ABAC for sensitive scopes; deny-by-default; permissions testable in CI | M |

### Application security
| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-010 | OWASP Top 10 + ASVS L2 baseline (L3 for auth, payment, client-portal modules) | M |
| NFR-011 | Hard security headers: strict CSP (no unsafe-inline), HSTS preload, frame-ancestors none (except embeds allowlist), referrer-policy | M |
| NFR-012 | CSRF protection on all state-changing browser endpoints; SameSite cookies | M |
| NFR-013 | Rate limiting tiered by endpoint sensitivity (auth, flag submission, payment) and by user/IP/ASN; WAF in front of all public surfaces | M |
| NFR-014 | Input validation at the boundary with typed schemas; output encoding; parameterized queries only | M |
| NFR-015 | Secrets in a manager (never env-files in repos); automated rotation for high-value credentials | M |
| NFR-016 | Dependency, container, SAST, and secret scanning in CI; critical vulns block deploy | M |
| NFR-017 | Annual external pentest + continuous internal testing (we test our own platform with our own methodology); public responsible-disclosure program | M |

### Data protection & tenancy
| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-020 | Encryption in transit (TLS 1.2+) and at rest; field-level encryption for engagement findings, evidence, and payment metadata | M |
| NFR-021 | Tenant isolation: org-scoped data access enforced at the data layer (not just application checks); automated cross-tenant access tests run per deploy — client engagement data is the crown jewel | M |
| NFR-022 | Lab isolation: lab networks can never reach production networks or other users' labs; egress from labs restricted and monitored | M |
| NFR-023 | Security monitoring: authentication anomalies, admin actions, lab abuse, data-export events feed a SIEM with alerting (FR-AU-053) | M |
| NFR-024 | Backups: encrypted, automated, cross-region; RPO ≤ 1h (transactional data), RTO ≤ 4h; restore tested quarterly | M |
| NFR-025 | Data retention & deletion policy per data class; user deletion cascades within 30 days with legal-hold carve-outs | M |

## 2. Performance & scalability (NFR-030 … NFR-045)

| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-030 | Core Web Vitals "good" on public + learning pages: LCP ≤ 2.5s, INP ≤ 200ms, CLS ≤ 0.1 at p75, both locales; Lighthouse ≥ 95 perf/SEO/a11y/best-practices on marketing pages | M |
| NFR-031 | API latency: p95 ≤ 300ms for reads, ≤ 600ms writes (excluding lab provisioning) | M |
| NFR-032 | Lab provisioning: browser lab interactive ≤ 25s p95; machine deploy ≤ 90s p95 | M |
| NFR-033 | Scale targets for architecture: 100k registered / 10k MAU / 500 concurrent lab sessions at v1; 10× headroom without redesign | M |
| NFR-034 | Video via CDN with adaptive bitrate; no self-hosted video from app servers | M |
| NFR-040 | Availability: 99.9% platform SLO; status page; labs may have separate 99.5% SLO | M |
| NFR-041 | Graceful degradation: lab subsystem failure never takes down learning content; payment provider outage falls back to alternate provider where possible | M |
| NFR-042 | Cost controls: per-tier lab quotas enforced platform-side; idle session reaping; infra cost per active learner tracked monthly against doc 03 margins | M |

## 3. Internationalization (NFR-050 … NFR-058)

| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-050 | Full ar (RTL) / en (LTR) support on every surface: web, emails, PDFs (invoices, certificates, reports), notifications | M |
| NFR-051 | RTL is a first-class layout, not a CSS flip: logical properties, mirrored iconography where meaning demands, bidi-safe mixed content (Arabic prose containing English code/terms) | M |
| NFR-052 | Locale-aware everything: dates (with Hijri display option), numbers, currency formatting per locale | M |
| NFR-053 | Language switch persists per user and never loses navigation state | M |
| NFR-054 | Translation workflow: keys never ship raw; missing-translation fallback + reporting dashboard | M |
| NFR-055 | SEO: hreflang pairs, locale-specific sitemaps, translated meta/OG per page | M |

## 4. Accessibility (NFR-060 … NFR-064)

| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-060 | WCAG 2.2 AA across the product; automated a11y checks in CI + manual audits on key flows | M |
| NFR-061 | Full keyboard operability including terminal/lab UI (with documented focus-trap behavior); visible focus states | M |
| NFR-062 | Reduced-motion support: all cinematic animation respects prefers-reduced-motion with dignified static fallbacks | M |
| NFR-063 | Screen-reader support in both languages; ARIA live regions for lab/task feedback | M |
| NFR-064 | Color-contrast-safe palettes in dark and light mode, verified in the design system (Phase 4) | M |

## 5. Compliance & privacy (NFR-070 … NFR-076)

| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-070 | GDPR + Saudi PDPL + Egypt PDPL alignment: lawful basis mapping, consent management, DSR (export/delete) within statutory windows | M |
| NFR-071 | PCI DSS SAQ-A posture: card data never touches INFOENC systems (provider-hosted fields/checkout) | M |
| NFR-072 | Data residency: architecture must support pinning enterprise/government tenant data to a designated region (KSA hosting option) even if v1 launches single-region | S |
| NFR-073 | Cookie consent + privacy-respecting analytics default | M |
| NFR-074 | ISO 27001 alignment from day one (we sell this consulting — we must pass our own audit); certification itself targeted year 2 | S |
| NFR-075 | AI transparency: automated decisions affecting users (moderation, fraud flags) are labeled, logged, and appealable to a human | M |

## 6. Operability (NFR-080 … NFR-086)

| ID | Requirement | Pri |
|----|-------------|-----|
| NFR-080 | Observability: structured logs, metrics, traces from day one (Prometheus/Grafana/Sentry per stack mandate); every user-facing error has a support-referenceable ID | M |
| NFR-081 | Infrastructure as code (Terraform) for all environments; no console-clicked resources | M |
| NFR-082 | CI/CD: trunk-based with preview environments; production deploys reversible ≤ 10 min (rollback tested) | M |
| NFR-083 | Environments: local (docker-compose), preview, staging, production with strict data separation (no production data in lower environments; synthetic seed data maintained) | M |
| NFR-084 | Disaster recovery runbook + business continuity plan; DR exercise before public launch and semi-annually | M |
| NFR-085 | On-call rotation with paging (FR-AU-062); incident severity matrix and comms templates (bilingual status updates) | M |

## 7. Quality gates (testing strategy baseline)

- Unit + integration coverage on money paths (billing, entitlements, XP, certificates) ≥ 90% branch; platform-wide line coverage target 75%.
- E2E suites for the top 10 journeys (doc 04) in both locales, run pre-deploy.
- Load tests against NFR-031/032/033 before launch and before marketing pushes.
- Security test suite: authz matrix tests, tenant-isolation tests, rate-limit tests — run per deploy, not per release.
- Chaos drill on lab-subsystem failure (NFR-041) before GA.
