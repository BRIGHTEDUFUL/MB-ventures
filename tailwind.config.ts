import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        // Design Tokens from docs/DESIGN.md
        ink: {
          DEFAULT: "var(--ink)",
          muted: "var(--ink-muted)",
          subtle: "var(--ink-subtle)",
        },
        surface: "var(--surface)",
        canvas: {
          DEFAULT: "var(--canvas)",
          strong: "var(--canvas-strong)",
        },
        line: {
          DEFAULT: "var(--line)",
          strong: "var(--line-strong)",
        },
        brand: {
          DEFAULT: "var(--brand)",
          hover: "var(--brand-hover)",
          active: "var(--brand-active)",
          soft: "var(--brand-soft)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
        },
        link: "var(--link)",
        focus: "var(--focus)",
        success: {
          DEFAULT: "var(--success)",
          soft: "var(--success-soft)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          soft: "var(--warning-soft)",
        },
        danger: {
          DEFAULT: "var(--danger)",
          hover: "var(--danger-hover)",
          soft: "var(--danger-soft)",
        },

        // shadcn compatibility mapping to tokens
        background: "var(--surface)",
        foreground: "var(--ink)",
        card: {
          DEFAULT: "var(--surface)",
          foreground: "var(--ink)",
        },
        popover: {
          DEFAULT: "var(--surface)",
          foreground: "var(--ink)",
        },
        primary: {
          DEFAULT: "var(--brand)",
          foreground: "var(--surface)",
        },
        secondary: {
          DEFAULT: "var(--canvas)",
          foreground: "var(--ink)",
        },
        muted: {
          DEFAULT: "var(--canvas)",
          foreground: "var(--ink-muted)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "var(--surface)",
        },
        border: "var(--line)",
        input: "var(--line-strong)",
        ring: "var(--focus)",
      },
      borderRadius: {
        sm: "var(--radius-sm)", // 4px
        md: "var(--radius-md)", // 6px
        lg: "var(--radius-lg)", // 8px
        DEFAULT: "var(--radius-md)",
      },
      screens: {
        // Mobile-first breakpoints matching docs/DESIGN.md
        xs: "375px", // small phones
        sm: "640px", // tablet portrait
        md: "768px", // tablet landscape
        lg: "1024px", // desktop
        xl: "1280px", // max container
        "2xl": "1536px",
      },
      spacing: {
        // 8px spacing scale as per docs/DESIGN.md
        "0.5": "4px",
        "1": "8px",
        "1.5": "12px",
        "2": "16px",
        "2.5": "20px",
        "3": "24px",
        "3.5": "28px",
        "4": "32px",
        "5": "40px",
        "6": "48px",
        "7": "56px",
        "8": "64px",
        "9": "72px",
        "10": "80px",
        "12": "96px",
      },
      boxShadow: {
        // Floating layers only — cards and panels stay flat at rest
        layer: "var(--shadow-layer)",
        "layer-sm": "var(--shadow-layer-sm)",
      },
      transitionDuration: {
        120: "120ms", // hover, press
        200: "200ms", // UI state changes
        320: "320ms", // drawers, dialogs
      },
      transitionTimingFunction: {
        // docs/DESIGN.md easing
        snap: "cubic-bezier(0.2, 0, 1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
