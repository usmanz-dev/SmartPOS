/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Rajdhani', 'sans-serif'],
        body: ['"Exo 2"', 'sans-serif'],
      },
      colors: {
        bg: { primary: '#090e1a', secondary: '#0e1726', card: '#131e31', elevated: '#192438', sidebar: '#0b1120' },
        accent: {
          green: 'rgb(34 197 94 / <alpha-value>)',
          'green-dark': '#15803d',
          blue: 'rgb(59 130 246 / <alpha-value>)',
          cyan: 'rgb(6 182 212 / <alpha-value>)',
          amber: 'rgb(245 158 11 / <alpha-value>)',
          red: 'rgb(239 68 68 / <alpha-value>)',
          purple: 'rgb(139 92 246 / <alpha-value>)',
          pink: 'rgb(236 72 153 / <alpha-value>)',
        },
      },
      animation: { 'pulse-slow': 'pulse 3s ease-in-out infinite', 'fade-in': 'fadeIn 0.2s ease', 'slide-up': 'slideUp 0.25s ease' },
      keyframes: {
        fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
      backgroundImage: {
        'grid': "linear-gradient(rgba(34,197,94,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(34,197,94,0.025) 1px,transparent 1px)",
      },
      backgroundSize: { grid: '44px 44px' },
    },
  },
  plugins: [],
}
