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
      // ─── Colors ────────────────────────────────────────────────────────────────
      colors: {
        // shadcn/Radix CSS-variable tokens
        background:  "var(--background)",
        foreground:  "var(--foreground)",
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT:    "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input:  "var(--input)",
        ring:   "var(--ring)",
        // Chart tokens
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        // Sidebar tokens
        sidebar: {
          DEFAULT:            "var(--sidebar)",
          foreground:         "var(--sidebar-foreground)",
          primary:            "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent:             "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border:             "var(--sidebar-border)",
          ring:               "var(--sidebar-ring)",
        },

        // ── TrackFlow brand palette ──────────────────────────────────────────
        // Brand — TrackFlow Emerald (#0A6E5E primary)
        brand: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6EE7B7", // --tf-emerald-light
          400: "#34d399",
          500: "#10B981", // --tf-emerald
          600: "#0A6E5E", // --tf-emerald-dark  ← primary action colour
          700: "#065f46",
          800: "#064e3b",
          900: "#022c22",
          950: "#011a15",
        },
        // Navy — dark backgrounds
        navy: {
          DEFAULT: "#0D1B3E", // --tf-navy
          mid:     "#1E3A5F", // --tf-navy-mid
          deep:    "#2d4a73",
        },
        // Gold — premium / CTA
        gold: {
          50:  "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#FCD34D", // --tf-gold-light
          400: "#fbbf24",
          500: "#F5A623", // --tf-gold
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
        },
        // Semantic status
        success: "#10B981",
        warning: "#F5A623",
        danger:  "#ef4444",
        info:    "#3b82f6",
        // Surface neutrals
        surface: {
          DEFAULT:  "#ffffff",
          50:       "#F9FAFB", // --tf-gray-50
          100:      "#F3F4F6", // --tf-gray-100
          200:      "#e2e8f0",
          300:      "#cbd5e1",
          dark:     "#0D1B3E", // --tf-navy
          "dark-2": "#1E3A5F", // --tf-navy-mid
          "dark-3": "#2d4a73",
        },
      },

      // ─── Typography ────────────────────────────────────────────────────────────
      fontFamily: {
        // DM Sans — body / UI (loaded via next/font/google → CSS var)
        sans:    ["var(--font-dm-sans)", "DM Sans", "system-ui", "sans-serif"],
        // Clash Display — headings / display (loaded via FontShare CDN)
        display: ["Clash Display", "var(--font-dm-sans)", "sans-serif"],
        // JetBrains Mono — code / amounts (loaded via next/font/google → CSS var)
        mono:    ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
        // Satoshi — alternative body (FontShare CDN)
        satoshi: ["Satoshi", "var(--font-dm-sans)", "sans-serif"],
      },

      // ─── Gradients ─────────────────────────────────────────────────────────────
      backgroundImage: {
        // Hero / brand gradient (navy → emerald-dark → emerald)
        "gradient-brand":
          "linear-gradient(135deg, #0D1B3E 0%, #0A6E5E 60%, #10B981 100%)",
        // Gold CTA gradient
        "gradient-gold":
          "linear-gradient(90deg, #F5A623 0%, #FCD34D 100%)",
        // Income / success
        "gradient-success":
          "linear-gradient(135deg, #10B981 0%, #059669 100%)",
        // Expense / danger
        "gradient-danger":
          "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
        // Card interior
        "gradient-card":
          "linear-gradient(145deg, #1E3A5F 0%, #0A6E5E 100%)",
        // Full-dark background sweep
        "gradient-dark":
          "linear-gradient(135deg, #0D1B3E 0%, #1E3A5F 50%, #0D1B3E 100%)",
        // Ambient mesh overlay
        "gradient-mesh":
          "radial-gradient(at 40% 20%, hsla(162,84%,39%,0.15) 0px, transparent 50%), " +
          "radial-gradient(at 80% 0%,  hsla(166,82%,23%,0.12) 0px, transparent 50%), " +
          "radial-gradient(at 0%  50%, hsla(38,90%,55%,0.06)  0px, transparent 50%)",
        // Shimmer loading bar (used with animate-shimmer)
        "gradient-shimmer":
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
      },

      // ─── Shadows ───────────────────────────────────────────────────────────────
      boxShadow: {
        "card":       "0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)",
        "card-md":    "0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.07)",
        "card-lg":    "0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.08)",
        "card-xl":    "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
        "brand":      "0 4px 14px 0 rgba(10,110,94,0.35)",
        "gold":       "0 4px 14px 0 rgba(245,166,35,0.35)",
        "success":    "0 4px 14px 0 rgba(16,185,129,0.3)",
        "inner-sm":   "inset 0 1px 2px 0 rgba(0,0,0,0.05)",
        "glow-brand": "0 0 20px rgba(16,185,129,0.4), 0 0 60px rgba(10,110,94,0.2)",
        "glow-gold":  "0 0 20px rgba(245,166,35,0.4), 0 0 60px rgba(245,166,35,0.15)",
      },

      // ─── Border radius extensions ───────────────────────────────────────────────
      borderRadius: {
        lg:   "var(--radius)",
        md:   "calc(var(--radius) - 2px)",
        sm:   "calc(var(--radius) - 4px)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      // ─── Animations ────────────────────────────────────────────────────────────
      animation: {
        // Entrances
        "fade-in":    "fadeIn 0.3s ease-in-out",
        "slide-up":   "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-down": "slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        "scale-in":   "scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        // Loops
        "float":        "float 6s ease-in-out infinite",
        "pulse-glow":   "pulseGlow 2.5s ease-in-out infinite",
        "spin-slow":    "spin 3s linear infinite",
        "pulse-slow":   "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "shimmer":      "shimmer 2s linear infinite",
      },

      // ─── Keyframes ─────────────────────────────────────────────────────────────
      keyframes: {
        // Fade in (opacity only)
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        // Slide up from slight offset
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Slide down from slight offset
        slideDown: {
          "0%":   { opacity: "0", transform: "translateY(-16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Scale in from 95%
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // Gentle vertical float
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        // Emerald glow pulse (box-shadow breathe)
        pulseGlow: {
          "0%, 100%": {
            boxShadow: "0 0 8px rgba(16,185,129,0.3), 0 0 20px rgba(10,110,94,0.15)",
            opacity: "1",
          },
          "50%": {
            boxShadow: "0 0 24px rgba(16,185,129,0.7), 0 0 60px rgba(10,110,94,0.4)",
            opacity: "0.85",
          },
        },
        // Horizontal shimmer sweep
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },

      // ─── Breakpoints ───────────────────────────────────────────────────────────
      screens: {
        xs: "375px",
      },
    },
  },
  plugins: [],
};

export default config;
