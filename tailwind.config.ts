import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Brand
        brand: {
          50:  "#eef5ff",
          100: "#d9e8ff",
          200: "#bcd6ff",
          300: "#8ebbff",
          400: "#5994ff",
          500: "#3b74ff",
          600: "#1a4ff5",
          700: "#1540e1",
          800: "#1836b6",
          900: "#1a308f",
          950: "#141f57",
        },
        // Accent — Nigerian green undertone
        accent: {
          50:  "#f0fdf4",
          100: "#dcfce7",
          200: "#bbf7d0",
          300: "#86efac",
          400: "#4ade80",
          500: "#22c55e",
          600: "#16a34a",
          700: "#15803d",
          800: "#166534",
          900: "#14532d",
          950: "#052e16",
        },
        // Gold — premium feel
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Semantic
        success: "#22c55e",
        warning: "#f59e0b",
        danger:  "#ef4444",
        info:    "#3b82f6",
        // Surface
        surface: {
          DEFAULT: "#ffffff",
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          dark:    "#0f172a",
          "dark-2": "#1e293b",
          "dark-3": "#334155",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-plus-jakarta)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-brand":
          "linear-gradient(135deg, #1a4ff5 0%, #3b74ff 50%, #5994ff 100%)",
        "gradient-gold":
          "linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)",
        "gradient-success":
          "linear-gradient(135deg, #15803d 0%, #22c55e 100%)",
        "gradient-danger":
          "linear-gradient(135deg, #b91c1c 0%, #ef4444 100%)",
        "gradient-card":
          "linear-gradient(135deg, rgba(59,116,255,0.08) 0%, rgba(91,148,255,0.04) 100%)",
        "gradient-dark":
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        "gradient-mesh":
          "radial-gradient(at 40% 20%, hsla(228,100%,74%,0.15) 0px, transparent 50%), radial-gradient(at 80% 0%, hsla(189,100%,56%,0.1) 0px, transparent 50%), radial-gradient(at 0% 50%, hsla(355,100%,93%,0.05) 0px, transparent 50%)",
      },
      boxShadow: {
        "card":     "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-md":  "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)",
        "card-lg":  "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)",
        "card-xl":  "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        "brand":    "0 4px 14px 0 rgba(26,79,245,0.3)",
        "gold":     "0 4px 14px 0 rgba(245,158,11,0.3)",
        "success":  "0 4px 14px 0 rgba(34,197,94,0.3)",
        "inner-sm": "inset 0 1px 2px 0 rgba(0,0,0,0.05)",
        "glow-brand": "0 0 20px rgba(59,116,255,0.4), 0 0 60px rgba(59,116,255,0.15)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-in":    "fadeIn 0.3s ease-in-out",
        "slide-up":   "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in":   "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        "spin-slow":  "spin 3s linear infinite",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer":    "shimmer 2s linear infinite",
        "float":      "float 6s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
      },
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
