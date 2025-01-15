/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#A020F0',
        'purple-800': '#6D28D9',
      },
    },
  },
  plugins: [],
}

