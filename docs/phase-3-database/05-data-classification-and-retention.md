# 05 — Data Classification & Retention

Maps every data class to its protection, retention, and deletion rules. Satisfies NFR-025 (retention/deletion), NFR-070 (GDPR/PDPL DSR), NFR-020 (encryption). This is the table a privacy regulator or an ISO 27001 auditor asks for first.

## 1. Data classes

| Class | Tables (representative) | Sensitivity | At-rest protection | Tenancy |
|---|---|---|---|---|
| **Crown-jewel** | `Finding`, `FindingComment`, `Evidence`, `EngagementReport`, `PortalMessage` | Highest — client vulnerabilities | TLS + **field-level envelope encryption** (KMS-wrapped per-engagement keys) + object-locked evidence bucket | `orgId` RLS + engagement-contact ACL |
| **Authentication secrets** | `Credential`, `TotpSecret`, `RecoveryCode`, `Passkey`, `Session`, `ApiKey` | Highest | Argon2id hashes (passwords/codes); envelope-encrypted (TOTP); hashed tokens; never reversible-stored | user/org |
| **Financial** | `Invoice`, `Payment`, `Subscription`, `AffiliateConversion` | High | TLS + at-rest DB encryption; **no card data** (provider-hosted, SAQ-A, NFR-071) | `orgId` RLS + finance ABAC |
| **Personal (PII)** | `User`, `OrgMembership`, `Lead`, contact fields | Medium-High | TLS + at-rest; IP addresses hashed (`ipHash`), not stored raw (NFR-073) | user/org |
| **Learning/behavioral** | `Enrollment`, `LessonProgress`, `XpEvent`, `QuizAttempt`, `LabSession` | Medium | TLS + at-rest | user |
| **Community UGC** | `Post`, `PostVote`, `FlagSubmission` | Low-Medium | TLS + at-rest; sanitized on render | user |
| **Content** | `Course`, `Lab`, `CmsPage`, translations | Low (public product) | TLS + at-rest | none (global) |
| **Operational** | `AuditLog`, `SecurityEvent`, `OutboxEvent`, `AutomationRun` | Medium (contains actor/PII refs) | TLS + at-rest; audit is append-only + hash-chained | platform |

## 2. Retention schedule

| Data | Retention | Deletion mechanism |
|---|---|---|
| Sessions / refresh tokens | 30 days after expiry | hard delete (sweeper job) |
| Verification/reset tokens | 24h / on use | hard delete |
| Raw `WebhookEvent` payloads | 90 days | hard delete after processing window |
| `ipHash` on sessions/downloads | 90 days | null out |
| Lab session records | 180 days (metrics), infra reaped ≤2min | metadata retained, compute reclaimed immediately |
| Learning/behavioral data | Life of account | cascade on account deletion (§3) |
| **Financial records / invoices** | **Statutory minimum per jurisdiction (typically 5–10 yrs KSA/EG/EU)** | **legal-hold — NOT deleted on account deletion** |
| **Engagement / crown-jewel data** | Per client contract (default 3 yrs post-engagement), then **crypto-shred** | drop the per-engagement wrapped key → ciphertext is irrecoverable (NFR-025) |
| Audit logs | 7 years (security + compliance evidence) | never user-deletable; archived to cold storage after 1 yr |
| Security events | 2 years | archived then purged |
| Marketing/CRM leads (unconverted) | 24 months of inactivity | soft then hard delete (consent-based, PDPL/GDPR) |
| Backups | 35-day PITR window; monthly snapshots 1 yr | rotation; encrypted (NFR-024) |

## 3. Data Subject Requests (NFR-070)

**Export (portability).** A user-triggered job assembles their personal data (profile, enrollments, progress, XP, badges, certificates, posts, tickets, invoices) into a machine-readable archive. Excludes other users' data and platform-internal logs. Delivered via expiring secure link.

**Deletion (erasure).** Self-serve account deletion (FR-AC-013) runs a cascade within the statutory window (≤30 days) with **explicit legal carve-outs**:
- Financial records and issued invoices are **retained** (legal obligation) but PII within them is minimized where the law allows (name retained for invoice validity; other PII pseudonymized).
- Audit-log entries referencing the user are **retained** (tamper-evident security record) but the user record they point to is deleted — the log keeps the actor UUID, not live PII.
- Community posts are anonymized (author → "deleted user") rather than removed, preserving thread integrity, unless the user requests full removal and no legal-hold applies.
- Engagement data belongs to the **client org**, not the individual user — a consultant deleting their account does not delete client findings (crown-jewel data is org-owned and contract-governed).

**The deletion cascade is explicit in code and tested** — a DSR test provisions a user across every domain and asserts exactly what is deleted, anonymized, and retained, so "we honored the erasure request" is a verifiable claim, not a hope.

## 4. Encryption key management (NFR-015, NFR-020)

- **KMS-held root keys**, per-purpose data keys (envelope pattern): one key domain for engagement/evidence data, one for TOTP/SSO secrets, one for general field encryption. Keys never leave the crypto module (Phase 2 doc 06 §4).
- **Crypto-shredding** is the deletion primitive for encrypted classes: destroying the wrapped data key renders the ciphertext permanently unreadable — cheaper and more certain than scrubbing rows across backups.
- Key rotation quarterly (signing keys) / annually (data keys) with re-wrap, not re-encrypt-in-place.

## 5. AI & automation data boundaries (NFR-075, doc 07 ground rules)

- Automation runs record their permitted `scopeRef` (`AutomationRun.scopeRef`) — an engagement-report run can only load that engagement's data; the LLM gateway enforces it by construction (Phase 2 doc 03 §5).
- Automated decisions affecting users (moderation hides, fraud flags, lead scoring) are logged (`AutomationRun` + `AuditLog`), labeled, and appealable to a human.
- No crown-jewel data is used for model training or leaves its workflow's context boundary.

## 6. Residency (NFR-072)

Primary region me-south-1 keeps MENA user data in-region (ADR-013). The `orgId`-scoped design means a government/enterprise tenant requiring dedicated in-country hosting can be homed on a region-pinned stack without schema change — the data-class table above applies identically per region.
