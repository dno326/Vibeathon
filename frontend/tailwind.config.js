/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm, collegiate palette
        primary: {
          50: '#fbf7f3',
          100: '#f6ede5',
          200: '#ead9cc',
          300: '#d8bda7',
          400: '#bf9a7f',
          500: '#a17763',
          600: '#8b5f4f',
          700: '#744b3f',
          800: '#5c3b33',
          900: '#4b2f23',
          DEFAULT: '#744b3f',
        },
        accent: {
          50: '#fff8ed',
          100: '#ffefd6',
          200: '#ffe1b0',
          300: '#ffd089',
          400: '#ffbe66',
          500: '#f5a94b',
          600: '#d48635',
          700: '#b0692b',
          800: '#8d5125',
          900: '#73431f',
          DEFAULT: '#f5a94b',
        },
        neutral: {
          50: '#faf9f7',
          100: '#f4f1ed',
          200: '#e8e3dc',
          300: '#d6d0c6',
          400: '#b9b1a6',
          500: '#9c9388',
          600: '#7f756a',
          700: '#675e55',
          800: '#524a43',
          900: '#3f3933',
        },
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      boxShadow: {
        soft: '0 6px 20px rgba(16, 24, 40, 0.06)',
        card: '0 12px 24px rgba(16, 24, 40, 0.08)',
        float: '0 18px 30px rgba(16, 24, 40, 0.12)',
      },
      transitionTimingFunction: {
        'out-soft': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        200: '200ms',
        250: '250ms',
        300: '300ms',
        350: '350ms',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'Apple Color Emoji', 'Segoe UI Emoji'],
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
    },
  },
  plugins: [],
}

