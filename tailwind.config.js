/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#1E40AF',
          lightBlue: '#EFF6FF',
          darkBlue: '#1E293B',
          orange: '#EA580C',
          purple: '#7C3AED',
          green: '#16A34A',
        },
        horizon: {
          1: '#FFF7ED',
          2: '#F0F9FF',
          3: '#FAF5FF',
        }
      }
    },
  },
  plugins: [],
}
