/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'accent-teal': '#0FA3A3',
        'accent-light': '#1CC8C8',
        'navy-primary': '#1A2B4A',
        'navy-light': '#2D4A6F',
        'gold-accent': '#D4AF37',
        'glossy-black': '#000000',
        'steel-grey': '#708090',
        'teal-glow': '#0FA3A3',
        'success-teal': '#40E0D0',
        // Legacy aliases for backward compatibility
        'hot-pink': '#0FA3A3',
        'girly-pink': '#1CC8C8',
        'holographic-cyan': '#0FA3A3',
        'holographic-magenta': '#1A2B4A',
        'holographic-yellow': '#D4AF37',
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
