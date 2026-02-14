/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0a0e1a',
          800: '#111827',
          700: '#1e293b',
        },
      },
    },
  },
  plugins: [],
}
