import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#284b7d",
          ink: "#18181b",
          muted: "#5f6673",
          surface: "#eef2f7",
          surfaceMid: "#dde1f0",
          border: "#d8e0eb",
          evidence: "#c6a24a",
          process: "#6d5bd0",
          success: "#15803d",
          warning: "#b7791f",
          danger: "#b42318"
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "Noto Sans JP",
          "YuGothic",
          "Yu Gothic",
          "Hiragino Kaku Gothic ProN",
          "sans-serif"
        ],
        mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
      },
      boxShadow: {
        clickable: "0 8px 24px rgba(24, 36, 56, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
