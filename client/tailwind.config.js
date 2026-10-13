/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FDF2F2',
          100: '#FDE4E4',
          200: '#FACDCD',
          300: '#F5A6A6',
          400: '#ED6F6F',
          500: '#D62828', // Signboard Crimson Primary
          600: '#BA181B', // Darker Red
          700: '#9E1417',
          800: '#7F1D1D',
          900: '#5A1214',
        },
        gold: {
          50: '#FFFDF0',
          100: '#FFF9D6',
          200: '#FFF0A3',
          300: '#FFE470',
          400: '#F4B942',
          500: '#E9C46A', // Golden Yellow Accent
          600: '#D4A32A',
          700: '#B2821B',
          800: '#8A6214',
          900: '#63450E',
        },
        cream: {
          50: '#FFFDF9', // Base Warm Canvas
          100: '#FAF6ED', // Warm Card Surface
          200: '#F4ECE0',
          300: '#EAE0D1',
          400: '#DFD2BF',
          500: '#CEBEA6',
        },
        charcoal: {
          800: '#2B2B36',
          900: '#1E1E24', // Accessible Slate Text
        }
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        bengali: ['"Baloo Da 2"', '"Noto Sans Bengali"', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(214, 40, 40, 0.08)',
        'card': '0 2px 12px rgba(0, 0, 0, 0.06)',
        'elevated': '0 10px 30px -4px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

