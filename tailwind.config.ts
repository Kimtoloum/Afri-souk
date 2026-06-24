import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Terre cuite — accent signature (poterie, teinture, épices)
        primary: {
          50:  "#FBF1EA",
          100: "#F4DCC9",
          200: "#E8B996",
          400: "#D17D4A",
          500: "#C1572B",
          600: "#A8481F",
          700: "#8A3A19",
          900: "#4A1F0F",
        },
        // Indigo profond — accent secondaire (teinture adire/bogolan)
        indigo: {
          400: "#3D6B83",
          500: "#2C5267",
          600: "#1F3F54",
          700: "#173040",
        },
        ai: {
          up:        "#4F7A52", // herbes séchées
          warn:      "#C98A2E", // or-épice
          danger:    "#9C3B26", // terre cuite foncée
          upLight:   "#E1ECDD",
          warnLight: "#F5E6C8",
          dangerLight:"#F1DCD3",
        },
        surface: {
          light: "#F3E9D8",
          dark:  "#1F1812",
        },
        page: {
          light: "#FBF6EE",
          dark:  "#15110D",
        },
        border: {
          light: "#E3D5BD",
          dark:  "#34281D",
        },
      },
      fontFamily: {
        sans:    ["Inter", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"],
        mono:    ["\"IBM Plex Mono\"", "monospace"],
      },
      borderRadius: {
        DEFAULT: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "20px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(36,28,21,0.06), 0 1px 2px rgba(36,28,21,0.04)",
        "card-hover": "0 8px 20px rgba(161,72,31,0.16)",
      },
      backgroundImage: {
        "stripe-band":
          "linear-gradient(90deg, #C1572B 0%, #C1572B 25%, #C98A2E 25%, #C98A2E 50%, #1F3F54 50%, #1F3F54 75%, #F3E9D8 75%, #F3E9D8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
