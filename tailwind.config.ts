import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
      },
      fontFamily: {
        sans: ['var(--font-vazirmatn)'],
      },
    },
  },
  plugins: [],
};

export default config;
