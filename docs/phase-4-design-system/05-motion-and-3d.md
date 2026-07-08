# 05 — Motion & 3D

Award-winning feel comes from motion that is **purposeful and restrained**, not from more animation. The rule: motion communicates state, hierarchy, or spatial continuity — or it's cut (brand doc §2, principle 3).

## 1. Motion tokens (single source)

Durations and easings live in `tokens.css` / `tokens.ts` and are the **only** timing values Framer Motion and GSAP configs use — no inline magic numbers.

| Token | Value | Use |
|---|---|---|
| `instant` | 80ms | State flips (checkbox, toggle) |
| `fast` | 140ms | Hover, small transitions |
| `base` | 220ms | Most UI (dialogs, dropdowns, cards) |
| `slow` | 380ms | Larger surfaces (drawers, page sections) |
| `cinematic` | 720ms | Hero reveals, scroll set-pieces (marketing only) |
| `ease-standard` | `cubic-bezier(0.2,0,0,1)` | Default — decelerate into place |
| `ease-emphasized` | `cubic-bezier(0.16,1,0.3,1)` | Entrances that should feel confident |
| `ease-exit` | `cubic-bezier(0.4,0,1,1)` | Exits — accelerate away |

## 2. Motion vocabulary

- **Enter/exit:** fade + short translate (8–16px) on the standard/emphasized ease. No spin, no bounce in product UI (bounce reads as toy, not premium). Bounce/spring is reserved for **celebration** moments only (badge earned, lab solved, streak milestone) — earned delight, sparingly.
- **Spatial continuity:** shared-element transitions where an item expands into a detail (course card → course page) so the user never loses context.
- **Micro-interactions:** button press (scale 0.98), input focus (ring draw), tab underline slide, toggle knob travel, copy-confirmation — small, fast, tactile.
- **Live/data motion:** XP counting up, progress filling, leaderboard row re-ordering, the lab session timer, a new finding appearing in the portal feed — motion that represents real state change, not decoration.
- **Direction-aware:** slide-in directions respect `dir` (a drawer enters from the inline-start edge in both LTR and RTL) — motion is built on logical properties too.

## 3. Cinematic surfaces (marketing only)

The company and academy landing pages carry the award-winning set-pieces:
- **Scroll-driven reveals** (GSAP ScrollTrigger / Framer scroll): sections resolve in as you scroll — the "signal from static" brand metaphor (structured noise sharpening into content).
- **Parallax depth** on hero layers, subtle and low-amplitude (premium ≠ carnival).
- **Pointer-reactive** hero elements (the cipher-ring mark responding to cursor) — delight without noise.
These live **only** on marketing routes, never in the learning app or admin (which prioritize speed and density). The academy uses the same vocabulary at lower amplitude.

## 4. 3D / WebGL (Three.js + React Three Fiber)

- **Where:** the hero moment of each landing page and select feature showcases — a restrained 3D form expressing the transform/cipher idea (an abstract rotating cipher structure, a resolving particle field). Not scattered across the product.
- **Budget (NFR-030, Phase 2 doc 04 §5):** R3F scenes are **lazy-loaded**, triggered on viewport/interaction, ≤400KB assets, and ship a **static poster fallback** for reduced-motion, low-power, and reduced-data conditions. The scene never blocks LCP — a poster image is the LCP element; 3D hydrates after.
- **Palette:** 3D is where `violet` appears (gradient/light) alongside cipher — the only sanctioned use of the secondary hue (doc 02 §3).
- **Perf discipline:** capped DPR, frame-throttled when off-focus, geometry instanced, disposed on unmount. A hero animation that drops the page below the performance budget is a bug, not a feature.

## 5. Reduced motion (NFR-062) — non-negotiable

- `prefers-reduced-motion: reduce` is honored **globally** (globals.css kills animation/transition durations) and **per-component** (Framer's `useReducedMotion`, GSAP guards, R3F poster fallback).
- Reduced-motion is a **dignified** experience, not a broken one: set-pieces become clean static compositions, transitions become instant state changes, 3D becomes a crafted still. The reduced-motion version is designed, not degraded.
- This is tested: reduced-motion snapshots on the motion-heavy surfaces confirm nothing disappears or breaks.

## 6. Performance guardrails

- Animate only `transform` and `opacity` (compositor-friendly); never animate `width`/`top`/`box-shadow` in hot paths.
- `will-change` applied surgically and removed after; no permanent compositor layers.
- Scroll handlers are passive and rAF-batched.
- INP budget (≤200ms, NFR-030) is a hard gate — an interaction whose animation janks fails the Lighthouse CI check (Phase 2 doc 04 §5).

## 7. The motion test

Before shipping an animation: **"If I remove this, does the user lose information or spatial understanding?"** If no, it's decoration — cut it or make it reduced-motion-default. Award-winning restraint is knowing what *not* to animate.
