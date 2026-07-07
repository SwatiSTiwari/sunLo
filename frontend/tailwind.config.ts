import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sunlo: {
          background: "#FFF7ED",
          surface: "#FFFFFF",
          text: "#3D2517",
          muted: "#8B6F5C",
          primary: "#D2692C",
          "primary-dark": "#B55624",
          accent: "#F4A261",
          secondary: "#FDE68A",
          "secondary-light": "#FEF3C7",
          success: "#22C55E",
          error: "#EF4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "var(--font-noto)", "sans-serif"],
        hindi: ["var(--font-noto)", "var(--font-poppins)", "sans-serif"],
      },
      borderRadius: {
        sunlo: "16px",
        xl2: "20px",
        xl3: "24px",
      },
      boxShadow: {
        soft: "0 4px 20px rgba(210, 105, 44, 0.10)",
        card: "0 8px 30px rgba(61, 37, 23, 0.06)",
        button: "0 4px 14px rgba(210, 105, 44, 0.25)",
      },
      backgroundImage: {
        "sunlo-gradient": "linear-gradient(135deg, #EA7E3F 0%, #F5B041 100%)",
        "sunlo-hero": "linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)",
      },
    },
  },
  plugins: [],
};
export default config;
