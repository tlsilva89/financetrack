/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#b026ff',
        'dark-bg': '#121212',
        'dark-surface': '#1e1e1e',
      }
    },
  },
  plugins: [],
  darkMode: 'class'
}
