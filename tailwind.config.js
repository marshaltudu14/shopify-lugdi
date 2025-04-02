import tailwindcssAnimate from "tailwindcss-animate"; // Use import

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"], // Assuming you use next-themes with class strategy
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}", // Include if using pages dir too
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}", // Scan lib folder too
    // Add other paths where you might use Tailwind classes
  ],
  safelist: [
    // Theme classes
    "theme-diwali",
    "theme-christmas",
    "theme-india-independence",
    "theme-spring",
    "theme-summer",
    "theme-autumn",
    "theme-winter",
    // Decoration classes
    "logo-decorate-diya",
    "logo-decorate-snowflake",
    "logo-decorate-flag-in",
    "logo-decorate-leaf",
    "logo-decorate-sun",
    // Added new festival themes/decorations
    "theme-new-year",
    "theme-valentine",
    "theme-india-republic",
    "theme-holi",
    "theme-eid",
    "logo-decorate-firework",
    "logo-decorate-heart",
    "logo-decorate-holi",
    "logo-decorate-eid",
  ],
  prefix: "", // Optional prefix for Tailwind classes
  theme: {
    // You might want to extend the default theme here later
    // For now, we rely on the CSS variables defined in globals.css
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // Extend theme properties like colors, fonts, keyframes etc. if needed
      // Example:
      // colors: {
      //   border: "hsl(var(--border))", // Reference CSS vars if needed
      // },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate], // Use imported plugin
};

export default config; // Use export default
