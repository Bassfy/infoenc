# 03 — Backend Architecture (core-api)

NestJS 10, TypeScript strict, Prisma ORM, deployed as `core-api` (HTTP/WS) and `core-worker` (BullMQ consumers) from one codebase.

## 1. Module map

Modules are the seams of the monolith. Each owns its Prisma models, exposes a `public-api.ts` facade, and communicates with peers via facade calls (synchronous, same transaction when needed) or domain events (asynchronous, cross-cutting).

```
modules/
├── identity/        # users, sessions, credentials, OAuth, WebAuthn, TOTP, recovery (doc 05)
├── orgs/            # organizations, memberships, seats, invitations, SSO config (doc 06)
├── authz/           # roles, permissions, ABAC policies, the can() service (doc 05 §5)
├── catalog/         # paths, courses, modules, lessons, quizzes, exams — bilingual content
│                    # model, versioning (FR-AC-028), editorial workflow (FR-AC-103)
├── learning/        # enrollments, progress, quiz/exam attempts, assignments, cohorts
├── gamification/    # XP event log, ranks, badges, streaks, leaderboards (FR-AC-060s)
├── labs/            # lab definitions, tasks, flags, session records (metadata side);
│                    # talks to lab-orchestrator over mTLS for the infrastructure side
├── ctf/             # standing challenges, scheduled events, event scoring (FR-AC-050s)
├── community/       # discussions, forums, votes, accepted answers, moderation queue
├── career/          # roadmaps, job board, resume builder, profiles' public views
├── commerce/        # plans, subscriptions, entitlements, payments (provider adapters),
│                    # invoices, coupons, referrals, affiliates, gift cards, dunning
├── crm/             # leads, pipeline, accounts-360, activities, cross-sell flags (FR-AD-020s)
├── engagements/     # services engagements, findings library, findings, evidence,
│                    # report assembly, retest workflow, client portal surface (doc 05 P1)
├── support/         # tickets, SLA timers, canned responses, KB, CSAT (FR-AD-050s)
├── cms/             # marketing pages, blog, service pages, media library (FR-AD-030s)
├── notifications/   # in-app center, email dispatch, preferences, digests (FR-AC-130)
├── automation/      # workflow engine, LLM gateway, human-gate queues, run traces (doc 07 P1)
├── analytics/       # event ingestion, dashboard aggregates, cohort/report jobs (FR-AD-010s)
├── audit/           # immutable audit log — append-only, hash-chained (FR-AD-002)
├── search/          # Meilisearch indexing consumers + query API (FR-AC-131)
├── files/           # S3 presigning, evidence bucket policies, watermarking pipeline
└── platform/        # outbox relay, idempotency, rate limiting, health, feature flags
```

Dependency direction is enforced downward-only through layers: `platform` ← everything; `identity/orgs/authz` ← domain modules; domain modules ← each other **only via events or facades** (lint-enforced, doc 02 §2.3).

## 2. API strategy (ADR-005)

**GraphQL — for our own frontends.** Single endpoint `/graphql` (Apollo Server on Nest), schema composed from module contributions. Why: the academy dashboard, admin 360 views, and portal screens are deeply nested reads; GraphQL removes the N-request waterfall and over-fetch. Guardrails: persisted queries only in production (arbitrary queries rejected — kills the introspection/abuse surface), depth+cost limits, DataLoader per request to prevent N+1.

**REST — for the world.** `/api/v1/*` (OpenAPI 3.1, generated from zod contracts): public API (cert verification, catalog), partner/enterprise export APIs (FR-AC-112), and **all inbound webhooks** (Stripe, PayPal, OAuth callbacks, e-sign) — webhook providers speak REST, period. Versioned in the path; deprecation policy: n-1 supported 12 months.

**WebSocket** — Socket.IO gateway, Redis adapter: notifications, lab task feedback, portal finding feed, leaderboard ticks. Auth on connect via the same access token; rooms scoped by user/org; server pushes are event-consumer-driven.

## 3. Events, queues, jobs

**Transactional outbox** (`platform/outbox`): every domain state change that others care about writes an event row in the same Postgres transaction as the change. A relay (LISTEN/NOTIFY + polling fallback) publishes to BullMQ. This is the platform's honesty guarantee: no "saved but never announced" bugs, no dual-write races.

**Event taxonomy** (`packages/contracts/events`): `identity.user.registered`, `learning.lesson.completed`, `labs.task.completed`, `labs.session.{started,expired}`, `gamification.xp.awarded`, `commerce.subscription.{created,renewed,past_due,canceled}`, `engagements.finding.published`, `support.ticket.created`, `automation.run.{completed,gated}` … Payloads are zod-versioned; consumers declare idempotency keys and BullMQ handles retry with exponential backoff → dead-letter queue with alerting.

**Queues** (BullMQ on Redis — ADR-007): `events` (fan-out), `emails`, `media` (video pipeline callbacks, image optimization), `pdf` (certificates, invoices, reports), `search-index`, `automation` (LLM workflows — separate concurrency pool so a slow model call never starves emails), `billing` (dunning, renewals), `analytics`. Scheduled jobs via BullMQ repeatables: streak evaluation, digest sends, quota resets, session-cost rollups, backup verification.

## 4. Commerce internals (the money path — 90% branch coverage mandate)

- **Provider abstraction:** `PaymentProvider` interface (create checkout, portal, refund, webhook parse) with `StripeProvider`, `PayPalProvider` at v1; regional adapters (Moyasar/Paymob) implement the same interface post-launch (FR-AD-041). Card data never transits our servers — provider-hosted checkout (NFR-071, SAQ-A).
- **Entitlements are computed, cached, and event-refreshed:** a single `entitlements` read model (plan features + seat grants + comps) consulted by API guards and the lab quota checker. Webhook → subscription state machine (`trialing → active → past_due → suspended → canceled`) → `entitlements.refresh` event.
- **Invoices are legal documents:** sequential per-jurisdiction numbering issued inside a serialized transaction; immutable once issued; credit notes for corrections; bilingual PDF via `packages/pdf` (FR-AD-042).
- **Idempotency everywhere:** all webhook handlers and payment mutations take idempotency keys; replays are no-ops by construction.

## 5. Automation module (the AI layer)

- **Workflow engine:** each FR-AU workflow is a declared definition — trigger (event/schedule/manual), steps (deterministic functions + LLM steps), gate policy (auto | human-approve), and output channel. Definitions in code (typed, reviewed), runs in Postgres with full trace: inputs, model+version, tokens, output, gate decision, actor (doc 07 P1 traceability rule).
- **LLM gateway:** one internal client wrapping providers; per-workflow context builders enforce data boundaries (an engagement-report run can only load its own engagement's data — the builder takes an engagement ID, not a query interface). Prompt templates versioned in-repo; evaluation sets per workflow gate autonomy thresholds (FR-AU-021 AC).
- **Human-gate queues:** gated outputs land in admin review queues with diff-style approve/edit/reject; decisions feed the workflow's evaluation set.

## 6. Cross-cutting services

| Concern | Implementation |
|---|---|
| Rate limiting | Redis sliding window; tiers per endpoint class (auth 10/15min, flags 15/min, API default 300/min) keyed by user→IP→ASN escalation (NFR-013); 429s carry Retry-After |
| Search | Meilisearch, separate `*_ar`/`*_en` indexes with language-appropriate tokenization; indexing via `search-index` queue consumers (ADR-011) |
| Files | S3 presigned URLs only (API never proxies bytes); evidence bucket: object-lock, per-org prefixes, 72h expiring links, access events → audit (FR-CO-033) |
| PDFs | Headless-Chromium render workers from React templates — one templating skill for web, email, and PDF; Arabic shaping verified in CI golden-file tests |
| Email | React Email templates, provider adapter (SES primary), locale from recipient preference; all sends queued, logged, and suppression-list aware |
| Audit | Append-only table, hash-chained rows, no UPDATE/DELETE grants to app role; admin actions middleware-captured with before/after (FR-AD-002) |
| Feature flags | Postgres-backed with Redis cache; used for staged rollouts (NFR-082) and cutline features shipped dark |
| Health/ops | `/healthz` (liveness), `/readyz` (deps), OpenTelemetry auto-instrumentation, error IDs in every 5xx envelope (NFR-080) |

## 7. Error envelope (REST) / extensions (GraphQL)

```json
{
  "error": {
    "code": "LAB_QUOTA_EXCEEDED",
    "message": "localized, user-facing, in request locale",
    "errorId": "err_7f3a2b…",
    "retryAfter": 3600
  }
}
```

Stable machine codes (contracts package), localized messages, support-referenceable `errorId` correlated to traces. GraphQL errors carry the same shape in `extensions`.
