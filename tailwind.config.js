/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'SolaimanLipi', 'Kalpurush', 'sans-serif']
      },
      colors: {
        gov: {
          50: '#f0f7f6',
          100: '#dbece8',
          500: '#006a4e', // Bangladesh Gov Green
          600: '#005841',
          700: '#004634',
          800: '#003527',
          900: '#00261c',
        }
      }
    },
  },
  plugins: [],
}
