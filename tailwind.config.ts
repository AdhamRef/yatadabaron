import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-tajawal)", "system-ui", "sans-serif"],
        display: ["var(--font-amiri)", "serif"],
      },
      colors: {
        brand: {
          50: "#f2faf6",
          100: "#d8f1e4",
          200: "#b3e3cb",
          300: "#83cdab",
          400: "#54b28a",
          500: "#2f9770",
          600: "#1f7a5a",
          700: "#19604a",
          800: "#154d3d",
          900: "#113f33",
          950: "#08241d",
        },
        gold: {
          50: "#fdf9ef",
          100: "#fbf0d4",
          200: "#f6dfa5",
          300: "#efc870",
          400: "#e8b14a",
          500: "#d99329",
          600: "#bc7420",
          700: "#95561d",
          800: "#7a4520",
          900: "#663a20",
        },
      },
      boxShadow: {
        soft: "0 10px 40px -10px rgba(31,122,90,0.25)",
        glow: "0 0 40px -8px rgba(217,147,41,0.55)",
      },
      backgroundImage: {
        "grid-islamic":
          "radial-gradient(circle at 1px 1px, rgba(31,122,90,0.08) 1px, transparent 0)",
      },
      keyframes: {
        "fade-in": { "0%": { opacity: "0", transform: "translateY(6px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
        "pulse-glow": { "0%,100%": { boxShadow: "0 0 0 0 rgba(47,151,112,0.4)" }, "50%": { boxShadow: "0 0 0 14px rgba(47,151,112,0)" } },
        shimmer: { "0%": { backgroundPosition: "-400px 0" }, "100%": { backgroundPosition: "400px 0" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-8px)" } },
      },
      animation: {
        "fade-in": "fade-in .35s ease-out both",
        "pulse-glow": "pulse-glow 2.4s infinite",
        shimmer: "shimmer 1.6s infinite linear",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
