# 05 — Requirements: INFOENC Company Platform

Scope: the public services site, lead-to-engagement pipeline, and client portal. Personas: P4 (services buyer), P7 (consultant), P8 (operations).

Priorities: **M**ust (v1) / **S**hould / **C**ould / **W**on't (this release).

## 1. Public site

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-CO-001 | Marketing site with pages: home, services catalog, individual service pages, industries, about, team, careers, contact, blog/insights, legal (privacy, terms, responsible disclosure) | M |
| FR-CO-002 | Every service in the catalog (pentesting, red/blue/purple team, VA, audits, cloud, AD, SOC, IR, forensics, malware analysis, mobile/web/API security, code review, SDLC consulting, compliance [ISO 27001, PCI DSS, HIPAA, NIST, NCA ECC, SAMA CSF], risk assessment, awareness training, MSSP, consulting) gets a dedicated page: methodology, deliverables sample, engagement timeline, FAQ, scoping CTA | M |
| FR-CO-003 | Full Arabic/English parity on every public page, locale-aware URLs (`/ar/...`, `/en/...`), RTL layout | M |
| FR-CO-004 | Blog/insights CMS-driven: advisories, research, engagement war stories (anonymized), compliance guides; author profiles; bilingual posts can publish independently per language | M |
| FR-CO-005 | Case studies with client-approved metrics; anonymized variant when client won't be named | S |
| FR-CO-006 | Careers page with open roles fed from admin HR module | S |
| FR-CO-007 | Responsible disclosure / security.txt page with PGP key | M |
| FR-CO-008 | Trust center: certifications, insurance, sample NDA/MSA downloads gated behind email | C |

## 2. Lead capture & scoping

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-CO-020 | Structured scoping forms per service type (e.g., web pentest: number of apps, roles, auth methods, environment, compliance driver, window) — not a generic contact form | M |
| FR-CO-021 | Scoping submissions create CRM leads with source attribution (UTM, referrer, campaign) | M |
| FR-CO-022 | Automated lead qualification and scoring on submission (company enrichment, budget/authority/need/timeline signals) → routes to consultant calendar or nurture track (see FR-AU-010) | M |
| FR-CO-023 | Meeting scheduling embedded (calendar integration) offered immediately to qualified leads | M |
| FR-CO-024 | Proposal generation workflow: scoping data → drafted proposal (FR-AU-011) → consultant review/edit → e-sign-ready PDF sent from platform, status tracked (sent/viewed/signed/expired) | M |
| FR-CO-025 | NDA exchange step available before detailed scoping | S |

## 3. Client portal

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-CO-030 | Authenticated client portal per organization: engagements list, contacts, documents, invoices | M |
| FR-CO-031 | Engagement workspace: scope, schedule/milestones, assigned consultants, status | M |
| FR-CO-032 | Live findings feed during engagements: severity (CVSS), affected asset, evidence, remediation guidance; client can comment and mark remediation status | M |
| FR-CO-033 | Secure deliverable exchange: encrypted at rest, watermarked PDFs, expiring download links, access logged | M |
| FR-CO-034 | Final report delivery: executive PDF + technical PDF + machine-readable findings export (JSON/CSV) | M |
| FR-CO-035 | Retest workflow: client marks findings remediated → retest scheduled → findings re-verified with status history | S |
| FR-CO-036 | Portal messaging thread per engagement (replaces email attachments for sensitive content) | S |
| FR-CO-037 | MSSP/SOC clients: monthly service reports, ticket/alert summaries in portal | S |
| FR-CO-038 | Compliance engagements: shared evidence-collection checklists with statuses per control | C |

## 4. Consultant-facing (internal, surfaced via admin panel)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-CO-050 | Engagement management: pipeline from signed proposal → scheduled → in-progress → reporting → retest → closed | M |
| FR-CO-051 | Findings editor: structured findings library (title, description, CVSS, remediation) reusable across engagements, per-engagement instantiation with evidence attachments | M |
| FR-CO-052 | Report generation from findings (FR-AU-050): assembled exec summary + technical detail from templates, bilingual output, consultant approval gate before client delivery | M |
| FR-CO-053 | Utilization and scheduling view for consultants across engagements | S |
| FR-CO-054 | Cross-sell trigger: engagement completion prompts scoped Academy corporate proposal generation (the flywheel, doc 03 §4) | S |

## 5. Acceptance criteria — selected

**FR-CO-020 (scoping forms)**
- Each of the 8 core service families has its own form schema; adding a service form requires configuration, not code.
- Form completes in under 5 minutes; progress preserved on navigation away.
- Submission produces a CRM lead within 5 seconds and an acknowledgment email in the submitter's language.

**FR-CO-032 (findings feed)**
- A finding published by a consultant is visible to authorized client contacts within 30 seconds, triggers a notification respecting the client's notification preferences, and is never visible to other organizations (verified by automated multi-tenant access tests).
- Critical-severity findings trigger an immediate email + portal alert regardless of digest preferences.

**FR-CO-033 (deliverable exchange)**
- Every download is attributed to a named user and logged immutably; links expire ≤72h and are single-org scoped.
- Report PDFs carry per-recipient watermarks (name, org, timestamp).

## 6. Explicitly out of scope for v1 (W)

- Public vulnerability-scanning self-service tools (liability + abuse surface; revisit as a product later).
- Client-side agent/sensor software for MSSP (v1 MSSP reporting is portal-based; telemetry ingestion is a Phase-2 architecture question for a later release).
- Marketplace of third-party service providers.
