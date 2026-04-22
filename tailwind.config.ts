import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: '#1A1F2C',
        green: '#22C55E',
        surface: '#131824',
        soft: '#242E4A',
      },
      boxShadow: {
        glow: '0 25px 80px rgba(34, 197, 94, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
