# Phase 6 — Academy Build

**Status:** In progress (foundational vertical slices landed; feature completion is iterative)
**Baseline:** Phase 5 skeleton (RLS isolation, authz gate, contracts, CI).
**Approval gate:** Sign-off on the approach + the slices below before continuing the module buildout.

---

## Objectives

Turn the skeleton into the learning product: identity (real auth), the org model in use, the
bilingual content pipeline, the gamification spine, browser-lab integration, checkout, and the
`academy` + `web` Next.js apps — all on the Phase 5 security foundation.

## What this phase delivers, honestly

The academy is the single largest requirement surface in the whole project (Phase 1 doc 06 lists
~130 requirements). Building it as one monolithic drop would be neither reviewable nor trustworthy.
Instead this phase lands **real, working vertical slices** that prove each pattern end-to-end, with
an explicit status matrix so nothing is misrepresented as "done" when it's scaffolded. Slices are
production-grade where marked ✅; scaffolded slices have real shape and signatures with the business
logic filled in iteratively.

## Module status matrix

| Module | Status | What's real now |
|--------|--------|-----------------|
| **identity** | ✅ password auth · 🔩 OAuth/passkey/MFA | Argon2id hashing + HIBP breach check, JWT access tokens (dev HMAC signer; KMS ES256 swap-in documented), refresh sessions with rotation + **family reuse-detection → family revoke + security event**, register (creates user + personal org + membership atomically + outbox event), login (enumeration-timing-safe), REST controller with httpOnly refresh cookie. OAuth/passkey/TOTP reuse the same session issuance (scaffolded). |
| **gamification** | ✅ XP engine | **Idempotent** XP award (unique `(userId,ruleKey,sourceType,sourceId)` → replays are no-ops), total recomputed from the append-only event log (never a drifting counter), rank resolution, diminishing-returns for anti-farming. Unit-tested. |
| **catalog** | ✅ read slice | Course listing with the **bilingual translation-row fallback** (shows the other locale + a `localeFallback` flag rather than 404 — FR-AC-029), cursor pagination, published-status filter. |
| **orgs** | 🔩 in use | Personal org-of-one created at registration and carried as the tenant context; team/seat/invite flows next. |
| learning · labs · commerce · community · career | 🔩 scaffolded | Schema (Phase 3) + module boundaries + event taxonomy in place; services build out next, each following the Phase 5 module anatomy and inheriting the security checklist. |
| **academy app** | ✅ scaffold | Next.js 15 App Router, next-intl locale routing (`/ar`, `/en`), bilingual `[locale]` layout setting `lang`/`dir`, token-driven landing page, Tailwind on the shared preset. |
| **@infoenc/i18n** | ✅ | Shared ar/en catalogs, locale negotiation + Intl formatters, and the **parity gate** (CI-run; verified: 28 keys in sync). |

✅ = working, tested where testable · 🔩 = real shape/boundaries, logic iterative

## The two things worth reviewing closely

1. **The auth session model** (`identity/session.service.ts`) — refresh rotation with family
   reuse-detection is the subtle, security-critical part. A replayed (already-consumed) token kills
   the whole family and raises a security event, so a stolen token is worthless and the real user
   is forced to re-auth. This is the NFR-002 requirement made concrete.
2. **The XP idempotency guarantee** (`gamification/xp.service.ts`) — the Phase 3 integrity thesis
   (event log, not counter) realized: the same lab solve can fire its event ten times and award XP
   exactly once, because the database unique constraint makes duplicates no-ops. Unit tests lock
   both the fresh-award and idempotent-replay paths.

## Verified this phase

- `@infoenc/i18n` parity gate **runs and passes** (28 keys, ar/en in sync).
- `@infoenc/contracts` **typechecks** against real zod (from Phase 5).
- Prisma schema **validates** with the Phase 6 usage.

Full monorepo `pnpm install && build` (Next 15 + Nest + React 19 graph) runs in CI; not executed
in this authoring environment (documented in the phase summary, consistent with Phase 5).

## Deliverables doc

| Doc | Covers |
|-----|--------|
| [Academy Build Notes](01-build-notes.md) | Per-slice implementation notes, the auth + XP deep-dives, what's next |

## Approval checklist

- [ ] The slice-by-slice approach with the honest status matrix
- [ ] The auth session/rotation model as implemented
- [ ] The XP idempotency model as implemented
- [ ] The bilingual content fallback behavior (locale row → other locale + notice, never 404)
- [ ] The academy app's i18n/RTL structure
