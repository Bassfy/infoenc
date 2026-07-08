# 01 — Academy Build Notes

Implementation notes per slice, deep-dives on the two security/integrity-critical pieces, and the
ordered next steps.

## 1. Identity (`services/core-api/src/modules/identity/`)

Files and responsibilities:
- `password.service.ts` — Argon2id (64MB/t=3), HIBP k-anonymity breach check (only the SHA-1
  prefix leaves us; fail-open on the 3rd-party's availability so a HIBP outage never blocks signup).
- `token.service.ts` — access-token mint/verify + refresh-token generation/hashing. **The signer is
  a dev HMAC** over canonical claim JSON so the flow is exercisable without KMS; the production
  ES256/KMS signer implements the identical `signAccess`/`verifyAccess` surface and is swapped by
  DI. Refresh tokens are opaque random 256-bit values (never JWTs), hashed at rest.
- `session.service.ts` — the subtle one. See §3.
- `identity.service.ts` — orchestration. Registration is a single transaction: user + personal
  org-of-one + owner membership + password credential + progress summary + `identity.user.registered`
  outbox event. Login is enumeration-timing-safe (verifies against a dummy hash when the user is
  absent so response time doesn't leak account existence).
- `identity.controller.ts` — REST; refresh token set as httpOnly/SameSite=Lax/Secure cookie scoped
  to `/api/v1/auth`; access token returned in the body for in-memory client storage only.

**Deferred (scaffolded, same session issuance):** OAuth (openid-client + PKCE), passkeys
(@simplewebauthn), TOTP (otplib) + recovery codes, step-up challenge flow, the session registry UI.
All plug into `SessionService.create` — the credential varies, the session issuance doesn't.

## 2. Catalog (`modules/catalog/`)

`listCourses` demonstrates the **bilingual read contract** every content read follows (Phase 3 doc
01 §4): fetch both translation rows, prefer the requested locale, fall back to the other with a
`localeFallback: true` flag so the UI shows the "not yet available in Arabic — showing English"
notice (FR-AC-029) instead of a 404 or an empty string. Cursor pagination on the UUIDv7 PK (which
is time-ordered, so `ORDER BY id` is chronological). Catalog is global/public content, so it uses
the base Prisma client, not the RLS-scoped one (Phase 3 doc 05 §2).

## 3. Deep-dive: refresh rotation with reuse detection (NFR-002)

The requirement: a stolen refresh token must not grant lasting access, and its theft must be
detectable. The mechanism (`session.service.ts`):

1. Every session belongs to a **family** (`familyId`). Login opens a new family.
2. `rotate()` looks up the presented token's hash. On a valid, unconsumed token it **consumes the
   old row** (sets `revokedAt`) and **issues a new one in the same family** — atomic, in one
   transaction.
3. If a token that is already consumed/revoked is presented again — the signature of theft-and-replay
   — `revokeFamily()` **revokes every session in the family** and writes a `high`-severity
   `SecurityEvent`. The attacker's stolen token and the victim's current token both die; the victim
   re-authenticates; the event feeds the platform SOC (NFR-023).

Access-token revocation propagates ≤60s via the Redis `sid` denylist (Phase 2 doc 05 §3) — that
denylist wiring is part of the auth-guard slice landing next.

## 4. Deep-dive: idempotent XP (FR-AC-060)

The Phase 3 thesis was "XP is an event log, not a counter." Here's why it matters and how it's
enforced (`xp.service.ts`):

- **The problem it prevents:** the MVP incremented `users.points`. In an event-driven system a lab
  solve emits `labs.lab.solved`, which may be delivered more than once (at-least-once queues, retries,
  double-clicks). A naive `points += amount` double-counts.
- **The guarantee:** `XpEvent` has a unique constraint on `(userId, ruleKey, sourceType, sourceId)`.
  `award()` does `createMany({ skipDuplicates: true })` — a duplicate is a **no-op at the database
  level** (`count === 0`), so the method returns `{ granted: 0 }` and touches nothing else. The
  total is then recomputed by aggregating the event log, never by trusting a stored counter.
- **Anti-farming:** `diminishedAmount` returns a decreasing reward for repeated same-rule grants
  (e.g., daily-challenge XP ladders 100→60→30→10).
- **Tested:** `xp.service.spec.ts` locks the fresh-award path (grants, recomputes, updates summary)
  and the idempotent-replay path (no-op, returns existing total, doesn't touch the summary). The
  integration suite exercises the real constraint against Postgres.

## 5. Frontend (`apps/academy/`)

- Next.js 15 App Router, `[locale]` segment, next-intl middleware negotiating ar/en from cookie
  then Accept-Language, `localePrefix: "always"` for hreflang-friendly URLs (NFR-055).
- The `[locale]/layout.tsx` sets `<html lang dir>` so RTL is structural (logical properties do the
  rest — Phase 4 doc 03 §4); it mounts the theme-aware token stylesheet.
- The landing page is server-rendered, token-styled, and reads copy from the shared catalog — the
  same markup renders correctly in both directions. Cinematic hero/3D islands (Phase 4 doc 05)
  hydrate lazily and are added with the marketing polish pass.
- Self-hosted variable fonts (Geist + IBM Plex Sans Arabic) load via `next/font` in production;
  omitted from this scaffold only to avoid committing binary font assets.

## 6. Ordered next steps (continuing Phase 6)

1. **Auth guard + tenant-context middleware** — verify the access token, build the `Principal`,
   bind the `TenantContext` (Phase 5) for the request, wire the `sid` revocation denylist.
2. **orgs**: team/seat/invitation flows; org switcher re-issuing the access token.
3. **learning**: enrollment, lesson progress, quiz/exam attempts + the `learning.*` events that feed
   XP and certificates.
4. **labs**: orchestrator client (mTLS), session lifecycle, quota checks against entitlements,
   flag submission → `labs.*` events.
5. **commerce**: Stripe/PayPal adapters, subscription state machine, entitlement read model,
   checkout on the academy app.
6. **community/career**: discussions with moderation, certificates (verifiable URL), resume builder.
7. **web app**: the marketing site + client-portal shell (shared with Phase 7).

Each follows the Phase 5 module anatomy and inherits the security checklist (RLS policy for new
tenant tables, `can()` on mutations, contracts-derived DTOs, both locales, coverage floors).
