import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary: calm, trustworthy blue
        brand: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b7fd9",
          600: "#2563b8",
          700: "#1e4f94",
          800: "#1c3f73",
          900: "#172f54",
        },
        // Secondary: supportive sage green (recovery, progress)
        sage: {
          50: "#f0f9f4",
          100: "#dbf0e3",
          200: "#b9e1c9",
          300: "#8ccaa8",
          400: "#5dad82",
          500: "#3d9166",
          600: "#2d7451",
          700: "#255d42",
          800: "#204a36",
          900: "#1b3d2e",
        },
        // Warm amber for attention (used instead of alarming red)
        amber: {
          50: "#fffbeb",
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
        // Soft coral for the most time-sensitive states, used sparingly
        coral: {
          50: "#fff5f3",
          100: "#ffe6e1",
          200: "#ffcdc4",
          500: "#e0664f",
          600: "#c4503a",
          700: "#a33f2c",
        },
        // Recovery mode accent: steady violet
        dusk: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          500: "#7c6bd6",
          600: "#6553c2",
          700: "#5242a3",
        },
        ink: {
          DEFAULT: "#1f2937",
          soft: "#4b5563",
          muted: "#6b7280",
        },
        canvas: "#f8fafc",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 16px rgba(15, 23, 42, 0.06)",
        lift: "0 2px 4px rgba(15, 23, 42, 0.05), 0 12px 32px rgba(15, 23, 42, 0.10)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "status-shift": {
          "0%": { transform: "scale(0.97)", opacity: "0.4" },
          "50%": { transform: "scale(1.015)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(124, 107, 214, 0.45)" },
          "100%": { boxShadow: "0 0 0 18px rgba(124, 107, 214, 0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
        "status-shift": "status-shift 0.8s ease-out both",
        "pulse-ring": "pulse-ring 1.4s ease-out 2",
      },
    },
  },
  plugins: [],
};
export default config;
