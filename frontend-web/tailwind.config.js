/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        izly: {
          cyan: '#00B2E5',
          black: '#1D1D1B',
          red: '#E20031',
          green: '#8DC63F',
          bg: '#F5F7FA',
          // New colors based on HTML/Screenshot analysis
          'blue-main': '#00C4F0', // The main blue background - Lighter
          'dark-counter': '#1D1D1B', // The dark right side background (same as sidebar)
          'text-blue': '#00B2E5',
        }
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
      backgroundImage: {
        'circle-gradient': 'radial-gradient(circle, #ffffff 0%, #f0f9ff 100%)',
      }
    },
  },
  plugins: [],
}
