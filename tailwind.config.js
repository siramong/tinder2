/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#8B5CF6',
          dark: '#7C3AED',
          light: '#A78BFA',
        },
        like: '#10B981',
        dislike: '#EF4444',
        superlike: '#3B82F6',
        card: '#F9FAFB',
        'card-dark': '#374151',
      },
    },
  },
  plugins: [],
}

