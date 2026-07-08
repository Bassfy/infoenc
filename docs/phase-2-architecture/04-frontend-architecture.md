# 04 — Frontend Architecture

Next.js 15 (App Router, React Server Components), TypeScript strict, Tailwind (logical properties), design system from `packages/ui` (Phase 4 fills the visual layer; this doc fixes the technical skeleton it lands on).

## 1. Three apps, one system

| App | Domain | Character | Rendering posture |
|---|---|---|---|
| `web` | infoenc.com | Cinematic marketing + trust; client portal at `/portal` | Static-first: SSG/ISR for marketing & blog; SSR for portal |
| `academy` | academy.infoenc.com | Product app; dense, fast, session-heavy | SSR shell + client interactivity; SSG for public catalog/pricing/cert-verification |
| `admin` | admin.infoenc.com | Back office; density over cinema | Fully dynamic SSR; zero public caching; stricter CSP |

Why three (ADR-012): the company site and academy have different audiences, performance envelopes, and release cadences — a marketing animation experiment must never risk the learning app; admin's security posture (IP allowlist option, no public cache, staff-only auth) is cleanest as its own deployment. Shared `packages/ui` + tokens keep them one visual family; the client portal rides on `web` because it shares audience and brand gravity with the services site (P4 journey J3).

## 2. Rendering & data rules

1. **Server Components fetch; client components interact.** Data enters pages via RSC calls to GraphQL (persisted queries) with the user's session; client components receive props or subscribe to the WS gateway for live data (lab feedback, notifications, leaderboards).
2. **Mutations via typed client hooks** (generated from contracts) with optimistic updates only where reversal is trivial (votes, bookmarks) — never on money or progress writes.
3. **State discipline:** server cache is the state; client state is UI-only (Zustand slices for lab console, quiz player, resume builder). No global client store of server data — that's the router cache + `@tanstack/react-query` layer's job for client-side refetch.
4. **Marketing pages ship near-zero JS.** RSC + CSS animations by default; Framer Motion islands only where motion is meaningful; Three.js/R3F scenes lazy-loaded, `prefers-reduced-motion`-gated, and budgeted (see §5).

## 3. i18n & RTL plumbing (NFR-050s)

- `next-intl` with `[locale]` segment; middleware negotiates from cookie → `Accept-Language`; locale switch preserves route + state (NFR-053).
- **Logical properties only** (`ps-*`/`pe-*`, `ms-*`/`me-*`) — enforced by the Tailwind preset + stylelint rule; no `left/right` utilities pass CI. `dir` set at the html root per locale; icon mirroring via a `directional` prop on the icon component (only semantically directional icons mirror).
- Bidi-safe rendering for mixed content: code blocks, hostnames, and CLI text inside Arabic prose render LTR-isolated (`unicode-bidi: isolate`) via the markdown renderer — this is where naive RTL implementations fail and ours is tested (golden-file snapshots of mixed-content lessons).
- Fonts: variable Arabic + Latin pairing chosen in Phase 4; loaded via `next/font` with per-locale subsets; `font-display: swap` with metric-compatible fallbacks to protect CLS.
- Dates/numbers via `Intl` through `packages/i18n` helpers (Hijri display option — NFR-052).

## 4. The lab console (the hardest UI)

- Terminal: xterm.js over WebSocket to the session gateway; desktop labs: Guacamole client embed. Both live in a `(labs)/session/[id]` route with a split layout: tasks/flags panel + console + timer/controls.
- Session state machine mirrored client-side (provisioning → ready → active → idle-warning → expired) driven by WS events; refresh-safe (reattach by session ID — FR-AC-040 AC).
- Fullscreen, font-size, and keyboard-passthrough controls; a11y: the task panel is fully screen-reader navigable, task completion announced via live regions (NFR-063); terminal keyboard-trap behavior documented and escapable (NFR-061).
- Console traffic bypasses the GraphQL layer entirely — straight to the lab gateway with the session token.

## 5. Performance budgets (CI-enforced, NFR-030)

| Surface | Budget |
|---|---|
| Marketing routes | ≤ 90KB gzipped JS initial; LCP ≤ 2.0s lab-tested; Lighthouse ≥ 95 all categories, both locales |
| Academy learn routes | ≤ 180KB initial; INP ≤ 200ms; route-level code splitting mandatory |
| 3D/WebGL scenes | Lazy, interaction-or-viewport triggered; ≤ 400KB assets; static poster fallback for reduced-motion/low-power |
| Fonts | ≤ 120KB total across both scripts (variable + subsets) |

Budgets run in CI via Lighthouse CI against preview deploys for `ar` and `en`; regression fails the PR. Images: `next/image` + Cloudflare polish, AVIF-first. Video: Cloudflare Stream player, poster-first, no autoplay with audio.

## 6. SEO architecture (Phase 1 SEO mandate)

- Metadata API per route with localized title/description/OG; `hreflang` pairs emitted from the locale segment automatically (NFR-055).
- JSON-LD: `Organization`, `Service` (company pages), `Course`/`LearningResource` (catalog), `JobPosting` (job board), `Article` (blog), `FAQPage` (service FAQs) — generated from CMS data, not hand-maintained.
- Per-locale sitemaps regenerated on publish events (CMS webhook → revalidation route); `robots.txt` blocks admin/portal/session routes.
- OG images generated per content item (`@vercel/og`-style edge rendering) with bilingual templates — shareable badge/cert cards feed the referral loop (FR-AC-062).

## 7. Frontend security (NFR-010s)

- Strict CSP per app (nonce-based scripts, no `unsafe-inline`; admin adds `frame-ancestors 'none'`, no third-party origins).
- Session: httpOnly SameSite=Lax cookies for refresh; access token in memory only (doc 05 §3); CSRF token on portal/admin form posts as defense-in-depth.
- Cloudflare Turnstile on auth + public forms (invisible tier first).
- Markdown/user content rendered through a single sanitizing renderer (rehype-sanitize allowlist) — forum posts, lesson content, and writeups share it; raw HTML never reaches `dangerouslySetInnerHTML` unsanitized.
- Dependency budget discipline: every new client dependency needs a bundle-size justification in the PR (guarded by size-limit CI check).

## 8. Accessibility gates (NFR-060s)

axe-core in Playwright E2E on the top-10 journeys, both locales, both themes; manual audit checklist per release on quiz player, lab console, checkout. Focus management centralized: route-change focus reset, dialog focus traps from Radix primitives, skip-links in all three apps.
