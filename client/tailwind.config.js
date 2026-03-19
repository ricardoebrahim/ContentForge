/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: '#080808',
        surface: '#111111',
        border: '#1f1f1f',
        primary: '#8b5cf6',
        'primary-light': '#a78bfa',
        'text-primary': '#ffffff',
        'text-secondary': '#a1a1aa',
        success: '#10b981',
      },
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(139, 92, 246, 0.3)',
        'glow-lg': '0 0 40px rgba(139, 92, 246, o.4',
      },
    },
  },
  plugins: [],
}

