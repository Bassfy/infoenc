# 01 — Fast-Follow Roadmap

Each item: scope, the trigger metric that unlocks it, dependencies, and the **architecture hook**
that already exists to make it additive rather than a rewrite. The hooks are the payoff of designing
v1 for these from the start (Phase 2).

## 1. Mobile apps (iOS/Android)

- **Scope:** Native academy — learn, quizzes, progress, notifications, offline lessons, lab
  console-view (not full desktop sessions, ADR-014).
- **Trigger:** v1 web PMF signals (retention ≥ target); app-store presence requested by users.
- **Dependencies:** stable v1 GraphQL/REST surface.
- **Hook (built):** `apps/mobile` scaffold reuses `@infoenc/contracts` (one typed API layer) and
  `@infoenc/i18n` (same locale/RTL). Offline uses the same content model with local caching.

## 2. Regional payment gateways (Moyasar, Paymob, HyperPay)

- **Scope:** Local rails for KSA/GCC/Egypt — mada, local cards, wallets.
- **Trigger:** v1 checkout-abandonment-by-region data showing Stripe/PayPal friction in target markets.
- **Dependencies:** per-region merchant onboarding.
- **Hook (built):** the `PaymentProvider` interface (Phase 6). A new rail is a new adapter
  implementing `createCheckoutSession`/`parseWebhook` — the subscription state machine and
  entitlements don't change.

## 3. Cloud labs (AWS/Azure sandboxes)

- **Scope:** Sandboxed real-cloud accounts for cloud-security scenarios (misconfig, IAM, etc.).
- **Trigger:** v1 lab-cost-per-learner telemetry confirming the margin model holds (the R1 gate);
  demand from cloud-security paths.
- **Dependencies:** per-lab cloud-account provisioning + hard budget guardrails.
- **Hook (built):** the lab orchestrator's declarative scenario model (Phase 6 doc 07) — a cloud lab
  is a new scenario type behind the same session lifecycle, quota gate, and cost metering.

## 4. VPN labs at scale + machine-deploy pools

- **Scope:** Larger deployable-machine concurrency, dedicated subnets, VPN at volume.
- **Trigger:** v1 lab-utilization curves justifying warm-pool expansion.
- **Dependencies:** node-pool capacity planning against the cost model.
- **Hook (built):** warm pools, reaper, and per-tier quotas already exist (Phase 6 doc 07 §4);
  scaling is capacity tuning, not new architecture.

## 5. Proctored certifications

- **Scope:** Timed, proctored (webcam/screen) certification exams with verifiable credentials.
- **Trigger:** established brand + content depth (a cert's value *is* credibility — Phase 1 R2).
- **Dependencies:** proctoring vendor; exam-integrity policy; legal.
- **Hook (built):** the `Assessment`/exam model, timed/randomized/no-back-nav flags, and the
  verifiable-certificate system (Phase 3/6) — proctoring is an integrity layer on top.

## 6. Instructor marketplace (public)

- **Scope:** Open third-party instructor supply with revenue share (70/30, Phase 1 doc 03).
- **Trigger:** quality-control tooling matured (editorial workflow + AI pre-review proven on the
  in-house pipeline).
- **Dependencies:** payout infrastructure; content-quality SLAs; the instructor lab-builder.
- **Hook (built):** the instructor role, course/lab builders, and editorial workflow (Phase 3/6) —
  the marketplace opens the existing authoring pipeline to external supply behind a review gate.

## 7. Live classes / cohorts

- **Scope:** Scheduled live sessions, attendance, cohort assignments — the institution persona (P6).
- **Trigger:** first institution deal.
- **Dependencies:** video integration (Zoom/Meet embed); gradebook.
- **Hook (built):** cohort + assignment models (Phase 3) — live classes add scheduling + a video embed.

## 8. LMS integration (SCORM/xAPI/LTI) + SCIM

- **Scope:** Export to institutional LMS; SCIM user provisioning for enterprise SSO.
- **Trigger:** a signed enterprise/institution contract (build against a real customer, not spec).
- **Dependencies:** the specific standard the customer uses.
- **Hook (built):** enterprise export API + SSO config model (Phase 3/5); SCIM plugs into the org
  membership model.

## 9. KSA-hosted tenant option

- **Scope:** Region-pinned data residency for a government/enterprise tenant (NFR-072).
- **Trigger:** a customer requiring in-country hosting.
- **Dependencies:** a KSA region stack instantiation.
- **Hook (built):** the `org_id`/RLS design + Terraform IaC (ADR-004/013) mean homing a tenant's
  stack in-region is a module instantiation, not a schema change — the escape hatch designed in
  from Phase 2.

## 10. MSSP telemetry ingestion

- **Scope:** Client sensor/telemetry ingestion beyond portal-based reporting.
- **Trigger:** MSSP contracts that outgrow portal reporting.
- **Dependencies:** a real event-log/streaming decision (the deferred Kafka question, ADR-007).
- **Hook (planned):** the outbox/queue design and the deliberately-deferred streaming decision leave
  room; this is the one fast-follow that adds a genuinely new architectural component, and Phase 1
  flagged it as such.

## The through-line

Nine of ten fast-follows are **additive by design** — a new adapter, scenario type, integrity layer,
or region instantiation on foundations built in v1. Only MSSP ingestion introduces new
architecture, and it was flagged as a later-release decision from the start. That is the dividend of
architecting v1 with the fast-follows in mind: growth is unlocked by evidence and shipped as
extension, not rewrite.
