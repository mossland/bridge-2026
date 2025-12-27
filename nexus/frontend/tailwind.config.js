/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#f0f9f4',
          100: '#dcf2e3',
          200: '#bce5cc',
          300: '#8fd1a8',
          400: '#5ab47d',
          500: '#36985c',
          600: '#287a4a',
          700: '#22623d',
          800: '#1e4e33',
          900: '#1a412b',
        },
      },
    },
  },
  plugins: [],
};

