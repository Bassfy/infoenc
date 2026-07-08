/**
 * INFOENC shared Tailwind preset.
 * Phase 4 design system. Every app (web, academy, admin) extends this preset so utilities
 * map to the design tokens (tokens.css) — a component never hardcodes a color or space value.
 *
 * RTL discipline: this preset does NOT enable physical-direction utilities as the norm.
 * Teams use logical utilities (ps-*, pe-*, ms-*, me-*, start-*, end-*) which Tailwind maps to
 * CSS logical properties, so one class works in both LTR and RTL (Phase 2 doc 04 §3). A
 * stylelint rule (packages/config) fails CI on left/right utilities in app code.
 */
import type { Config } from "tailwindcss";

const preset = {
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // semantic tokens → utilities (bg-surface, text-primary, border-DEFAULT, …)
        bg: {
          DEFAULT: "var(--color-bg)",
          subtle: "var(--color-bg-subtle)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          raised: "var(--color-surface-raised)",
          overlay: "var(--color-surface-overlay)",
        },
        border: {
          DEFAULT: "var(--color-border)",
          strong: "var(--color-border-strong)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          "on-accent": "var(--text-on-accent)",
          link: "var(--text-link)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          hover: "var(--color-accent-hover)",
          muted: "var(--color-accent-muted)",
        },
        // secondary (pink) + tertiary (baby blue) accents
        "accent-2": {
          DEFAULT: "var(--color-accent-2)",
          hover: "var(--color-accent-2-hover)",
          muted: "var(--color-accent-2-muted)",
        },
        "accent-3": {
          DEFAULT: "var(--color-accent-3)",
          hover: "var(--color-accent-3-hover)",
          muted: "var(--color-accent-3-muted)",
        },
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        // severity scale (shared with the pentest report — brand doc §5)
        severity: {
          info: "var(--sev-info)",
          low: "var(--sev-low)",
          medium: "var(--sev-medium)",
          high: "var(--sev-high)",
          critical: "var(--sev-critical)",
        },
      },
      fontFamily: {
        sans: "var(--font-sans)",
        latin: "var(--font-latin)",
        arabic: "var(--font-arabic)",
        mono: "var(--font-mono)",
      },
      fontSize: {
        xs: "var(--text-xs)",
        sm: "var(--text-sm)",
        base: "var(--text-base)",
        lg: "var(--text-lg)",
        xl: "var(--text-xl)",
        "2xl": "var(--text-2xl)",
        "3xl": "var(--text-3xl)",
        "4xl": "var(--text-4xl)",
        "5xl": "var(--text-5xl)",
      },
      lineHeight: {
        tight: "var(--leading-tight)",
        snug: "var(--leading-snug)",
        normal: "var(--leading-normal)",
        relaxed: "var(--leading-relaxed)",
      },
      letterSpacing: {
        tight: "var(--tracking-tight)",
        normal: "var(--tracking-normal)",
        wide: "var(--tracking-wide)",
      },
      spacing: {
        1: "var(--space-1)",
        2: "var(--space-2)",
        3: "var(--space-3)",
        4: "var(--space-4)",
        5: "var(--space-5)",
        6: "var(--space-6)",
        7: "var(--space-7)",
        8: "var(--space-8)",
        9: "var(--space-9)",
        10: "var(--space-10)",
        11: "var(--space-11)",
        12: "var(--space-12)",
      },
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "var(--radius-2xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        "accent-glow": "var(--shadow-accent-glow)",
      },
      maxWidth: {
        container: "var(--container-max)",
        prose: "var(--container-prose)",
      },
      zIndex: {
        sticky: "100",
        overlay: "200",
        modal: "300",
        toast: "400",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        emphasized: "var(--ease-emphasized)",
        exit: "var(--ease-exit)",
      },
      transitionDuration: {
        instant: "80ms",
        fast: "140ms",
        base: "220ms",
        slow: "380ms",
        cinematic: "720ms",
      },
      backdropBlur: {
        glass: "var(--glass-blur)",
      },
      backgroundImage: {
        // signature purple → pink → baby-blue gradient poles (hero, 3D, glow)
        brand: "var(--gradient-brand)",
        "brand-soft": "var(--gradient-brand-soft)",
        aurora: "var(--gradient-aurora)",
      },
    },
  },
  plugins: [],
} satisfies Partial<Config>;

export default preset;
