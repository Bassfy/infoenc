/**
 * INFOENC design tokens — typed exports for JS/TS consumers.
 * Phase 4 design system. The CSS custom properties in tokens.css are the runtime source of
 * truth for theming; this file exposes the same scales to code that needs values in JS
 * (Framer Motion configs, Three.js scenes, canvas, chart libraries, tests).
 *
 * Color values here are the DARK-theme resolved values. Components should prefer the CSS
 * variables (theme-aware); use these only where a JS numeric/string value is required.
 */

export const space = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.5rem",
  6: "2rem",
  7: "2.5rem",
  8: "3rem",
  9: "4rem",
  10: "6rem",
  11: "8rem",
  12: "12rem",
} as const;

export const radius = {
  xs: "4px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "20px",
  "2xl": "28px",
  full: "9999px",
} as const;

export const fontFamily = {
  latin: '"Geist", system-ui, -apple-system, "Segoe UI", sans-serif',
  arabic: '"IBM Plex Sans Arabic", "Geist", system-ui, sans-serif',
  mono: '"Geist Mono", ui-monospace, "SF Mono", monospace',
} as const;

export const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Motion tokens — the single source for Framer Motion / GSAP timing (doc 05). */
export const motion = {
  ease: {
    standard: [0.2, 0, 0, 1],
    emphasized: [0.16, 1, 0.3, 1],
    exit: [0.4, 0, 1, 1],
  },
  duration: {
    instant: 0.08,
    fast: 0.14,
    base: 0.22,
    slow: 0.38,
    cinematic: 0.72,
  },
} as const;

/** Primitive color ramps (dark-resolved OKLCH strings). Prefer semantic CSS vars in UI. */
export const color = {
  ink: {
    950: "oklch(0.16 0.012 250)",
    900: "oklch(0.19 0.013 250)",
    850: "oklch(0.22 0.014 250)",
    800: "oklch(0.26 0.015 250)",
    700: "oklch(0.32 0.016 250)",
    600: "oklch(0.42 0.017 250)",
    500: "oklch(0.54 0.017 250)",
    400: "oklch(0.65 0.016 248)",
    300: "oklch(0.76 0.013 246)",
    200: "oklch(0.85 0.010 244)",
    100: "oklch(0.92 0.007 242)",
    50: "oklch(0.97 0.004 240)",
    0: "oklch(0.99 0.002 240)",
  },
  cipher: {
    900: "oklch(0.30 0.070 195)",
    800: "oklch(0.40 0.090 194)",
    700: "oklch(0.52 0.110 193)",
    600: "oklch(0.64 0.125 192)",
    500: "oklch(0.74 0.130 191)",
    400: "oklch(0.81 0.115 190)",
    300: "oklch(0.87 0.090 189)",
    200: "oklch(0.92 0.060 188)",
    100: "oklch(0.96 0.032 188)",
  },
  violet: {
    600: "oklch(0.55 0.180 292)",
    500: "oklch(0.64 0.180 290)",
    400: "oklch(0.72 0.150 288)",
  },
} as const;

/**
 * Finding-severity scale — shared by the brand system AND the pentest report (brand doc §5).
 * The `key` values match the FindingSeverity enum in prisma/schema/enums.prisma, so the report
 * generator and the UI reference one severity color source.
 */
export const severity = {
  info: "oklch(0.70 0.130 240)",
  low: "oklch(0.72 0.140 165)",
  medium: "oklch(0.80 0.150 85)",
  high: "oklch(0.70 0.170 45)",
  critical: "oklch(0.62 0.210 12)",
} as const;

export type SeverityKey = keyof typeof severity;

export const tokens = { space, radius, fontFamily, fontWeight, motion, color, severity } as const;
export type Tokens = typeof tokens;
