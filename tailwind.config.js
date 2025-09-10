/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // ⬅️ important
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1f2937",  // slate-800
          accent:  "#14b8a6",  // teal-500
          light:   "#f1f5f9",  // slate-100
        },
      },
    },
  },
  plugins: [],
};
