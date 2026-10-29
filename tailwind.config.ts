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
        plum: {
          50: "#FAF5FC",
          100: "#F3E7F8",
          200: "#E6CDF0",
          300: "#D3A9E4",
          400: "#B875D3",
          500: "#8E3BAF",
          600: "#6B2089",
          700: "#4D1164",
          800: "#360C47",
          900: "#2B0A3D",
          950: "#1A0626",
        },
        saffron: {
          50: "#FFFDF0",
          100: "#FFF9C4",
          200: "#FFF28A",
          300: "#FFE645",
          400: "#FFD314",
          500: "#FFB000",
          600: "#E09000",
          700: "#B86F00",
          800: "#8F5200",
          900: "#6B3B00",
        },
        rose: {
          50: "#FFF1F5",
          100: "#FFE4EC",
          200: "#FFCCD9",
          300: "#FFA3BC",
          400: "#FF6B97",
          500: "#E8457C",
          600: "#C7255E",
          700: "#A31548",
          800: "#801239",
          900: "#5E0F2B",
        },
        ivory: {
          DEFAULT: "#FFF8EE",
          50: "#FFFFFF",
          100: "#FFFDF9",
          200: "#FFF8EE",
          300: "#FBEFD7",
          400: "#F5DFB5",
          500: "#E8CA8A",
          600: "#D2AA5E",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        "2xl": "calc(var(--radius-xl) + 8px)",
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(43, 10, 61, 0.12)",
        "glass-glow": "0 8px 32px 0 rgba(255, 176, 0, 0.15), 0 0 16px 0 rgba(232, 69, 124, 0.1)",
        "elevation-1": "0 2px 4px rgba(43, 10, 61, 0.06), 0 1px 2px rgba(43, 10, 61, 0.04)",
        "elevation-2": "0 8px 16px -4px rgba(43, 10, 61, 0.1), 0 4px 6px -2px rgba(43, 10, 61, 0.05)",
        "elevation-3": "0 20px 25px -5px rgba(43, 10, 61, 0.15), 0 10px 10px -5px rgba(43, 10, 61, 0.08)",
      },
      keyframes: {
        aurora: {
          "0%, 100%": {
            transform: "translate(0, 0) scale(1)",
            opacity: "0.45",
          },
          "33%": {
            transform: "translate(30px, -20px) scale(1.1)",
            opacity: "0.65",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.95)",
            opacity: "0.5",
          },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        aurora: "aurora 14s ease-in-out infinite",
        "pulse-glow": "pulse-glow 3s ease-in-out infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;

