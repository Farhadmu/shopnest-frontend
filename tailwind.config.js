/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fff7ed",
          100: "#ffedd5",
          200: "#fed7aa",
          300: "#fdba74",
          400: "#fb923c",
          500: "#f97316",
          600: "#ea580c",
          700: "#c2410c",
          800: "#9a3412",
        },
        accent: {
          50: "#f0fdfa",
          100: "#ccfbf1",
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        violet: {
          500: "#8b5cf6",
          600: "#7c3aed",
        },
      },
      fontFamily: {
        sans: ["Poppins", "Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 8px 30px -6px rgba(234, 88, 12, 0.35)",
        card: "0 2px 12px rgba(15, 23, 42, 0.06)",
        "card-hover": "0 12px 28px rgba(15, 23, 42, 0.12)",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #f97316 0%, #ea580c 50%, #db2777 100%)",
        "hero-gradient": "linear-gradient(120deg, #ea580c 0%, #f97316 35%, #f59e0b 70%, #ec4899 100%)",
        "violet-gradient": "linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)",
        "teal-gradient": "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(12px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-500px 0" },
          "100%": { backgroundPosition: "500px 0" },
        },
        popIn: {
          "0%": { opacity: 0, transform: "scale(0.9)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        pulseSoft: {
          "0%,100%": { opacity: 1 },
          "50%": { opacity: 0.6 },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.5s ease-out both",
        fadeIn: "fadeIn 0.4s ease-out both",
        floaty: "floaty 4s ease-in-out infinite",
        shimmer: "shimmer 1.8s linear infinite",
        popIn: "popIn 0.25s ease-out both",
        pulseSoft: "pulseSoft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
