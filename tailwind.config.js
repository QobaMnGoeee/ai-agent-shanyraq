/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
      colors: {
        panel: "rgba(33, 62, 77, 0.85)",
        modal: "rgba(43, 81, 95, 0.85)",
        "btn-top": "#2b5569",
        "btn-bottom": "#173240",
        "btn-border": "rgba(10, 22, 30, 0.8)",
      },
    },
  },
  plugins: [],
};
