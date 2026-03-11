/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#f97015", // Stitch vibrant orange
        "background-light": "#f9fafb", // Premium off-white
        "background-dark": "#23170f",
        "card-light": "rgba(255, 255, 255, 0.8)", // Glassmorphism base
        "border-light": "rgba(0, 0, 0, 0.05)",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "md": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.125rem", // Standard Stitch card radius (18px)
        "full": "9999px"
      },
      boxShadow: {
        'premium': '0 4px 6px rgba(0, 0, 0, 0.02), 0 1px 3px rgba(0, 0, 0, 0.01)',
        'premium-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.04), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
        'glow': '0 8px 16px rgba(249, 112, 21, 0.2)',
        'mobile-sidebar': '20px 0 80px rgba(0, 0, 0, 0.1)',
      }
    },
  },
  plugins: [],
}
