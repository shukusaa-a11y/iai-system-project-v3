/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          950: '#060c1e',
          900: '#0a1128',
          850: '#0d1530',
          800: '#111d3d',
          750: '#152347',
          700: '#1c2541',
          600: '#24306b',
          500: '#2e3f8a',
          400: '#3b52c4',
        },
        accent: {
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 30px rgba(59,130,246,0.3)',
        'glow-sm': '0 0 15px rgba(59,130,246,0.2)',
        'glow-lg': '0 0 60px rgba(59,130,246,0.25)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59,130,246,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(59,130,246,0.6)' },
        },
      },
    },
  },
  plugins: [],
};
