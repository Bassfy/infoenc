# 06 — Wireframes

Low-fidelity layouts for the top journeys (Phase 1 doc 04), fixing structure before Phase 5+ builds. Shown LTR; every layout mirrors under RTL via logical properties (doc 03 §4) — the inline-start column becomes the right column in Arabic automatically. These are structure, not visual comps (that's Storybook + the build phases).

Legend: `[ ]` region · `▸` primary action · `≣` list/repeat · `◲` media/3D.

## 1. Academy landing (J1 discover) — marketing, cinematic

```
┌───────────────────────────────────────────────┐
│ Navbar: ◧ logo   paths  labs  pricing   ⌘K  🌐 ☾ ▸Sign in │  ← glass, sticky
├───────────────────────────────────────────────┤
│  HERO                                          │
│  H1 headline (5xl)          ◲ R3F cipher scene │  ← poster-first, 3D hydrates
│  sub (xl)                     (lazy, reduced-  │
│  ▸ Start free   ▸ Explore     motion → still)  │
│  · trust row: "from real engagements"          │
├───────────────────────────────────────────────┤
│  GUEST LAB TASTER  [ terminal preview ]  ▸Play │  ← FR-AC-090, no account
├───────────────────────────────────────────────┤
│  PATHS ≣ card card card  (scroll-reveal)       │
│  WHY-US ≣ hands-on · bilingual · from-the-field│
│  SOCIAL PROOF ≣ logos / outcomes               │
│  PRICING preview  ▸See plans                    │
├───────────────────────────────────────────────┤
│  Footer: bilingual, sitemap, security.txt, 🌐  │
└───────────────────────────────────────────────┘
```

## 2. Onboarding (J1 hook) — 2 questions, not a wizard

```
┌──────────────────────────────┐
│  Step 1/2   ●○               │
│  What's your goal?           │
│  ≣ [SOC Analyst] [Pentester] │  ← big tappable cards
│    [Cloud Sec]  [Just curious]│
│                        ▸Next │
└──────────────────────────────┘
   → generates recommended path, drops into dashboard with first badge
```

## 3. Learner dashboard (J1 retain)

```
┌───────────────────────────────────────────────┐
│ AppShell nav ◧                                 │
├──────────────┬────────────────────────────────┤
│ [Continue]   │  RIGHT RAIL                     │
│  path card   │  ◲ rank + XPMeter               │
│  ▸resume     │  🔥 streak                       │
│              │  monthly leaderboard ≣ rank rows │
│ [Your paths] │                                 │
│  ≣ progress  │  [Next milestone → certificate] │
│              │                                 │
│ [Recommended]│  [Recent badges] ≣              │
│  ≣ labs      │                                 │
└──────────────┴────────────────────────────────┘
```

## 4. Lab console (FR-AC-040) — the hardest UI

```
┌───────────────────────────────────────────────┐
│ Lab title · difficulty ·  ⏱ 58:12  ▸Extend ⛶  │  ← session-state banner
├───────────────────┬───────────────────────────┤
│ TASKS  (inline-   │  CONSOLE                    │
│  start panel)     │  ┌───────────────────────┐ │
│ ≣ ▸ Task 1  ✓     │  │ xterm.js terminal     │ │  ← WS to session gateway,
│   ▸ Task 2  ◻     │  │ (or Guacamole desktop)│ │    bypasses GraphQL
│     [flag input]  │  │                       │ │
│     ▸Submit       │  └───────────────────────┘ │
│   ▸ 💡 hint (−XP) │  reduced-motion safe        │
│                   │  a11y: task ✓ announced via │
│  progress ▓▓▓░░   │  live region                │
└───────────────────┴───────────────────────────┘
   refresh-safe: reattaches by session id
```

## 5. Contextual paywall (J1 convert, FR-AC-071)

```
┌──────────────────────────────┐
│ 🔒 This lab is in your path   │
│ "SOC Analyst — 22% complete"  │  ← shows THEIR progress, not generic
│ ▓▓▓░░░░░░░  22%               │
│                               │
│ Unlock 31 remaining rooms:    │
│ PricingTable (local currency) │  ← EGP/SAR per locale
│  ▸Learner  ▸Pro  · quarterly  │
│ ▸Start 7-day — cancel anytime │
└──────────────────────────────┘
```

## 6. Company services page (J3, FR-CO-002)

```
┌───────────────────────────────────────────────┐
│ Navbar (services register: calmer, airier)     │
├───────────────────────────────────────────────┤
│  H1 service name · one-line outcome            │
│  [Methodology steps ≣]  [Deliverables sample]  │
│  [Engagement timeline]  [FAQ accordion]        │
│  ▸ Scope this engagement  (→ structured form)  │
│  · certifications · sample report excerpt      │
└───────────────────────────────────────────────┘
```

## 7. Client portal — findings feed (J3, FR-CO-032)

```
┌───────────────────────────────────────────────┐
│ Engagement: Acme Web Pentest · In progress     │
├──────────────┬────────────────────────────────┤
│ [Scope]      │  FINDINGS  (live)               │
│ [Schedule]   │  ≣ SeverityBadge Critical  ▸    │  ← color+icon+label
│ [Findings] ● │    "SQLi in /login"  · open      │
│ [Reports]    │  ≣ High  · remediating          │
│ [Messages]   │  ≣ Medium ...                   │
│ [Evidence]   │  filter: severity · status      │
│              │  new finding animates in (WS)   │
└──────────────┴────────────────────────────────┘
   org-scoped by RLS; critical → immediate alert
```

## 8. Admin — engagement / findings editor (FR-CO-051)

```
┌───────────────────────────────────────────────┐
│ Admin (dense mode) · Engagement ENG-2026-0042  │
├──────────────┬────────────────────────────────┤
│ nav ◧        │  DataTable: findings ≣          │
│  dashboards  │   severity · asset · status ·▸  │
│  crm         │  ▸New finding (from library)    │
│  engagements●│  ┌ Finding editor ─────────────┐│
│  academy-ops │  │ template · CVSS · evidence   ││
│  automation  │  │ bilingual body · ▸Publish    ││  ← approval gate
│  settings    │  └──────────────────────────────┘│
└──────────────┴────────────────────────────────┘
```

## 9. Corporate workspace (J2, FR-AC-110)

```
┌───────────────────────────────────────────────┐
│ Org: Bank Security Team · 20 seats             │
├──────────────┬────────────────────────────────┤
│ [Members ≣]  │  Team progress dashboard        │
│  seat status │  ≣ per-member completion         │
│ [Assignments]│  private leaderboard             │
│  ▸Assign path│  ▸Export report (CSV/PDF)        │
│ [Reports]    │  skill-gap → cross-sell flag     │
└──────────────┴────────────────────────────────┘
```

## Notes for the build phases

- Every screen has an **RTL mirror** — validate both in Storybook and E2E (Phase 2 doc 04 §8).
- Every list/table region is **horizontal-scroll-safe** (`.overflow-scroll-x`) so the page body never scrolls sideways in either direction.
- Loading, empty, and error states are required for every data region (EmptyState/Skeleton/Alert components) — not an afterthought in the build.
- The paywall, dashboard, and lab console are the highest-leverage conversion/retention surfaces (Phase 1 doc 04 metrics) — they get the most design polish in Phase 6.
