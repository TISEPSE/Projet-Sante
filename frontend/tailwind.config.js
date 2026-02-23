/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#197fe6',
        'bg-dark': '#111217',
        'panel-dark': '#181b1f',
        'surface-lighter': '#22252b',
        'input-bg': '#0b0c0e',
        'border-dark': '#2c3235',
        success: '#299c46',
        warning: '#eb7b18',
        danger: '#d73a49',
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
