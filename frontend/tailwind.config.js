/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'hot-pink': '#FF1493',
        'glossy-black': '#000000',
        'steel-grey': '#708090',
        'holographic-cyan': '#00FFFF',
        'holographic-magenta': '#FF00FF',
        'holographic-yellow': '#FFFF00',
        'success-teal': '#40E0D0',
        'girly-pink': '#FFC0CB',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        headline: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-elevated': '0 12px 48px 0 rgba(0, 0, 0, 0.45)',
        holographic: '0 0 20px rgba(0, 255, 255, 0.5)',
      },
    },
  },
  plugins: [],
};
