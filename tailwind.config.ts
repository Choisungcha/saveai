import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: 'var(--color-navy)',
        green: 'var(--color-green)',
        surface: 'var(--color-surface)',
        soft: 'var(--color-soft)',
        foreground: 'var(--color-foreground)',
        muted: 'var(--color-muted)',
      },
      boxShadow: {
        glow: '0 25px 80px rgba(34, 197, 94, 0.18)',
      },
    },
  },
  plugins: [],
};

export default config;
