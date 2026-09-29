/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B2E5E',
          hover: '#14234A',
        },
        link: {
          DEFAULT: '#1D4ED8',
          navy: '#2B4A8B',
        },
        'border-subtle': '#E2E8F0',
        'ai-accent': {
          DEFAULT: '#7C3AED',
          soft: '#EADDFF',
        },
        'page-bg': '#FBF9F4',
        'step-active': '#3548C8',
        'step-idle-bg': '#E8E6E1',
        ink: '#161D3D',
        'navy-btn': '#1B254B',
        muted: '#5D6B82',
        'brand-violet': '#6C22D6',
      },
      boxShadow: {
        card: '0px 24px 64px rgba(15, 10, 60, 0.35)',
        panel: '0px 4px 12px rgba(27, 46, 94, 0.08)',
        button: '0px 1px 2px rgba(0, 0, 0, 0.05)',
        'btn-navy': '0px 3px 6px rgba(22, 29, 61, 0.13)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%, 60%': { transform: 'translateX(-6px)' },
          '40%, 80%': { transform: 'translateX(6px)' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.8)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        shake: 'shake 0.4s ease-in-out',
        'scale-in': 'scale-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both',
      },
    },
  },
  plugins: [],
};
