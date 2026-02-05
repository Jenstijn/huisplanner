/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Liquid Glass Design System - iOS 26 Style
      backdropBlur: {
        'glass': '20px',
        'glass-lg': '32px',
      },
      backdropSaturate: {
        'glass': '1.8',
      },
      borderRadius: {
        'glass': '24px',
        'glass-lg': '28px',
        'glass-sm': '16px',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(31, 38, 135, 0.12), inset 0 2px 16px rgba(255, 255, 255, 0.25)',
        'glass-hover': '0 12px 40px rgba(31, 38, 135, 0.18), inset 0 2px 20px rgba(255, 255, 255, 0.3)',
        'glass-dark': '0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        'glass-glow': '0 0 40px rgba(59, 130, 246, 0.15)',
      },
      animation: {
        'glass-shimmer': 'glassShimmer 3s ease-in-out infinite',
        'float-up': 'floatUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-in': 'fadeIn 0.25s ease-out',
        'scale-in': 'scaleIn 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        glassShimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
        floatUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
