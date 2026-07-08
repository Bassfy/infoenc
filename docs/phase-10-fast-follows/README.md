# Phase 10 — Fast-Follows

**Status:** Post-GA roadmap (not launch-blocking)
**Baseline:** A live, hardened v1 (Phases 1–9). Every item here was **deliberately cut from v1**
with a rationale in Phase 1 doc 10 — these are planned next steps, not gaps.

---

## Objectives

Sequence and de-risk the post-launch buildout so growth features land against *real v1 telemetry*
(lab costs, content depth, conversion, region mix) rather than pre-launch guesses.

## What landed this phase (real code)

| Artifact | Why now |
|----------|---------|
| `apps/mobile/` | ADR-014: **scaffold the mobile app before the fast-follow build** so it isn't a cold start. Expo + expo-router app that reuses `@infoenc/i18n` (same locale negotiation + RTL as web) and `@infoenc/contracts` (same typed API layer), boots, negotiates locale, and renders the brand. The learn/labs/career flows build on this shell. |

## The fast-follow roadmap (sequenced)

Full detail, triggers, and dependencies: [01-roadmap.md](01-roadmap.md). Summary:

| # | Fast-follow | Gated on | Cut rationale (Phase 1) |
|---|-------------|----------|--------------------------|
| 1 | **Mobile apps** (iOS/Android) | scaffold done; build on v1 API stability | Responsive web is v1's mobile answer; native doubles QA before PMF |
| 2 | **Regional payment gateways** (Moyasar/Paymob) | v1 checkout-abandonment data by region | Stripe+PayPal unblock launch; gateway abstraction already built (adapter, not surgery) |
| 3 | **Cloud labs** (AWS/Azure sandboxes) | v1 lab-cost telemetry proving the margin model | Highest infra cost + abuse risk per learner-hour |
| 4 | **VPN labs at scale** + machine-deploy pools | v1 lab utilization curves | Browser labs first; scale the expensive path on evidence |
| 5 | **Proctored certifications** | established brand + content depth | A cert's value is credibility; premature launch devalues it permanently |
| 6 | **Instructor marketplace** (public) | quality-control tooling matured | Open supply needs QC first; v1 tooling serves in-house/commissioned |
| 7 | **Live classes / cohorts** | first institution deal | Serves the institution persona — a post-v1 sales motion |
| 8 | **LMS integration** (SCORM/xAPI/LTI), **SCIM** | a signed enterprise/institution contract | Build against a real customer, not spec |
| 9 | **KSA-hosted tenant option** | a launch/near-launch customer requiring it | `org_id`/RLS design already supports region-homing (ADR-004/013) |
| 10 | **MSSP telemetry ingestion** | first MSSP contracts past portal-only reporting | Portal reporting suffices early; ingestion is a later architecture step |

## The principle behind the sequencing

Each fast-follow is unlocked by **evidence from the running product**, not calendar. The three
highest-cost/risk items (cloud labs, machine pools, certifications) wait for the exact telemetry
that proves they won't sink margins or dilute the brand — which is *why* Phase 9 wired
cost-per-learner and content-floor metrics as launch gates. The platform was architected so none of
these is a rewrite: the payment-provider abstraction, the `org_id`/RLS residency path, the shared
contracts/i18n for mobile, and the lab orchestrator's declarative scenarios all mean each
fast-follow is an *addition*, not surgery.

## Deliverables doc

| Doc | Covers |
|-----|--------|
| [Fast-Follow Roadmap](01-roadmap.md) | Per-item scope, trigger metric, dependencies, and the architecture hook that makes it additive |

## This closes the 10-phase arc

| Phase | Delivered |
|-------|-----------|
| 1 Business analysis | Requirements baseline (150+ FR/NFR) |
| 2 Architecture | Blueprint + 14 ADRs |
| 3 Database | 129-model Prisma schema + RLS |
| 4 Design system | Tokens + component foundation + live showcase |
| 5 Core platform | Monorepo + RLS tenant-isolation core |
| 6 Academy | Auth, XP, catalog, labs, commerce, i18n, app |
| 7 Company | CRM, flywheel, crown-jewel engagements, portal |
| 8 Automation | LLM gateway + workflow engine + human gates |
| 9 Hardening | Load tests, deploy pipeline, SEO, launch runbooks |
| 10 Fast-follows | Mobile scaffold + the sequenced growth roadmap |
