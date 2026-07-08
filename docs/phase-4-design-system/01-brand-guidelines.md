# 01 — Brand Guidelines

## 1. Brand idea

**INFOENC = Information + Encryption.** The name is a compression of the thing we protect and the act of protecting it. The brand's central metaphor is **the transform** — plaintext becoming ciphertext, the unknown becoming understood, the novice becoming the operator. Everything visual gestures at *ordered transformation*: structure emerging from noise, signal resolving out of static.

This is not "hacker aesthetic." It is **quiet authority** — the confidence of a firm that breaks into banks for a living and doesn't need to shout about it.

## 2. Positioning in one line

> Trained by the people who break in for a living.

The visual system carries this: precise, technical, and unmistakably premium — closer to the restraint of Linear, Stripe, and Vercel than to the neon theatrics of typical "cyber" branding.

## 3. Voice & tone

| Trait | We are | We are not |
|---|---|---|
| **Precise** | Exact, technically correct, specific | Vague, buzzword-laden, hand-wavy |
| **Confident** | Calm authority, plain statements | Boastful, fear-mongering, hype |
| **Respectful** | Assume intelligence; teach without condescension | Gatekeeping, elitist, jargon-as-flex |
| **Bilingual-native** | Equally fluent in Arabic and English register | Machine-translated, awkward, English-first-with-Arabic-bolted-on |

**Fear is not our sales tool.** Competitors sell with breach anxiety; INFOENC sells with competence and outcomes. Copy states what we do and what the reader gains, not what they should be afraid of.

**Arabic voice** is authored, not translated — it carries the same calm authority in native register, with correct technical terminology (and English terms transliterated or kept where that's the professional norm, e.g., "بنتست"/"penetration testing" handled per context).

## 4. Logo system

The wordmark and mark are produced as SVG assets in `packages/ui` (design tooling, not this doc), but the rules that govern them:

- **Wordmark:** "INFOENC" set in the display weight of the brand type, tight tracking, all caps. The `O`s carry a subtle geometric treatment evoking a cipher ring / lock dial — the one moment of ornament, used once.
- **Mark (standalone):** a monogram derived from the `O`-as-cipher-ring, usable as favicon, app icon, avatar. Works at 16px.
- **Clear space:** minimum of the cap-height on all sides. **Minimum size:** wordmark 96px wide / mark 16px.
- **Bilingual lockup:** an Arabic wordmark ("إنفوإنك") is drawn as a companion, not an afterthought — same weight, same optical size, RTL-set. Neither language's lockup is "primary"; the active locale's is used.
- **Don't:** recolor outside the palette, add glow/bevel/drop-shadow, stretch, rotate, place the neon-green MVP treatment anywhere, or set the wordmark in a non-brand font.

## 5. Color story

The palette is built dark-first around three ideas:

1. **Ink** — a cool, near-black neutral ramp (never pure `#000`; pure black is harsh and flattens depth). Surfaces are layered ink, giving the glassmorphism and elevation their quiet depth.
2. **Cipher** — the signature accent: a controlled cyan-teal that reads as "active / encrypted / live." It is the one hero color, used sparingly for interaction, focus, and key data. Scarcity is what makes it feel premium.
3. **Signal** — a semantic set that doubles as the product's **finding-severity scale** (info → low → medium → high → critical). The brand color system and the pentest report use the *same* severity colors — a rare, authentic tie between brand and product that no template could fake.

Full values, ramps, and accessibility notes: [doc 02](02-design-tokens.md).

## 6. Imagery & texture

- **No stock photography of hooded figures, glowing padlocks, or matrix rain.** Ever. These are the visual clichés that make security brands look generic.
- Preferred: abstract **structured-noise** fields (signal resolving from static — the transform metaphor), precise technical diagrams, real (anonymized) terminal/tooling captures, and restrained 3D forms (doc 05).
- Photography of people is real, candid, and diverse — practitioners at work, not stock "business handshake."
- Texture is achieved with grain, subtle gradient meshes, and glass — never with skeuomorphic ornament.

## 7. Applying the brand across the two platforms

One brand, two register shifts:
- **INFOENC Services** (company site): more restraint, more space, executive-calm — it addresses CISOs and boards. Cipher accent is rarer still; typography does the work.
- **INFOENC Academy:** the same system with more energy — gamification brings controlled color (ranks, badges, XP), motion is livelier, the cipher accent appears more (progress, live labs). Still the same tokens; the *density and motion budget* differ, not the identity.
- **Admin:** the system at its most utilitarian — density over cinema, but unmistakably the same family.

## 8. The one-sentence test

Before shipping any surface, ask: **"Does this look like a firm that could pass its own ISO 27001 audit and win an Awwwards?"** If it looks like a bootstrap template, a neon hacker theme, or an AI-generated gradient soup — redesign it.
