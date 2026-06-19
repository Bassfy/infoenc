import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        obsidian: {
          DEFAULT: '#050505',
          50: '#0a0a0a',
          100: '#101010',
          200: '#181818',
          300: '#202020',
          400: '#282828',
          500: '#303030',
        },
        electric: {
          DEFAULT: '#00AEEF',
          50: '#E0F5FD',
          100: '#B3E8FA',
          200: '#66D1F5',
          300: '#33BEFF',
          400: '#00AEEF',
          500: '#0090C5',
          600: '#00729B',
          700: '#005472',
        },
        gold: {
          DEFAULT: '#C9A84C',
          50: '#FAF4E3',
          100: '#F0E3B8',
          200: '#DFC78A',
          300: '#D4B76A',
          400: '#C9A84C',
          500: '#A88A35',
          600: '#876C20',
          700: '#664E0C',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-cormorant)', 'Georgia', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      fontSize: {
        '10xl': ['10rem', { lineHeight: '1' }],
        '11xl': ['12rem', { lineHeight: '1' }],
        '12xl': ['14rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
        '38': '9.5rem',
        '42': '10.5rem',
        '46': '11.5rem',
        '50': '12.5rem',
        '54': '13.5rem',
        '58': '14.5rem',
        '62': '15.5rem',
        '66': '16.5rem',
        '70': '17.5rem',
        '74': '18.5rem',
        '78': '19.5rem',
        '82': '20.5rem',
        '86': '21.5rem',
        '90': '22.5rem',
        '128': '32rem',
        '144': '36rem',
      },
      screens: {
        'xs': '480px',
        '3xl': '1920px',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.9s ease-out forwards',
        'fade-down': 'fadeDown 0.6s ease-out forwards',
        'slide-left': 'slideLeft 0.8s ease-out forwards',
        'slide-right': 'slideRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.7s ease-out forwards',
        'shimmer': 'shimmer 2.5s infinite',
        'float': 'float 7s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'draw-line': 'drawLine 1.5s ease-out forwards',
        'reveal': 'reveal 1s ease-out forwards',
        'rotate-slow': 'rotate 15s linear infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          from: { opacity: '0', transform: 'translateX(-50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideRight: {
          from: { opacity: '0', transform: 'translateX(50px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.92)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 174, 239, 0.2)' },
          '50%': { boxShadow: '0 0 60px rgba(0, 174, 239, 0.6)' },
        },
        drawLine: {
          from: { width: '0%' },
          to: { width: '100%' },
        },
        reveal: {
          from: { clipPath: 'inset(0 100% 0 0)' },
          to: { clipPath: 'inset(0 0% 0 0)' },
        },
        rotate: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
      },
      transitionTimingFunction: {
        'expo-out': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'expo-in-out': 'cubic-bezier(0.87, 0, 0.13, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
        '1200': '1200ms',
        '1500': '1500ms',
        '2000': '2000ms',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-blue': '0 0 40px rgba(0, 174, 239, 0.4)',
        'glow-blue-lg': '0 0 80px rgba(0, 174, 239, 0.5)',
        'glow-gold': '0 0 40px rgba(201, 168, 76, 0.3)',
        'inner-glow': 'inset 0 0 40px rgba(0, 174, 239, 0.1)',
        'card': '0 4px 40px rgba(0, 0, 0, 0.6)',
        'card-hover': '0 8px 60px rgba(0, 0, 0, 0.8)',
      },
    },
  },
  plugins: [],
}

export default config
