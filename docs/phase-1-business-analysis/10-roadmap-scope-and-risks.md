# 10 — Roadmap, Scope Cutlines & Risk Register

## 1. Delivery phases

Phased exactly as the engagement model prescribes; each phase ends at an approval gate.

| Phase | Deliverable | Key outputs |
|-------|-------------|-------------|
| **1. Business analysis** *(this package)* | Requirements baseline | Docs 01–10, approved cutlines |
| **2. System architecture** | Technical blueprint | Service decomposition (Next.js apps, NestJS services), monorepo layout, API strategy (REST+GraphQL boundaries), auth architecture (JWT/OAuth/passkeys/MFA/RBAC/ABAC), lab-infrastructure architecture, multi-tenancy model, event/queue design, infra topology (Docker/K8s/Terraform/AWS/Cloudflare), environment strategy, ADRs |
| **3. Database design** | Data foundation | Full ERD, Prisma schema, migration strategy, seed pipeline, MVP-schema mapping (doc 09 §5), data-class/retention matrix |
| **4. Design system** | Brand + UI foundation | Brand guidelines, tokens (color/type/space/motion), bilingual typography (Arabic + Latin pairing), component library (Shadcn/Radix base), motion language (Framer Motion/GSAP), 3D/WebGL direction, wireframes for top journeys, dark/light themes |
| **5. Core platform build** | Working skeleton | Auth, accounts, orgs, RBAC, i18n plumbing, admin shell, CI/CD, observability, security baseline |
| **6. Academy build** | Learning product | Content model, courses/paths, quizzes, gamification, browser labs, checkout/subscriptions |
| **7. Company platform build** | Services product | Marketing site, scoping pipeline, CRM, client portal, findings/report tooling |
| **8. Automation layer** | AI-operated back office | FR-AU catalog implementation in priority order (M first) |
| **9. Hardening & launch** | Production readiness | Pentest (external), load tests, DR exercise, SEO/perf audits, content load, GA |
| **10. Fast-follows** | Growth surface | Mobile apps, machine deploys at scale, VPN labs, marketplace, certifications program, regional gateways |

Sequencing rationale: revenue-critical B2C academy (6) lands before the services portal (7) because subscriptions compound with time; services can be sold and delivered semi-manually (proposals via FR-AU-011 running on the admin shell of phase 5) before their full portal exists — consultants have workarounds, subscribers don't.

## 2. v1 cutlines (the decisions that keep v1 excellent)

**In v1 (M-priority throughout docs 05–08):** bilingual web platform, courses/paths/quizzes/exams, browser labs + limited machine deploys, full gamification spine, B2C subscriptions (Stripe+PayPal), corporate seats self-serve, services site + scoping + client portal + findings/report tooling, admin core (RBAC, audit, CRM, CMS, support desk, commerce ops), M-priority automations, the full NFR baseline.

**Deliberately NOT in v1 — with reasons:**

| Deferred | Why | Lands |
|----------|-----|-------|
| Mobile apps (FR-AC-133) | Responsive web covers the journey; native apps double QA surface before product-market fit is proven | Phase 10, first fast-follow |
| Cloud labs (AWS/Azure sandboxes) (FR-AC-044) | Highest infra cost + abuse risk per learner-hour on the platform | After lab cost telemetry from v1 |
| Proctored certifications (FR-AC-025) | A certification's value is credibility, which requires an established brand; premature launch devalues it permanently | Year 2, after content depth |
| Instructor marketplace (public) | Quality control tooling must precede open supply; v1 instructor tooling serves the in-house/commissioned pipeline | Phase 10 |
| Live classes (FR-AC-027) | Cohort features serve the institution persona (P6), a post-v1 sales motion | With first institution deal |
| Regional payment gateways | Stripe+PayPal unblock launch; gateway abstraction (FR-AD-041) is built in v1 so adding rails is config-plus-adapter, not surgery | Fast-follow, KSA/EG first |
| LMS/SCORM/LTI (FR-AC-115), SCIM (part of FR-AC-113) | Enterprise-deal-driven; build against a real customer contract | On demand |
| MSSP telemetry ingestion | Portal-based reporting suffices for early MSSP contracts | Architecture provision in Phase 2, build later |

## 3. Risk register

| # | Risk | L×I | Mitigation | Owner |
|---|------|-----|------------|-------|
| R1 | **Lab infrastructure costs outrun revenue** (free-tier abuse, cryptomining, idle sessions) | H×H | Hard quotas (FR-AC-096), egress restriction + abuse detection (FR-AC-046), idle reaping (NFR-042), cost-per-learner tracked monthly against doc 03 margins | CTO |
| R2 | **Content library too thin at launch** vs. incumbents | H×H | Launch gate: ≥6 complete paths, ≥60 labs; AI-assisted authoring with expert review (FR-AU-030s); "From the Field" pipeline from engagements; commissioned instructors pre-marketplace | Content lead |
| R3 | **Platform breach** — existential for a security brand | M×Critical | NFR-001–029 baseline, external pentest pre-GA (NFR-017), tenant-isolation tests per deploy, disclosure program, incident comms plan rehearsed | CTO/CISO |
| R4 | **Two-business focus split** starves both | M×H | Services deliberately run semi-manual on admin tooling until Phase 7; hiring plan separates delivery consultants from product team early | CEO |
| R5 | **Arabic experience ships second-class** (translations lag, RTL bugs), undermining the core differentiator | M×H | NFR-050s as launch-blocking; translation completeness dashboards (FR-AD-031); native-speaker review in editorial workflow; RTL in E2E suites both-locale rule (doc 08 §7) | Product |
| R6 | **Payment/gateway friction in target regions** suppresses conversion | M×M | PPP price books day one; gateway abstraction ready; monitor checkout-abandonment by region as a launch KPI | Product |
| R7 | **AI automation produces wrong customer-facing output** (bad proposal, hallucinated report content) | M×H | Human gates on all external output (doc 07 ground rules), accuracy thresholds before autonomy (FR-AU-021 AC), traceability + appeal paths (NFR-075) | Ops |
| R8 | **Incumbent localizes into Arabic** before we establish the moat | M×M | Speed to MENA market; the services-fed content pipeline and regional compliance tracks (NCA/SAMA) are the parts a localizing incumbent can't copy | CEO |
| R9 | **Scope creep past cutlines** delays launch indefinitely | H×H | This document is the contract: post-approval scope changes require explicit gate re-approval with schedule impact stated | All |
| R10 | **Key-person dependency** (small team, deep specialization) | M×M | Documentation-first culture (every phase produces docs), runbooks (NFR-084), automation reduces bus factor in ops | CEO |

## 4. Launch KPIs (first 90 days post-GA)

| Metric | Target |
|--------|--------|
| Registered users | 10,000 |
| Free→paid conversion | ≥3% |
| Paid subscribers | 300+ |
| D30 retention (activated users) | ≥35% |
| Corporate accounts | 5 |
| Services proposals sent / won | 12 / 4 |
| Lab cost per active learner | ≤$1.20/mo |
| p75 Core Web Vitals both locales | Green |
| Support first-response (paid) | <4h, ≥40% AI-deflected |
| Security incidents (Sev-1) | 0 |

## 5. Open questions for stakeholders

1. **Pricing anchors** — approve doc 03 §6 items (USD anchors, 70/30 marketplace split, free-tier depth, quarterly SKU).
2. **Launch regions** — confirm KSA + Egypt + broader GCC as the marketing beachhead (affects price books, gateway priority, compliance content order).
3. **Hosting jurisdiction** — single-region launch is assumed; is a KSA-hosted option (NFR-072) needed for any *launch* customer, or confirmed post-v1?
4. **Brand naming** — "INFOENC Academy" vs. a distinct sub-brand for the academy; affects Phase 4 and domain strategy.
5. **Content language order** — produce en-first with ar translation, ar-first for beginner content, or simultaneous? (Impacts content velocity vs. differentiation trade-off in R2/R5.)
6. **Services legal entities** — engagement contracts, liability insurance, and consultant certifications per target jurisdiction are a business prerequisite tracked outside the platform roadmap; confirm ownership.

---

**Approval of this package = approval to start Phase 2 (System Architecture) against this baseline.**
