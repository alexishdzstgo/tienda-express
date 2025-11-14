/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        body: ["Montserrat", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "Liberation Sans", "sans-serif"],
        heading: ["Roboto", "Montserrat", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Helvetica Neue", "Arial", "sans-serif"],
      },
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
