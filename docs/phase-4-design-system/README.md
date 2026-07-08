# Phase 4 — Design System

**Status:** Awaiting stakeholder approval
**Baseline:** Phase 2 (frontend architecture, `packages/ui`, i18n/RTL plumbing) + Phase 3 (the product's data shapes).
**Approval gate:** Sign-off before Phase 5 (Core Platform Build) begins.

---

## Objectives

1. Give INFOENC a **handcrafted brand and visual language** that reads as premium and deliberate — the antithesis of a template or an AI-generated theme (the explicit product mandate).
2. Ship **real design tokens** (color, type, space, radius, elevation, motion) as code the three apps consume directly — not a mood board.
3. Make **Arabic and English co-equal by design**, not by translation: a bilingual type system, RTL as a first-class layout, bidi-safe mixed content.
4. Define the **component library foundation** (Radix/shadcn base + INFOENC skin) with states, anatomy, and accessibility baked in (NFR-060s).
5. Establish the **motion and 3D language** — cinematic where it earns attention, invisible where it doesn't, always `prefers-reduced-motion`-safe (NFR-062).
6. Wireframe the **top journeys** (Phase 1 doc 04) so Phase 5+ builds against agreed layouts.

## Deliverables

| # | Document | Covers |
|---|----------|--------|
| 01 | [Brand Guidelines](01-brand-guidelines.md) | Positioning, name/logo, color story, voice & tone, do/don't |
| 02 | [Design Tokens](02-design-tokens.md) | The token system: OKLCH color ramps, semantic mapping, scales |
| 03 | [Bilingual Typography](03-bilingual-typography.md) | Font pairing, type scale, Arabic/RTL specifics, bidi rules |
| 04 | [Component Library](04-component-library.md) | Inventory, anatomy, states, variants, accessibility contract |
| 05 | [Motion & 3D](05-motion-and-3d.md) | Motion language, easing/duration tokens, WebGL direction, reduced-motion |
| 06 | [Wireframes](06-wireframes.md) | Layouts for the top journeys, both directions |

## Real code shipped this phase

```
packages/ui/tokens/
├── tokens.css        # CSS custom properties — dark-first, light override, theme-aware
├── tokens.ts         # typed token exports (color/space/type/motion) for JS consumers
└── globals.css       # base reset, logical-property defaults, font-face, dir handling
packages/config/
└── tailwind-preset.ts # Tailwind preset wiring tokens → utilities (logical props enforced)
```

These are the actual files `packages/ui` and the apps import (Phase 2 doc 02). Tokens are defined once here and referenced everywhere — a color is never hardcoded in a component.

## Design principles (the non-negotiables)

1. **Dark-mode-first, light fully supported.** The product's native habitat is dark (practitioners live in terminals); light mode is a first-class citizen, not an afterthought.
2. **Restraint is the premium signal.** Generous space, few accents, one confident type pairing. The cliché "neon-green-on-black hacker" look (which the MVP used) is explicitly rejected — it reads as amateur, not elite.
3. **Motion has meaning or it's gone.** Every animation communicates state, hierarchy, or spatial continuity. Decoration that doesn't inform gets cut.
4. **Both scripts are designed, not flipped.** Arabic typography is chosen and tuned, not a CSS `direction: rtl` slapped on Latin layouts.
5. **Accessibility is a constraint, not a review step.** Contrast, focus, motion, and keyboard are token- and component-level guarantees.

## Approval checklist

- [ ] Brand direction and color story (doc 01)
- [ ] The token architecture and palette (doc 02) — especially the accent (`cipher`) and the severity scale tie-in
- [ ] Font pairing: Geist (Latin) + IBM Plex Sans Arabic + Geist Mono (doc 03)
- [ ] Component inventory scope for v1 (doc 04)
- [ ] Motion budget and 3D usage boundaries (doc 05)
