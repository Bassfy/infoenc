# 01 — Security Hardening & Pentest Scope

The security work for launch. Because the structural controls are in from Phase 5, this is about
*proving* them under adversarial testing and closing the tuning gaps — not building security late.

## 1. What's already enforced (from Phase 5, verified every deploy)

| Control | Mechanism | Gate |
|---|---|---|
| Tenant isolation | Postgres RLS, non-BYPASSRLS app role | isolation + negative-RLS suites, per deploy |
| Authorization | `authz.can` deny-by-default + step-up | authz-matrix suite |
| Crown-jewel confidentiality | 4-layer: RLS + field encryption + authz + audit (Phase 7 doc 01) | isolation suite + encryption tests |
| Audit immutability | INSERT-only grant + trigger | privilege-level |
| Secrets hygiene | secrets manager, no repo secrets | gitleaks + secret-scan in CI |
| Dependency/SAST/container | CodeQL, audit, image scan | critical vulns block deploy |
| Rate limiting + bot defense | Redis tiers + Turnstile | per-endpoint |

Phase 9 does not re-implement these; it subjects them to an external attacker and a load profile.

## 2. External penetration test scope (NFR-017)

INFOENC sells pentests, so its own must be exemplary. The engagement (an independent third party,
plus our own team's continuous testing) scopes explicitly:

1. **Cross-tenant access** — the crown-jewel scenario. Attempt to read another org's findings,
   evidence, invoices, and progress via every surface (GraphQL, REST, WS subscriptions, presigned-URL
   reuse, forged JWT `org` claim, event replay). Expected result: denied at the database (RLS).
2. **AuthN/AuthZ** — token forgery/replay, refresh-family reuse, session fixation, privilege
   escalation, step-up bypass, IDOR on every resource id.
3. **Lab breakout** — from a lab session, attempt escape (gVisor), lateral movement to other sessions,
   egress to production/metadata, resource abuse. Expected: contained to the isolated VPC (ADR-008/009).
4. **Payment/webhook** — signature bypass, replay, price/coupon tampering, entitlement forgery.
5. **Evidence exfiltration** — bulk download, watermark stripping, expired-link reuse, cross-org link.
6. **App-layer OWASP Top 10 / ASVS L2** (L3 for auth, payment, portal) — injection, XSS (CSP),
   SSRF (esp. core-api → lab orchestrator/S3), deserialization, SSTI in report/PDF rendering.
7. **Automation abuse** — prompt injection to make a workflow read outside its `scopeRef` or fabricate
   a finding; verify the data boundary and no-fabrication rules hold (Phase 8).

**Exit criteria:** zero open High/Critical; all findings retested and verified fixed (using our own
retest workflow — dogfooding, Phase 7).

## 3. ASVS / OWASP checklist (the tuning gaps to close pre-GA)

- [ ] CSP has no `unsafe-inline`/`unsafe-eval`; nonce-based scripts verified in all three apps.
- [ ] All cookies `httpOnly` + `Secure` + correct `SameSite`; CSRF tokens on portal/admin forms.
- [ ] No sensitive data in logs (PII, tokens, finding bodies); log redaction verified.
- [ ] Error responses leak no stack traces/internal detail in production (support error-ID only).
- [ ] File upload: type/size validation, malware scan on evidence, no path traversal, no SVG-XSS.
- [ ] Markdown/user content sanitized through the single renderer (rehype-sanitize) — forum, lessons,
      writeups all covered.
- [ ] Password reset can't defeat MFA (email compromise alone insufficient — Phase 2 doc 05 §4).
- [ ] Admin surfaces: MFA enforced, IP-allowlist option, no public cache, impersonation fully logged.
- [ ] Data residency posture confirmed for the launch region (NFR-072).

## 4. Ongoing (post-GA)

- Annual external pentest + continuous internal testing (we test our own platform with our own
  methodology).
- Public responsible-disclosure program (FR-CO-007) live at launch.
- SIEM alerting matured — auth anomalies, lab abuse, bulk exports, admin actions feed the platform
  SOC (NFR-023); we dogfood the SOC service we sell.
- ISO 27001 control evidence collection begins (we consult on it — we must pass our own audit,
  NFR-074); certification targeted year 2.
