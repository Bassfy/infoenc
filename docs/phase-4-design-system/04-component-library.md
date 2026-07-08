# 04 — Component Library

`packages/ui` is the shared component library (Phase 2 doc 02). Base behavior comes from **Radix UI** primitives (accessible, unstyled) via the **shadcn** pattern (copy-in, own the code), skinned with INFOENC tokens. The library knows nothing about the domain — it renders design; feature composites live in each app's `components/`.

## 1. Layered inventory

### Primitives (token-driven, no domain knowledge)
Button, IconButton, Link, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, Slider, Label, FormField (label+control+error+hint), Badge, Tag, Avatar, Tooltip, Kbd, Separator, Skeleton, Spinner, Progress, Meter, Code, ScrollArea.

### Composites
Card, Dialog/Modal, Drawer/Sheet, Popover, DropdownMenu, ContextMenu, Tabs, Accordion, Table (sortable, sticky header, horizontal-scroll-safe), DataTable (pagination, filter, column controls — admin), Toast, Alert, Banner, Breadcrumb, Pagination, EmptyState, Stepper, CommandPalette (⌘K), ThemeToggle, LocaleToggle.

### Brand / product components
- **SeverityBadge** — the severity scale (info→critical) with color **+ icon + label** (never color-only, NFR-064). Shared by academy (lab difficulty framing) and admin (findings) — one component, the `tokens.ts` severity source.
- **RankBadge / XPMeter / StreakFlame / LeaderboardRow** — gamification surface (FR-AC-060s), controlled color, celebratory motion (doc 05).
- **LabConsoleShell** — the split terminal/task layout wrapper (Phase 2 doc 04 §4): xterm mount, task panel, timer/controls, session-state banner. A11y-instrumented (live regions for task completion).
- **CertificateCard / BadgeShareCard** — OG-shareable, bilingual (FR-AC-062/065).
- **PricingTable** — plan matrix with locale currency (doc 03 commerce), highlight/most-popular treatment.
- **GlassPanel** — the glassmorphism surface (brand doc §5) with contrast-safe fallback when `backdrop-filter` is unsupported.
- **NoiseField / GradientMesh** — the brand "signal from static" background elements (doc 01 §6), reduced-motion static variants.

### Layout
AppShell (nav + content + optional aside), Navbar, Sidebar, Footer, PageHeader, SectionHeader, Container, Grid helpers.

## 2. Component anatomy contract

Every component ships with:
1. **Variants + sizes** via a typed variant API (cva-style): e.g., Button `variant: primary | secondary | ghost | danger | link`, `size: sm | md | lg`, `tone` where relevant.
2. **All interaction states** designed, not just default: `hover`, `active`, `focus-visible`, `disabled`, `loading`, and where applicable `selected`, `error`, `success`. A component isn't done until every state exists in both themes and both directions.
3. **Full keyboard + ARIA** (from Radix where possible): roles, labels, focus management, escape/arrow behavior. Custom components document their keyboard model.
4. **RTL correctness**: built on logical properties; directional icons flip, others don't (doc 03 §4).
5. **Reduced-motion** behavior (doc 05).

## 3. Example: Button contract

| State | Primary (dark) | Note |
|---|---|---|
| Default | `bg-accent`, `text-on-accent` | Cipher — the one hero color, used for the single primary action per view |
| Hover | `bg-accent-hover` | 140ms standard ease |
| Active | scale 0.98, faster | Tactile, not bouncy |
| Focus-visible | 2px cipher ring, 2px offset | Never removed (NFR-061) |
| Disabled | reduced opacity, no pointer | Communicates, doesn't hide |
| Loading | spinner replaces label, width held | No layout shift |

Only **one** primary button per view (the confident-restraint principle); everything else is secondary/ghost.

## 4. Density modes

The same components serve marketing (airy), academy (balanced), and admin (dense). Density is a wrapper concern (spacing scale + font-size step), not a fork — a `data-density="compact"` context tightens paddings via tokens so admin tables stay usable without a second component set.

## 5. Documentation & development

- Components are developed in **Storybook** (or Ladle) with stories per variant/state, both themes, both directions (LTR/RTL toggle in the toolbar) — the visual regression surface.
- **Chromatic/Playwright visual snapshots** per story catch unintended visual change; **axe-core** runs on every story (a11y regression gate, NFR-060).
- The living design-system site (published from Storybook) is the single reference for engineers and stakeholders.

## 6. Design-system CI gates

Runs on every `packages/ui` change:
1. **Contrast assertions** on token pairs (doc 02 §4) — a token edit that breaks WCAG AA fails.
2. **axe-core** on all stories — zero violations.
3. **Visual regression** snapshots — intentional changes reviewed, accidental ones blocked.
4. **RTL snapshot** parity — every story rendered LTR and RTL.
5. **Bundle size** per component (size-limit) — the premium look must not cost the performance budget (Phase 2 doc 04 §5).

## 7. v1 scope

All primitives + composites + the brand/product components above are v1 (they're needed by the core platform and academy builds). Institution-specific components (gradebook, SCORM player) and the instructor lab-builder canvas are deferred with their features (Phase 1 cutlines).
