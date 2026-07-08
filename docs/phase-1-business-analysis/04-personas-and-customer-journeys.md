# 04 — Personas & Customer Journeys

Eight personas drive requirement prioritization. Each has a primary metric the product must move; journeys below show the v1 experience end-to-end.

## 1. Personas

### P1 — "Omar", the career switcher (Academy B2C, Learner)
- 24, Cairo. Computer science graduate working helpdesk; wants a SOC analyst role within a year. Studies in Arabic, works in English.
- **Buys when:** a free lab gives him a win in the first session and a roadmap shows a believable route to employment.
- **Churns when:** he plateaus, content jumps difficulty, or a month passes without visible progress.
- **Primary metric:** weekly active learning days; path completion rate.

### P2 — "Sara", the working practitioner (Academy B2C, Pro)
- 29, Riyadh. Blue-teamer moving into red teaming; employer reimburses tools under $30/mo. Fluent English, prefers dark mode, hates fluff.
- **Buys when:** advanced content is genuinely advanced and machines don't queue.
- **Churns when:** she outgrows the catalog. Retention lever: "From the Field" labs and early-access CTFs.
- **Primary metric:** advanced-content engagement; CTF participation.

### P3 — "Khalid", the security team lead (Corporate)
- 38, Jeddah. Manages 14 analysts at a bank; must show training ROI to a CISO and evidence for regulator audits (SAMA CSF).
- **Buys when:** he can assign paths, see per-analyst progress, and export reports. SSO is a hard requirement above ~30 seats.
- **Primary metric:** seat activation rate; assignment completion; renewal.

### P4 — "Dina", the CISO / services buyer
- 45, Dubai. Buys pentests to satisfy PCI DSS and board risk appetite. Cares about report quality, remediation clarity, and consultant seniority — not price.
- **Buys when:** scoping is fast, references are strong, and the sample report is excellent.
- **Primary metric:** time-to-proposal; engagement NPS; repeat rate.

### P5 — "Youssef", the instructor / content creator
- 33, Amman. OSCP-holder with a YouTube following; wants revenue share and authoring tools that don't fight him.
- **Joins when:** authoring is pleasant (markdown + lab builder), analytics are honest, payouts are reliable.
- **Primary metric:** published content per quarter; content quality score.

### P6 — "Prof. Al-Rashidi", the institution buyer
- 52, KSU. Licenses cohort seats for a semester course; needs Arabic UI, gradebook export, and procurement paperwork.
- **Primary metric:** cohort completion; semester renewal. *(Enterprise motion, mostly post-v1; requirements marked S/C.)*

### P7 — INFOENC consultant (internal)
- Delivers engagements; needs the client portal, report tooling, and the pentest-report generator (FR-AU-050s) to cut report-writing from days to hours.
- **Primary metric:** utilization; report turnaround time.

### P8 — INFOENC operations/admin (internal)
- Runs support, billing, content review, and marketing from the admin panel; one person wearing four hats — which is why the automation catalog (doc 07) exists.
- **Primary metric:** tickets resolved per person-day; automation coverage.

## 2. Customer journeys

### J1 — Omar: anonymous visitor → paying learner (target: <14 days)

1. **Discover.** Lands on an Arabic walkthrough article (SEO) or a shared CTF result card. Site auto-detects locale, renders RTL.
2. **Taste before signup.** One featured browser lab is playable without an account (guest sandbox, 20 min). He captures a flag → confetti moment → "create a free account to save your progress."
3. **Onboard.** Signup (email or Google/GitHub OAuth). Two questions — goal (SOC analyst) and level (beginner) — generate a recommended path. No 10-step wizard.
4. **Hook.** Free tier: intro path, daily browser lab, XP and first badge in session one. Day-3 and day-7 lifecycle emails (automated, FR-AU-020) surface next steps and streaks.
5. **Wall.** Hits a Learner-tier lab in his path. Paywall shows *his* path progress ("you're 22% through the SOC Analyst path — unlock the remaining 31 rooms"), local pricing in EGP, student-friendly quarterly option.
6. **Convert.** Pays via card or local gateway. Access is immediate; invoice emailed in Arabic.
7. **Retain.** Streaks, weekly rank digest, path milestones with shareable certificates; resume builder unlocks at 50% path completion — tying subscription to the job outcome he actually wants.

### J2 — Khalid: corporate evaluation → 20-seat renewal

1. Requests a team trial from the /business page → qualification is automated (FR-AU-010: form + enrichment + scoring), calendar link offered on qualification.
2. 14-day, 5-seat trial with a pre-built "Bank Security Team" demo workspace: assignments, private leaderboard, sample compliance report mapped to SAMA CSF skills.
3. Buys 20 seats self-serve (card) or via invoice (net-30, admin-approved). SCIM/SSO deferred politely if he's under 30 seats.
4. Quarterly business review email auto-generated from team analytics (FR-AU-024); renewal 60/30/7-day sequence with usage evidence.
5. **Cross-sell trigger:** if team assessment scores show weak areas (e.g., cloud), CRM flags a services opportunity → human follow-up with a scoped cloud-review proposal.

### J3 — Dina: RFP → engagement → Academy cross-sell

1. Finds INFOENC via referral or compliance-keyword SEO; service pages show methodology, sample report excerpt, certifications, and a scoping form — not a generic "contact us."
2. Scoping call booked automatically; proposal generated from the scoping questionnaire by the proposal engine (FR-AU-011) and reviewed by a consultant before sending — 48h target vs. industry ~2 weeks.
3. Engagement runs through the client portal (FR-CO-030s): scope, schedule, live finding feed with severity, secure evidence exchange, messaging.
4. Final report delivered in portal (PDF + machine-readable findings); retest window scheduled automatically.
5. Closing package includes the corporate Academy proposal targeting the engagement's weak areas (the flywheel).

### J4 — Youssef: applicant → published instructor (fast-follow, S-priority)

1. Applies with credentials + sample content → review queue in admin.
2. Approved → instructor dashboard: course builder (modules, lessons, video upload, markdown), lab builder (Docker-based browser labs from templates), quiz generator with AI draft + manual edit (FR-AU-031).
3. Submits for review → editorial checklist + AI pre-review (broken links, missing alt text, difficulty consistency) → human approval → published.
4. Monthly payouts with per-course analytics; content-refresh nudges when completion rates sag.

## 3. Journey-derived requirements (traceability)

| Journey moment | Requirement |
|---|---|
| Guest playable lab before signup | FR-AC-090 |
| 2-question onboarding → recommended path | FR-AC-012 |
| Paywall shows personal path progress | FR-AC-071 |
| Local pricing + gateway | FR-AD-041, NFR-060s |
| Lifecycle email automation | FR-AU-020 |
| Corporate demo workspace on trial | FR-AC-110 |
| Auto-generated QBR / renewal evidence | FR-AU-024 |
| Scoping form → drafted proposal in 48h | FR-CO-020, FR-AU-011 |
| Client portal finding feed | FR-CO-032 |
| Engagement → Academy cross-sell flag in CRM | FR-AD-021 |
