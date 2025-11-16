/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Vibrant but professional palette
        primary: {
          50: '#f4f5ff',
          100: '#ececff',
          200: '#dcdafe',
          300: '#c2bfff',
          400: '#a195ff',
          500: '#7c66ff',
          600: '#5d43f6',
          700: '#4d34d1',
          800: '#3f2ca8',
          900: '#352a7d',
          DEFAULT: '#7c66ff',
        },
        accent: {
          50: '#fff7f9',
          100: '#ffeaf3',
          200: '#ffd0e5',
          300: '#ffabd0',
          400: '#ff7ab3',
          500: '#ff4f97',
          600: '#e81f79',
          700: '#c11463',
          800: '#9a1554',
          900: '#7d1648',
          DEFAULT: '#ff4f97',
        },
        neutral: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#eeeeee',
          300: '#e0e0e0',
          400: '#bdbdbd',
          500: '#9e9e9e',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
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

