/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0A0C12',
          900: '#0F1220',
          800: '#161A2B',
          700: '#1E2440',
          600: '#2A3155',
        },
        cyan: {
          400: '#22D3EE',
          500: '#06B6D4',
        },
        amber: {
          400: '#FBBF24',
        },
        emerald: {
          400: '#34D399',
        },
        rose: {
          400: '#FB7185',
        }
      }
    },
  },
  plugins: [],
};
