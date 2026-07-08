# 07 — Requirements: Admin Panel & Automation

Scope: the internal back office (FR-AD-*) and the AI/automation catalog (FR-AU-*). Persona P8 (operations) and P7 (consultants) live here. Design goal: **a 5-person team operating like a 50-person company** — every routine workflow has an automated path with a human approval gate where output leaves the building.

## 1. Admin panel core (FR-AD)

### 1.1 Access & governance

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AD-001 | RBAC: predefined roles (super-admin, ops, support, content-editor, finance, consultant, marketing) with granular permissions; ABAC conditions for sensitive scopes (e.g., finance data only from staff MFA sessions) | M |
| FR-AD-002 | Immutable audit log: every admin action (who/what/when/before-after) queryable, exportable, tamper-evident | M |
| FR-AD-003 | Staff MFA mandatory; session policies stricter than customer sessions | M |
| FR-AD-004 | Impersonation ("view as user") with explicit consent-free but fully logged read-only mode; write actions on behalf of users require reason capture | S |

### 1.2 Dashboards & analytics

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AD-010 | Executive dashboard: MRR, ARR, churn, new/active subscribers, trial conversion, services pipeline value, cash collected | M |
| FR-AD-011 | Academy analytics: DAU/WAU/MAU, path completion funnels, content engagement, lab utilization & cost per session | M |
| FR-AD-012 | Support analytics: volume, first-response/resolution times, CSAT, deflection rate | M |
| FR-AD-013 | Cohort retention and revenue reports, exportable | S |

### 1.3 CRM (services + corporate academy sales)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AD-020 | Pipeline: lead → qualified → proposal → negotiation → won/lost, with per-stage automation hooks | M |
| FR-AD-021 | Account 360: org's subscriptions, seats, engagements, tickets, invoices, cross-sell flags in one view | M |
| FR-AD-022 | Activity capture: emails, calls, meetings logged against accounts (calendar/email integration) | S |
| FR-AD-023 | Contract & document storage per account with e-sign status | M |

### 1.4 CMS & content operations

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AD-030 | CMS for marketing pages, blog, service pages: bilingual entries, draft/preview/schedule/publish, SEO fields per entry | M |
| FR-AD-031 | Academy content admin: catalog management, editorial review queues (FR-AC-103), translation completeness board | M |
| FR-AD-032 | Media library: images/video with automatic optimization and alt-text enforcement | S |

### 1.5 Commerce operations

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AD-040 | Subscription management: search, view, extend, comp, cancel, refund (with approval flow ≥ threshold) | M |
| FR-AD-041 | Payment provider abstraction admin: provider status, regional gateway config, payout reconciliation | M |
| FR-AD-042 | Invoice system: sequential legal numbering per jurisdiction, credit notes, bilingual PDF, tax rates by region, export for accounting | M |
| FR-AD-043 | Coupon/campaign manager with redemption analytics | M |
| FR-AD-044 | Affiliate/referral administration: approval, fraud review, payouts | S |
| FR-AD-045 | Dunning configuration and failed-payment recovery reporting | M |

### 1.6 Support desk

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AD-050 | Ticketing: email + in-app intake, statuses, assignments, internal notes, canned responses, SLA timers per plan tier | M |
| FR-AD-051 | Knowledge base (public help center), bilingual, searchable; article suggestions inside ticket composer | M |
| FR-AD-052 | CSAT survey on resolution | S |

### 1.7 HR & projects (lightweight v1)

| ID | Requirement | Pri |
|----|-------------|-----|
| FR-AD-060 | Employee directory, roles, onboarding checklists | S |
| FR-AD-061 | Project tracking for services engagements (consultant assignment, milestones) — v1 can integrate an external PM tool rather than rebuild one | S |
| FR-AD-062 | Security operations log: internal security events, access reviews, policy acknowledgments | S |

## 2. Automation & AI catalog (FR-AU)

Ground rules for every automation:
- **Human gate on anything customer-visible** (proposals, reports, refunds, published content) until a workflow earns autonomy through measured accuracy.
- **Full traceability:** each automated action logs its trigger, inputs, model/version, and outcome to the audit trail.
- **Fallback path:** every automation degrades to a manual queue, never to silence.
- **Data boundaries:** client engagement data never enters model context beyond its own workflow; no cross-tenant leakage (NFR-021).

### 2.1 Sales & marketing

| ID | Automation | Trigger → Action | Gate | Pri |
|----|-----------|------------------|------|-----|
| FR-AU-010 | Lead qualification | Scoping/contact form → enrich (domain, size), score, route: hot → calendar link + consultant alert; warm → nurture sequence; cold → newsletter | Auto | M |
| FR-AU-011 | Proposal generation | Qualified scoping data → drafted proposal (scope, methodology, timeline, price from rate tables) | Consultant approves | M |
| FR-AU-012 | Contract generation | Won deal → contract from template library with negotiated terms merged | Human sends | S |
| FR-AU-013 | SEO content assistant | Keyword gaps → drafted bilingual outlines/articles for blog | Editor approves | S |
| FR-AU-014 | Social media pipeline | Published content/new labs → platform-appropriate post drafts + cards, scheduled | Marketing approves batch | S |
| FR-AU-015 | Video transcripts & subtitles | Video upload → transcript, ar/en subtitles, chapter markers | Spot-check | M |
| FR-AU-016 | Email marketing | Campaign brief → segmented bilingual drafts; send-time optimization | Marketing approves | S |

### 2.2 Customer lifecycle & support

| ID | Automation | Trigger → Action | Gate | Pri |
|----|-----------|------------------|------|-----|
| FR-AU-020 | Lifecycle messaging | Signup/trial/inactivity/renewal events → localized sequences (day-3 nudge, streak-break, win-back, renewal evidence) | Auto (templates pre-approved) | M |
| FR-AU-021 | Ticket classification & routing | New ticket → category, sentiment, priority, suggested KB answer; auto-resolve offer for known issues | Auto-classify; auto-resolve only with user confirmation | M |
| FR-AU-022 | AI support chatbot | Chat widget → answers from KB + account context (billing status, lab quota); escalates with full summary | Escalation always available | M |
| FR-AU-023 | Community pre-moderation | New forum/DM report → toxicity/spoiler/spam scoring → queue or auto-hide above threshold | Human reviews queue | S |
| FR-AU-024 | Corporate QBR generator | Quarterly/renewal-60d → usage report with skill-gap narrative per org | CSM approves | S |
| FR-AU-025 | Meeting scheduling | Qualified request → calendar negotiation, reminders, no-show follow-up | Auto | M |

### 2.3 Content & academy operations

| ID | Automation | Trigger → Action | Gate | Pri |
|----|-----------|------------------|------|-----|
| FR-AU-030 | Course creation assistant | Topic brief → module outline, lesson drafts, lab suggestions aligned to path level | Author owns output | S |
| FR-AU-031 | Quiz/exam generator | Lesson content → question drafts with distractors + explanations, difficulty-tagged | Editor approves | M |
| FR-AU-032 | Certificate issuance | Completion event → bilingual certificate render, verification record, notification | Auto | M |
| FR-AU-033 | Content QA pre-review | Submission → broken links, missing alt text/subtitles, difficulty consistency, translation gaps | Feeds editorial checklist | M |
| FR-AU-034 | Translation assistant | Approved en/ar content → draft counterpart translation flagged for native review | Reviewer approves | M |

### 2.4 Security operations (internal + services delivery)

| ID | Automation | Trigger → Action | Gate | Pri |
|----|-----------|------------------|------|-----|
| FR-AU-050 | Pentest report generator | Findings set complete → assembled bilingual report (exec summary, risk narrative, technical detail) from findings library | Lead consultant approves | M |
| FR-AU-051 | Compliance report generator | Evidence checklist complete → gap-assessment report draft mapped to framework controls | Consultant approves | S |
| FR-AU-052 | Threat intel digest | Feeds (CVEs, advisories) → filtered digest relevant to client stacks and Academy content ideas | Auto internal | C |
| FR-AU-053 | Platform SOC alerts | SIEM/monitoring events → enriched, deduplicated, severity-routed alerts (see NFR-023) | Auto page on critical | M |
| FR-AU-054 | Incident summaries | Incident closed → timeline + postmortem draft from alert/chat/deploy history | IC approves | S |

### 2.5 Engineering & internal ops

| ID | Automation | Trigger → Action | Gate | Pri |
|----|-----------|------------------|------|-----|
| FR-AU-060 | CI/CD pipeline | Push → lint, typecheck, tests, security scans (SAST, dependency, secrets, container), preview deploy; main → staged rollout | Prod deploy approval | M |
| FR-AU-061 | GitHub automation | PR opened → AI review pass, size/labeling; issue triage | Advisory only | S |
| FR-AU-062 | Monitoring & incident management | Alert → on-call page, incident channel creation, status page update hooks | Auto | M |
| FR-AU-063 | Chat-ops (Slack/Discord/Teams) | Deploys, alerts, new enterprise signups, big deals → channel notifications; community Discord role sync with plan | Auto | S |
| FR-AU-064 | Employee onboarding | Hire record → account provisioning checklist, access requests, training assignments (on our own Academy) | HR approves access grants | S |
| FR-AU-065 | Finance ops | Invoice issuance, payment reconciliation, monthly revenue close draft, tax report drafts | Finance approves close | S |
| FR-AU-066 | Internal wiki/docs assistant | Docs Q&A over internal wiki + runbooks for staff | Auto | C |

## 3. Automation acceptance criteria — selected

**FR-AU-021 (ticket classification)**
- ≥90% routing precision measured against human labels on a rolling 200-ticket sample before auto-routing is enabled; below threshold it runs in suggest-only mode.
- Misclassification is one-click correctable and feeds the evaluation set.

**FR-AU-050 (pentest report generator)**
- Generated draft contains zero fabricated findings: every statement traces to a findings-library entry or engagement evidence; generator refuses to fill gaps with invented content and flags missing sections instead.
- Consultant edit distance is tracked; target <20% of report content edited after month 3.

**FR-AU-022 (chatbot)**
- Answers cite KB articles; questions outside KB scope escalate rather than improvise.
- Never exposes another account's data (tested with adversarial prompts in CI).
