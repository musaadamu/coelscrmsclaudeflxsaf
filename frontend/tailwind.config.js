module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1e40af",
        secondary: "#7c3aed",
        success: "#059669",
        warning: "#d97706",
        danger: "#dc2626",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
