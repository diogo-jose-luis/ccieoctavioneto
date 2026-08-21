import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#070b12",
        navy: "#0c1624",
        panel: "#101b2c",
        cyan: {
          DEFAULT: "#3ee0f0",
          dim: "#1aa8b8",
        },
        gold: {
          DEFAULT: "#d4a017",
          soft: "#f0d48a",
        },
        mist: "#9aadc4",
      },
      fontFamily: {
        sans: ["var(--font-ibm)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      screens: {
        short: { raw: "(max-height: 820px)" },
        shorter: { raw: "(max-height: 700px)" },
      },
    },
  },
  plugins: [],
};

export default config;
