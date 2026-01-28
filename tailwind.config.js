/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          deep: '#2D3A27',
          light: '#4A5D3E',
          soft: '#6B7F5A',
        },
        bark: {
          dark: '#3E2E1F',
          medium: '#5C4A3A',
          light: '#8B7355',
        },
        mist: {
          light: '#E5E7E6',
          medium: '#D1D5D4',
          dark: '#B8BCBB',
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'dappled-light': 'radial-gradient(ellipse at top, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(255,255,255,0.05) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}

