/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#0A0A0A",
        gold: "#D4AF37",
        ivory: "#F8F5F0",
        charcoal: "#2B2B2B",
        burgundy: "#5C1B1B"
      }
    }
  },
  plugins: []
};
