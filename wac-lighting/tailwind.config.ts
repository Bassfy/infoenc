import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        gold: {
          50: "#fefdf0",
          100: "#fdf9d9",
          200: "#fbf1a5",
          300: "#f7e568",
          400: "#f2d132",
          500: "#e4b90a",
          600: "#c9920b",
          700: "#a06b0d",
          800: "#845514",
          900: "#704717",
          950: "#432509",
          DEFAULT: "#C9A84C",
          light: "#E4C76B",
          dark: "#A0832E",
        },
        obsidian: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#6d6d6d",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#111111",
          DEFAULT: "#0A0A0A",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        heading: ["var(--font-space-grotesk)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 8vw, 7rem)", { lineHeight: "1.05" }],
        "display-xl": ["clamp(2.5rem, 6vw, 5.5rem)", { lineHeight: "1.08" }],
        "display-lg": ["clamp(2rem, 4vw, 4rem)", { lineHeight: "1.1" }],
        "display-md": ["clamp(1.5rem, 3vw, 3rem)", { lineHeight: "1.15" }],
        "display-sm": ["clamp(1.25rem, 2.5vw, 2.25rem)", { lineHeight: "1.2" }],
      },
      spacing: {
        "section": "clamp(5rem, 10vw, 10rem)",
        "container": "clamp(1.5rem, 5vw, 5rem)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "fade-up": "fadeUp 0.6s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-in-right": "slideInRight 0.5s ease-out forwards",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
        "spin-slow": "spin 8s linear infinite",
        "beam-rotate": "beamRotate 4s linear infinite",
        "counter-up": "counterUp 1s ease-out forwards",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        glowPulse: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(201, 168, 76, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(201, 168, 76, 0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-20px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        beamRotate: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        counterUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gold-gradient": "linear-gradient(135deg, #C9A84C 0%, #E4C76B 50%, #A0832E 100%)",
        "dark-gradient": "linear-gradient(180deg, #0A0A0A 0%, #111111 100%)",
        "glass-gradient": "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "beam-gradient": "linear-gradient(180deg, rgba(201,168,76,0) 0%, rgba(201,168,76,0.6) 50%, rgba(201,168,76,0) 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.2) 50%, transparent 100%)",
      },
      boxShadow: {
        "gold": "0 0 30px rgba(201, 168, 76, 0.4)",
        "gold-lg": "0 0 60px rgba(201, 168, 76, 0.3)",
        "glass": "0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        "card": "0 20px 60px rgba(0, 0, 0, 0.5)",
        "inner-glow": "inset 0 0 30px rgba(201, 168, 76, 0.1)",
      },
      backdropBlur: {
        xs: "2px",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
        "800": "800ms",
        "1200": "1200ms",
        "1600": "1600ms",
      },
      transitionTimingFunction: {
        "spring": "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        "smooth": "cubic-bezier(0.4, 0, 0.2, 1)",
        "expo-out": "cubic-bezier(0.16, 1, 0.3, 1)",
        "expo-in": "cubic-bezier(0.7, 0, 0.84, 0)",
      },
      zIndex: {
        "60": "60",
        "70": "70",
        "80": "80",
        "90": "90",
        "100": "100",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

export default config;
