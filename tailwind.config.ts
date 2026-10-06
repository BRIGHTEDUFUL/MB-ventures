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
        accent: {
          DEFAULT: "var(--accent)",
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
          DEFAULT: "var(--ink)",
          foreground: "#FFFFFF",
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
          foreground: "#FFFFFF",
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
