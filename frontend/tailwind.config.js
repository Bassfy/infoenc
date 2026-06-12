/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f0fdf9',
          100: '#ccfbef',
          200: '#99f6df',
          300: '#5beeca',
          400: '#1dddb0',
          500: '#00ff88',
          600: '#00c46a',
          700: '#009c56',
          800: '#047a46',
          900: '#05633b',
        },
        dark: {
          50: '#f0f0f1',
          100: '#d8d9db',
          200: '#b0b2b6',
          300: '#888b91',
          400: '#61656d',
          500: '#393e48',
          600: '#2a2e38',
          700: '#1e2128',
          800: '#13151c',
          900: '#0a0b10',
          950: '#050608',
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
          from: { boxShadow: '0 0 5px #00ff88, 0 0 10px #00ff88' },
          to: { boxShadow: '0 0 20px #00ff88, 0 0 40px #00ff88, 0 0 80px #00ff88' },
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
          linear-gradient(rgba(0,255,136,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,255,136,0.03) 1px, transparent 1px)
        `,
        'hero-gradient': 'linear-gradient(135deg, #0a0b10 0%, #13151c 50%, #0a0b10 100%)',
      },
      backgroundSize: {
        'cyber-grid': '50px 50px',
      },
    },
  },
  plugins: [],
};
