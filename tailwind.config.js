/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        navy: {
          900: '#020617',
          800: '#091525',
          700: '#0c1a3d',
        },
        electric: {
          500: '#3b82f6',
          400: '#0ea5e9',
        },
        glass: {
          bg: 'rgba(59,130,246,0.08)',
          border: 'rgba(59,130,246,0.15)',
        },
        'slate-secondary': '#64748b',
        'slate-accent': '#93c5fd',
      },
    },
  },
  plugins: [],
};
