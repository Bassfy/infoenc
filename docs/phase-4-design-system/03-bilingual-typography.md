# 03 — Bilingual Typography

Arabic and English are co-equal (NFR-050). This means two designed type systems that feel like one family, not a Latin system with Arabic forced through it.

## 1. Font pairing

| Role | Latin | Arabic | Mono (shared) |
|---|---|---|---|
| Family | **Geist** | **IBM Plex Sans Arabic** | **Geist Mono** |
| License | SIL OFL (self-hostable) | SIL OFL (self-hostable) | SIL OFL |
| Why | Modern grotesk, technical-precise, variable, made by Vercel — reads premium and neutral, not trendy | The finest open Arabic sans for UI: even color, real weights, tuned for screens; pairs cleanly with grotesks | Slashed zero, clear `Il1`/`O0` — essential for security content (hashes, payloads, CLI) |

**Why not one "does-both" font?** Fonts that cover Latin + Arabic in one file (Cairo, Noto Sans Arabic) are serviceable but compromise one script to serve the other. Choosing the best face for each script and tuning their optical sizes to match yields a better result than a jack-of-both. The tokens (`--font-latin`, `--font-arabic`) switch automatically by `lang`/`dir` (globals.css).

**Loading (perf — NFR-030):** self-hosted **variable** fonts via `next/font`, per-locale subsets, `font-display: swap` with metric-compatible fallbacks to protect CLS. Only the active locale's face loads on first paint; the other is prefetched. Total type budget ≤120KB across both scripts (Phase 2 doc 04 §5).

## 2. Optical matching

Arabic and Latin have different vertical metrics; naive pairing makes Arabic look small or heavy next to Latin. Rules baked into `globals.css`:
- Arabic body uses **more line-height** (`--leading-relaxed` vs `--leading-normal`) — Arabic's connected forms and diacritics need vertical room.
- Arabic headings get **no negative tracking** — tight tracking that flatters Latin display type damages Arabic legibility (letters must stay connected and open). The negative `--tracking-tight` applies to Latin headings only.
- Where a size looks optically smaller in Arabic, the Arabic face is bumped a step at the component level (not globally) so a bilingual page feels balanced.

## 3. The type scale

Fluid `clamp()` scale (`--text-xs` … `--text-5xl`), one scale for all breakpoints — no separate mobile ramp to drift out of sync. Display sizes (`3xl`–`5xl`) are for hero moments; `base`/`lg` carry reading; `sm`/`xs` for metadata and dense UI (admin, tables).

| Token | Use |
|---|---|
| `5xl`/`4xl` | Hero headlines (marketing, one per view) |
| `3xl`/`2xl` | Section headings |
| `xl`/`lg` | Sub-headings, lead paragraphs |
| `base` | Body, the default |
| `sm` | Secondary text, captions, dense tables |
| `xs` | Metadata, labels, legal |

## 4. RTL as first-class layout (NFR-051)

RTL is not `direction: rtl` on a Latin layout. The whole system uses **CSS logical properties** so one implementation serves both directions:
- Spacing/positioning use logical utilities (`ps-*`, `pe-*`, `ms-*`, `me-*`, `start-*`, `end-*`) — the Tailwind preset maps these to logical properties; a stylelint rule fails CI on `left`/`right`/`pl`/`pr` in app code (Phase 2 doc 04 §3).
- Iconography: only **semantically directional** icons mirror in RTL (arrows, chevrons, progress, back/forward). A logo, a lock, a checkmark do **not** flip — handled by a `directional` prop on the Icon component, not a blanket `transform: scaleX(-1)`.
- Layout direction (nav order, sidebar side, card flow) follows `dir` automatically because it's built on logical properties and flexbox/grid flow, not absolute L/R positioning.

## 5. Bidi safety (where naive RTL breaks)

The hard problem: Arabic prose containing English technical content — a hostname, a CLI command, a hash, a code identifier. Left alone, bidirectional reordering mangles it. The system isolates LTR runs inside RTL text:
- `code`, `kbd`, `samp`, and any `.ltr-isolate` / `[data-bidi="isolate"]` element get `unicode-bidi: isolate; direction: ltr` (globals.css).
- The markdown renderer (shared across lessons, forum, writeups — Phase 2 doc 04 §7) wraps inline code and known technical tokens in isolation automatically.
- **This is tested:** golden-file snapshots of mixed-content lessons in both directions catch regressions (Phase 2 doc 04 §3). "Arabic lesson with an English `curl` command that renders correctly" is a test, not a hope.

## 6. Numerals & formatting

- Western Arabic numerals (0–9) by default in both locales (professional/technical norm); Eastern Arabic numerals available as a user preference where culturally expected.
- Dates, numbers, currency via `Intl` through `packages/i18n`; Hijri date display option (NFR-052).
- Certificates and invoices (PDF, `packages/pdf`) apply the same bilingual type rules — Arabic names shape correctly in RTL, mixed content isolates (FR-AC-065, FR-AD-042).
