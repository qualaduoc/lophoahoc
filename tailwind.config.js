/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        chemistry: {
          blue: '#e0f2fe',
          green: '#dcfce7',
          dark: '#0f172a',
          primary: '#0284c7', // Sky 600
        }
      }
    },
  },
  plugins: [],
}
