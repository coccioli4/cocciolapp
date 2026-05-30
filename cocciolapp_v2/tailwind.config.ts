import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: { apple: "0 18px 50px rgba(15, 23, 42, 0.10)" },
      borderRadius: { apple: "28px" }
    }
  },
  plugins: []
};
export default config;
