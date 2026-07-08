/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary accent — purple (was neon green). Component classes keep the `cyber-*` names.
        cyber: {
          50: '#f6f0ff',
          100: '#ecdfff',
          200: '#d9c2ff',
          300: '#bd94ff',
          400: '#a568ff',
          500: '#8b3dff',
          600: '#7a2ae6',
          700: '#6320bd',
          800: '#4d1a94',
          900: '#3a1470',
        },
        // Secondary accent — pink
        pinkc: {
          300: '#ffb3d9',
          400: '#ff85c2',
          500: '#ff5db1',
          600: '#e6408f',
        },
        // Tertiary accent — baby blue
        sky2: {
          300: '#b3e0ff',
          400: '#7fc7ff',
          500: '#4fb0ff',
          600: '#2f93e6',
        },
        // Near-black base with a faint violet undertone (was cool grey).
        dark: {
          50: '#f1eef5',
          100: '#d8d2df',
          200: '#b0a8bd',
          300: '#887f97',
          400: '#61596d',
          500: '#393248',
          600: '#2a2438',
          700: '#1c1826',
          800: '#131019',
          900: '#0b0810',
          950: '#08060d',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'scan': 'scan 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'type': 'typing 3.5s steps(40, end)',
      },
      keyframes: {
        glow: {
          from: { boxShadow: '0 0 5px #8b3dff, 0 0 10px #8b3dff' },
          to: { boxShadow: '0 0 20px #8b3dff, 0 0 40px #ff5db1, 0 0 80px #8b3dff' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        typing: {
          from: { width: '0' },
          to: { width: '100%' },
        },
      },
      backgroundImage: {
        'cyber-grid': `
          linear-gradient(rgba(139,61,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(139,61,255,0.04) 1px, transparent 1px)
        `,
        'hero-gradient': 'linear-gradient(135deg, #0b0810 0%, #131019 50%, #0b0810 100%)',
        'brand-gradient': 'linear-gradient(120deg, #8b3dff 0%, #ff5db1 52%, #7fc7ff 100%)',
      },
      backgroundSize: {
        'cyber-grid': '50px 50px',
      },
    },
  },
  plugins: [],
};
