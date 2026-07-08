# 02 — Design Tokens

The token system is the contract between design and code. Values live in `packages/ui/tokens/` (real files, shipped this phase); this doc explains the architecture and the reasoning.

## 1. Two layers

1. **Primitive ramps** (`--ink-*`, `--cipher-*`, `--sev-*`) — the raw palette. Components **never** reference these directly.
2. **Semantic tokens** (`--color-surface`, `--text-primary`, `--color-accent`, …) — what components use. Semantic tokens remap per theme; primitives don't change. This is why a single component works in dark and light without conditionals.

## 2. Why OKLCH

Colors are authored in OKLCH (perceptual lightness, chroma, hue), not hex or HSL. Consequences that matter:
- **Even lightness steps** across a ramp actually *look* even (HSL lies about this) — the ink and cipher ramps have predictable contrast jumps.
- **Contrast is tunable by one axis** (L), so hitting WCAG AA between a text token and a surface token is a lightness calculation, not trial-and-error.
- **Hue stays constant across a ramp**, so the cipher accent reads as the same color at 300 and 700 — critical for brand coherence.

## 3. The palette

### Ink (neutral)
A cool, blue-tinted near-black-to-white ramp (hue ~250). **Never pure black** — `--ink-950` is `oklch(0.16 …)`, giving surfaces room to layer and letting glass/elevation read. Dark theme surfaces climb the ramp (`bg` 950 → `surface` 850 → `raised` 800); light theme inverts.

### Cipher (signature accent)
A controlled cyan-teal (hue ~191). This is the **one hero color** — interaction, focus, live/active states, key data points. Its scarcity is the premium signal (brand doc §5). `--cipher-500` is the dark-theme interactive; light theme steps to `--cipher-700` for contrast on light surfaces.

### Violet (gradient-only)
Used **exclusively** in gradient meshes and 3D moments (doc 05), never as a standalone UI accent. It exists to give hero and cinematic surfaces depth without introducing a competing interactive color.

### Signal / severity
`info · low · medium · high · critical` — a blue→teal→amber→orange→red scale. **This is the same scale the pentest report uses** (`tokens.ts` `severity` keys match the `FindingSeverity` enum in `prisma/schema/enums.prisma`). Brand and product share one severity source of truth — an authenticity a template can't fake. Plus standalone `success · warning · danger` for general UI feedback.

## 4. Accessibility guarantees (NFR-060, NFR-064)

- Text-on-surface pairs are chosen to meet **WCAG AA (4.5:1 body, 3:1 large)** in both themes. `--text-primary`/`--color-bg`, `--text-secondary`/`--color-surface`, and `--text-on-accent`/`--color-accent` are the audited pairs; the design-system CI (doc 04 §6) runs contrast assertions on the resolved values so a token change that breaks contrast fails the build.
- Severity is **never color-only** — every severity indicator pairs the color with a label and/or icon (color-blind safety), enforced at the component level (Badge/severity component, doc 04).
- Focus ring (`--color-focus-ring`) is a dedicated token, always cipher, never removed.

## 5. Scales

| Scale | Values | Note |
|---|---|---|
| Space | 4px base, 0–12 steps (0.25rem → 12rem) | Generous upper end — premium = space (brand doc §2) |
| Radius | xs 4 → 2xl 28 → full | Soft but not rounded-toy; cards/inputs use md/lg |
| Type size | `xs`–`5xl`, **fluid `clamp()`** | Scales with viewport; no separate mobile scale to maintain |
| Line height | tight 1.1 → relaxed 1.7 | Arabic defaults to more leading (doc 03) |
| Elevation | sm/md/lg + `accent-glow` | Shadows tuned for dark surfaces (deeper, softer) |
| Z-index | sticky/overlay/modal/toast | Named, no magic numbers |
| Motion | 5 durations, 3 eases | Single source for Framer/GSAP (doc 05) |

## 6. Theming mechanics

- Dark is `:root` default (dark-mode-first mandate). Light activates via `[data-theme="light"]` (explicit user choice, persisted per user — FR-AC-132) **or** `prefers-color-scheme: light` when the user hasn't chosen (the theme toggle stamps `data-theme` and wins).
- The three apps import `tokens.css` + `globals.css` once; the Tailwind preset (`tailwind-preset.ts`) exposes every semantic token as a utility (`bg-surface`, `text-primary`, `shadow-accent-glow`). No app defines its own colors.

## 7. What is deliberately NOT a token

Per-component one-offs (a specific card's internal grid gap, a hero's exact clip-path) are component-local, not global tokens — tokens are the shared vocabulary, not a dumping ground. A value earns tokenhood when 3+ components need it.
