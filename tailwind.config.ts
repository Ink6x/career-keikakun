import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#5ac8b8",
          "primary-soft": "rgba(90, 200, 184, 0.16)",
          ink: "#08131a",
          muted: "#5f6673",
          surface: "#ffffff",
          "surface-alt": "#f5f8fa",
          border: "rgba(8, 19, 26, 0.14)",
          "border-strong": "rgba(8, 19, 26, 0.22)",
          success: "#2a8478",
          "success-soft": "rgba(42, 132, 120, 0.12)",
          warning: "#916626",
          "warning-soft": "rgba(145, 102, 38, 0.12)",
          danger: "#b22323",
          "danger-soft": "rgba(178, 35, 35, 0.10)"
        }
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Helvetica Neue",
          "Arial",
          "Noto Sans JP",
          "Meiryo",
          "sans-serif"
        ],
        heading: [
          "var(--font-heading)",
          "Zen Old Mincho",
          "Hiragino Mincho ProN",
          "Yu Mincho",
          "YuMincho",
          "serif"
        ],
        marker: [
          "var(--font-marker)",
          "Yusei Magic",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "sans-serif"
        ],
        mono: ["SFMono-Regular", "Consolas", "Liberation Mono", "monospace"]
      },
      fontSize: {
        "brand-title": ["clamp(1.75rem, 4vw + 0.5rem, 2.5rem)", { lineHeight: "1.2" }],
        "screen-title": ["clamp(1.5rem, 2.5vw + 0.5rem, 2rem)", { lineHeight: "1.4" }],
        "card-title": ["clamp(1.125rem, 1vw + 0.875rem, 1.5rem)", { lineHeight: "1.4" }],
        score: ["clamp(2.5rem, 6vw + 1rem, 3.5rem)", { lineHeight: "1" }]
      },
      spacing: {
        "page-x": "clamp(1rem, 4vw, 2.5rem)",
        "section-y": "clamp(2.5rem, 6vw, 4.5rem)"
      },
      maxWidth: {
        prose: "620px",
        page: "960px"
      },
      boxShadow: {
        "elevation-1": "0 1px 2px rgba(8, 19, 26, 0.04), 0 2px 6px rgba(8, 19, 26, 0.05)"
      },
      borderRadius: {
        card: "12px",
        button: "8px"
      }
    }
  },
  plugins: []
};

export default config;
