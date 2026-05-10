/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'tl-bg': '#0a0f1e',
        'tl-surface': '#0f172a',
        'tl-card': '#1e293b',
        'tl-border': '#334155',
        'tl-accent': '#06b6d4',
        'tl-accent2': '#6366f1',
        'tl-danger': '#ef4444',
        'tl-warning': '#f59e0b',
        'tl-success': '#10b981',
        'tl-text': '#e2e8f0',
        'tl-muted': '#64748b',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px #06b6d4, 0 0 10px #06b6d4' },
          '50%': { boxShadow: '0 0 20px #06b6d4, 0 0 40px #06b6d440' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at center, var(--tw-gradient-stops))',
        'cyber-grid': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23334155' stroke-width='0.5'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(6, 182, 212, 0.3)',
        'glow-md': '0 0 20px rgba(6, 182, 212, 0.4)',
        'glow-lg': '0 0 40px rgba(6, 182, 212, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.4)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'card': '0 4px 6px -1px rgba(0,0,0,0.5), 0 2px 4px -2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
