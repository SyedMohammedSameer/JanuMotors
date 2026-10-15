/** @type {import('tailwindcss').Config} */
// Same theme that used to be configured inline in index.html for the Tailwind CDN script.
export default {
  content: [
    './index.html',
    './*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
    './utils/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FFD700',
          '50': '#FFFEF7',
          '100': '#FFFBEB',
          '200': '#FFF3C4',
          '300': '#FFEC8C',
          '400': '#FFE066',
          '500': '#FFD700',
          '600': '#E6C200',
          '700': '#B8940D',
          '800': '#8A6914',
          '900': '#5C4619',
          '950': '#3D2F11',
        },
        dark: {
          DEFAULT: '#000000',
          '50': '#1a1a1a',
          '100': '#2d2d2d',
          '200': '#404040',
          '300': '#525252',
          '400': '#737373',
          '500': '#a3a3a3',
          '600': '#d4d4d4',
          '700': '#e5e5e5',
          '800': '#f5f5f5',
          '900': '#fafafa',
        },
        accent: {
          DEFAULT: '#FF6B35',
          light: '#FF8F65',
          dark: '#CC4A1A',
        },
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxury': 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
        'gradient-gold': 'linear-gradient(135deg, #FFD700 0%, #FFC107 50%, #FF6B35 100%)',
      },
      boxShadow: {
        luxury: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        gold: '0 10px 25px -5px rgba(255, 215, 0, 0.3)',
        'inner-luxury': 'inset 0 2px 4px 0 rgba(255, 215, 0, 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
