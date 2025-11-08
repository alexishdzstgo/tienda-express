/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        green: {
          600: "#2E8B57",
          700: "#20724D",
        },
        purple: {
          100: "#EDE9FE",
          700: "#6B46C1",
        },
      },
    },
  },
  plugins: [],
};
