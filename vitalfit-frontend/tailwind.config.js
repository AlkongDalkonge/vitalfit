/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      width: {
        60: "240px",
        70: "280px",
      },
      margin: {
        60: "240px",
        70: "280px",
      },
      height: {
        15: "60px",
      },
    },
  },
  plugins: [],
};
