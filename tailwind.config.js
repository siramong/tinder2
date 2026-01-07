/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./src/**/*", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
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