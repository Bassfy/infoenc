# 01 — Crown-Jewel Security Model

The engagements module holds the data whose leak would end INFOENC: client vulnerabilities,
exploitation evidence, and pentest reports. This document is the concrete defense-in-depth model as
implemented, the threat model it answers, and how it is tested. It is also the artifact an
enterprise client's security team (and our own ISO 27001 audit — NFR-074) will ask to see.

## 1. Threat model

What we assume an adversary attempts:
- **A malicious/compromised client contact** trying to read another client's findings (cross-tenant).
- **A compromised staff account** trying to exfiltrate findings/evidence at scale.
- **A database compromise** (stolen dump, backup theft) trying to read finding contents.
- **A stolen/replayed download link** trying to reach evidence out of band.
- **An SSRF/pivot from core-api** trying to reach the object store directly.

Each is answered by a distinct layer below, so no single control failure is a breach.

## 2. The four layers

### Layer 1 — Tenant isolation (Postgres RLS)
`finding.service.ts` / `engagement.service.ts` / `evidence.service.ts` read through `prisma.tenant`,
which binds the request's org context and runs every query under row-level security (Phase 5,
doc 06). A client contact's query for findings is physically constrained to their org's rows — a
missing `WHERE` clause can't leak, because the database enforces the predicate. Staff cross-org
access uses the explicit staff-scope policy variant and is row-logged.
**Answers:** malicious client contact, and app-code bugs that forget to scope.

### Layer 2 — Field-level encryption (AES-256-GCM envelope)
Finding bodies (`bodyCipher`), evidence data keys (`wrappedKey`), and portal messages are ciphertext
at rest via `CryptoService` (Phase 6 — verified round-trip + tamper detection). Plaintext exists only
transiently in memory for an authorized `readBody`. Per-engagement data keys are envelope-wrapped by
a KMS root; **dropping a wrapped key crypto-shreds** that engagement (NFR-025).
**Answers:** database/backup compromise — a dump is ciphertext, not vulnerabilities.

### Layer 3 — Authorization + step-up (`authz.can`)
- Publishing a finding: `staff:consultant` **and** the finding's org (deny-by-default gate).
- Reading a draft: staff only; client contacts see published findings exclusively.
- Evidence download: engagement contact (or consultant) **plus fresh-MFA step-up** (doc 05 §5).
**Answers:** privilege confusion, casual over-reach, and raises the bar on a compromised session.

### Layer 4 — Least exposure + auditability
- Findings are invisible to the client until a consultant sets `publishedAt` — the reveal is
  deliberate, not automatic.
- Every evidence download is **attributed and immutably logged** (`EvidenceDownload`: user, time,
  ip-hash) before the URL is returned; links are single-org and expire ≤72h; PDFs are
  per-recipient watermarked.
- **Bulk evidence pulls trip a `security.event`** (`export.bulk`) and are rate-limited — mass
  exfiltration is noisy, not silent (NFR-023, feeds the platform SOC).
**Answers:** compromised staff at scale, stolen links, and makes any exfiltration detectable.

### Structural backstop — network isolation
Evidence objects live in an object-locked bucket with a deny-by-default policy; the object store is
reached only via short-lived presigned URLs, never proxied through core-api, and the lab cluster
(the other hostile-workload plane) has no route to it (ADR-008). An SSRF from core-api cannot list
the bucket.

## 3. Why four layers, not one

Each layer has a plausible independent failure mode:

| If this fails… | …this still protects the data |
|---|---|
| An RLS policy has a bug (defaults open) | Encryption — body is ciphertext; authz still denies |
| Encryption key management slips | RLS + authz still deny cross-tenant/unauthorized reads |
| An authz policy is too permissive | RLS still scopes to org; audit still records the access |
| An account is compromised | Step-up MFA + bulk-export alerting + audit trail |

Defense-in-depth means the probability of a breach is the **product** of independent failure
probabilities, not any single one. For data this sensitive, that multiplication is the design goal.

## 4. Test strategy

- **Tenant-isolation suite** (Phase 2 doc 06 §5, every deploy): provisions two client orgs +
  engagements, attempts cross-tenant finding/evidence reads via every path (GraphQL, REST, presigned
  URL reuse, event replay with forged org context), asserts denied.
- **Encryption tests** (Phase 6): round-trip, distinct-ciphertext, GCM tamper detection — passed.
- **Authz-matrix**: `finding.publish` and `evidence.download` role × org × step-up combinations
  asserted (the Phase 5 authz suite pattern).
- **Audit assertion**: every evidence download produces exactly one immutable log row; the audit
  table rejects UPDATE/DELETE at the privilege level (Phase 5 RLS migration).
- **External pentest** (Phase 9, NFR-017) scopes cross-tenant and evidence-exfiltration scenarios
  explicitly — we test our own crown jewels with our own methodology.

## 5. What remains (portal + reports)

The client-facing portal UI (findings feed, evidence, messaging — rides the `web` app) and the
report assembly (a Phase 8 automation, FR-AU-050, human-approved) build on this secured core. They
add presentation and workflow; the confidentiality guarantees are already established here.
