import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#fef7ee",
          100: "#fdedd6",
          200: "#f9d7ac",
          300: "#f5ba77",
          400: "#ef9340",
          500: "#eb771c",
          600: "#dc5c12",
          700: "#b64511",
          800: "#913715",
          900: "#762f14",
        },
      },
    },
  },
  plugins: [],
};

export default config;