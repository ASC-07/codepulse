/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0a0a0f",
          800: "#0f0f18",
          700: "#141420",
          600: "#1a1a2e",
        },
        brand: {
          purple: "#7F77DD",
          "purple-light": "#afa9ec",
          teal: "#5DCAA5",
          amber: "#FAC775",
          coral: "#F09595",
        }
      },
      fontFamily: {
        mono: ["JetBrains Mono", "monospace"],
      }
    },
  },
  plugins: [],
}