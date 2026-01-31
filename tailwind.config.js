/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "neon-cyan": "#00fff2",
        "neon-magenta": "#ff00aa",
        "space-black": "#0a0a0f",
      },
    },
  },
  plugins: [],
};
