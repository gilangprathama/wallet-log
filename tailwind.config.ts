import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'text-green-400',
    'text-yellow-400',
    'text-red-400',
    'bg-green-400/10',
    'bg-yellow-400/10',
    'bg-red-400/10',
    'border-green-400/30',
    'border-yellow-400/30',
    'border-red-400/30',
    'bg-green-500',
    'bg-yellow-500',
    'bg-red-500',
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#080e1a',
          surface: '#0d1526',
          'surface-2': '#111c33',
          border: '#1a2744',
        },
      },
    },
  },
  plugins: [],
};

export default config;
