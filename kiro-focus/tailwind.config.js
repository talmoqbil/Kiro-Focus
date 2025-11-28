/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme color palette (Requirements 9.1-9.4)
        'kiro-bg': '#0a0e27',           // Dark background (9.1)
        'kiro-purple': '#b794f6',        // Primary accent (9.2)
        'kiro-success': '#48bb78',       // Success green (9.3)
        'kiro-warning': '#ed8936',       // Warning orange (9.4)
      },
      boxShadow: {
        'kiro-glow': '0 0 20px #b794f6', // Purple glow for Kiro mascot (9.5)
      },
      animation: {
        'kiro-float': 'kiro-float 3s ease-in-out infinite',
        'kiro-bounce': 'kiro-bounce 0.5s ease-out',
        'kiro-spin': 'kiro-spin 1s ease-out',
        'kiro-nod': 'kiro-nod 3s ease-in-out infinite',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'kiro-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'kiro-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
        'kiro-spin': {
          'from': { transform: 'rotate(0deg) scale(1.15)' },
          'to': { transform: 'rotate(360deg) scale(1.15)' },
        },
        'kiro-nod': {
          '0%, 100%': { transform: 'translateY(0) rotate(0)' },
          '50%': { transform: 'translateY(-3px) rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}
