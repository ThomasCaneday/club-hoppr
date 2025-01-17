/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      colors: {
        'neon-purple': '#A020F0',
        'purple-800': '#6D28D9',
      },
      keyframes: {
        newsTickerScroll: {
          '0%': { transform: 'translate(0, 0)' },
          '100%': { transform: 'translate(-100%, 0)' },
        }
      },
      animation: {
        // 15s linear infinite
        'news-ticker': 'newsTickerScroll 60s linear infinite'
      },
    },
  },
  plugins: [],
}

