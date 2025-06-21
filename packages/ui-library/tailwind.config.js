/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      // Defines the official iShopMaster color palette as design tokens.
      colors: {
        slate: {
          100: "#f1f5f9", // Lightest gray for primary text and headings
          300: "#cbd5e1", // Lighter gray for secondary text
          400: "#94a3b8", // Gray for labels and muted/placeholder text
          700: "#334155", // For borders and dividers
          800: "#1e293b", // Panel, card, and modal backgrounds
          900: "#0f172a", // The primary, main background color
        },
        indigo: {
          // The primary accent color for interactive elements
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
      },
      // Defines the official font family for the application.
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "Avenir",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
