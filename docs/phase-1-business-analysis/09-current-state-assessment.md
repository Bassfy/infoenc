# 09 — Current-State Assessment

An honest audit of the existing MVP in this repository, and the recommendation for what happens to it.

## 1. What exists

| Layer | Implementation | Notes |
|-------|----------------|-------|
| Frontend | React 18 + Vite + Tailwind, 12 pages (landing, auth, courses, lessons, labs, leaderboard, dashboard, profile) | JSX (no TypeScript), axios client with refresh-token interceptor, auth context |
| Backend | Node.js + Express, 4 route modules (auth, courses, labs, users) | Controller pattern, express-validator, helmet, tiered rate limiting |
| Database | MySQL, 19 tables | users, refresh_tokens, categories, courses, modules, lessons, enrollments, lesson_progress, labs, lab_submissions, lab_completions, quizzes, quiz_questions, quiz_attempts, certificates, achievements, user_achievements, forum_posts, notifications — with seed data |
| Auth | JWT access (15m) + rotating refresh (7d), bcrypt cost 12 | Solid fundamentals for a prototype |
| Labs | CTF-style flag submission with hints and points; **simulated** in-browser terminal (client-side, not real environments) | The terminal is a scripted simulation — no container infrastructure exists |
| Deploy | Docker Compose, Railway/Nixpacks configs, Cloudflare Pages/Vercel configs for frontend | Prototype-grade deployment story |

## 2. What the MVP got right (carries forward as design input)

1. **The domain model is directionally correct.** courses→modules→lessons, enrollments + lesson_progress, labs with submissions/completions, achievements — this decomposition survives into Phase 3 largely intact (translated to PostgreSQL/Prisma and extended).
2. **Auth fundamentals were taken seriously**: token rotation, tiered rate limits on auth and flag submission, parameterized queries. The security posture thinking transfers.
3. **The core loop is validated in code**: learn → practice → earn points → climb leaderboard. Product intuition confirmed; we're not designing from pure theory.
4. **API shape** (resource-oriented REST with pagination/filtering) is a reasonable baseline for the public API surface.

## 3. Gap analysis vs. Phase 1 requirements

| Area | MVP state | Target | Verdict |
|------|-----------|--------|---------|
| Stack | Express/React-Vite/MySQL/JS | NestJS/Next.js 15/PostgreSQL/TS (mandated) | Rewrite |
| Payments & subscriptions | Absent entirely | Full commerce stack (doc 03) | New build |
| i18n / RTL | English-only, no i18n layer | First-class ar/en (NFR-050s) | Retrofit onto untyped JSX is costlier than building in |
| Real labs | Simulated terminal | Containerized environments, machine deploys, VPN (FR-AC-040s) | New build (infrastructure discipline) |
| Gamification | Points + static achievements | XP spine, ranks, streaks, anti-farming, event log (FR-AC-060s) | Redesign |
| Company platform | Absent | Services site, CRM pipeline, client portal (doc 05) | New build |
| Admin panel | Absent ("admin-ready" roles only) | Full back office (doc 07) | New build |
| Automation/AI | Absent | 30+ workflow catalog (doc 07) | New build |
| Multi-tenancy | Single-tenant consumer model | Org workspaces, tenant isolation (NFR-021) | Schema-level change |
| Testing | No test suite found | Quality gates (doc 08 §7) | New build |
| SSR/SEO | Client-rendered SPA | SEO-critical marketing + content pages need SSR/SSG | Framework change (Next.js) |

## 4. Options considered

**A. Evolve the MVP in place.** Incremental TypeScript migration, bolt on i18n, add payments to Express.
— Rejected. The mandated target stack differs at every layer; migration effort exceeds rebuild effort while dragging prototype constraints (untyped codebase, no test harness, SPA-only rendering) into the foundation of a platform meant to pass its own ISO audit.

**B. Two codebases indefinitely.** Keep MVP live as "v1" while building v2 alongside.
— Rejected. No paying users exist yet to justify parallel maintenance; split focus is the startup killer.

**C. Rebuild on the target stack; port the domain model and lessons; retire the MVP.** ✅ **Recommended.**

## 5. Migration plan (upon Phase 1 approval)

1. MVP code moves to `legacy/` (or an archive branch) — kept as reference for domain logic and seed content, excluded from CI. Nothing is deleted.
2. The 19-table schema becomes a named input to Phase 3 database design: each table is explicitly mapped to its successor (e.g., `labs`+`lab_submissions` → the richer lab/session/task model of FR-AC-040s) or retired with rationale.
3. Seed content (courses, labs, achievements) is exported and re-imported through the new content pipeline — first test of the content tooling.
4. MVP's rate-limit tiers and token-rotation parameters carry into the Phase 2 security baseline as starting values.
5. No production users or data exist to migrate; no cutover risk.

## 6. Effort implication

Rebuilding is not "starting from zero": domain model, product loop, and security posture are proven inputs. The genuinely new 80% (commerce, labs infrastructure, company platform, admin, automation, i18n) would be new work under any option. The rebuild decision costs roughly the 3–4 weeks the MVP took to write, and buys a foundation that doesn't need to be replaced at the first enterprise deal.
