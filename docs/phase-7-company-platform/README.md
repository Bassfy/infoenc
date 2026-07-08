# Phase 7 — Company Platform

**Status:** In progress (crown-jewel core + CRM intake landed; portal/report tooling iterative)
**Baseline:** Phases 1–6. Reuses the Phase 6 `CryptoService`, auth pipeline, RLS, outbox, authz gate.
**Approval gate:** Sign-off on the engagements security model before continuing portal/report tooling.

---

## Objectives

Build the services side: the lead-to-engagement pipeline (CRM), the **engagements module** —
INFOENC's crown-jewel data — and the client portal surface. The engagements work is the
highest-stakes code in the platform: a cross-tenant leak of pentest findings is an
existential-brand event (Phase 1 R3), so this phase is where every security control converges.

## What landed (real code)

| Slice | Status | What's real |
|-------|--------|-------------|
| **engagements — findings** | ✅ | Finding creation with **field-level encrypted bodies** (AES-256-GCM via CryptoService); authorized publish (`staff:consultant` + same-org via `authz.can`); severity-driven events (critical/high → immediate-alert flag, FR-CO-032); decrypt only for authorized readers; client sees only published findings. |
| **engagements — evidence** | ✅ | Attributed, watermarked, ≤72h presigned downloads; **every issuance logged immutably** (who/when/ip); step-up required; bulk-export rate limit that raises a security event (NFR-023); envelope-wrapped data keys (crypto-shred on delete). |
| **engagements — management** | ✅ | RLS-scoped engagement list + the **portal findings feed** with severity rollup (FR-CO-032). |
| **CRM — lead intake** | ✅ | Scoping-form → lead with source attribution → **qualification scoring** (pure, verified) → routing (hot→consultant / warm→nurture / cold→newsletter) → `crm.lead.created` for the FR-AU-010 automation. |
| proposals · report assembly · portal UI · retest workflow | 🔩 scaffolded | Schema + module boundaries in place; report assembly is a Phase 8 automation (FR-AU-050); portal UI rides the `web` app. |

## The crown-jewel security model (why this is the phase that matters)

A finding's confidentiality is defended in **four independent layers**, so a single failure doesn't
breach it:

1. **Tenant isolation (RLS).** `finding.service.ts` reads via `prisma.tenant` — the query is scoped
   to the actor's org by Postgres row-level security. A client contact literally cannot express a
   query that returns another org's findings (Phase 5 / doc 06). Verified per deploy by the
   isolation suite.
2. **Field-level encryption.** The finding body is AES-256-GCM ciphertext at rest (`bodyCipher`),
   decrypted only in `readBody` for an authorized reader (NFR-020). A database dump yields
   ciphertext, not vulnerabilities.
3. **Authorization.** Publish and evidence access route through `authz.can` — `staff:consultant` +
   same-org for publish, engagement contact + **step-up MFA** for evidence download (doc 05 §5).
4. **Auditability + least exposure.** Findings are invisible until a consultant publishes; every
   evidence download is attributed and immutably logged; bulk pulls trip a security event.

No single control is trusted alone. RLS could have a policy bug → encryption still protects the
body. Encryption keys could leak → RLS + authz still deny access. This is defense-in-depth applied
to the data that would end the company if it leaked.

## Verified this phase

- **Lead scoring** run against all spec cases — **passes** (cold→0, hot→70/75, warm→50, clamp→100).
- The Phase 6 **CryptoService** (which protects finding/evidence bodies) was verified round-trip +
  tamper-detection in Phase 6.
- Prisma schema validates.

## Deliverables doc

| Doc | Covers |
|-----|--------|
| [Crown-Jewel Security Model](01-crown-jewel-security.md) | The four-layer defense in depth, the threat model it answers, and the test strategy |

## Approval checklist

- [ ] The four-layer engagements security model (RLS + FLE + authz + audit)
- [ ] Evidence handling (attribution, watermark, expiry, step-up, bulk-export alerting)
- [ ] The lead scoring/routing model (transparent, testable — NFR-075)
