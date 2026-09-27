/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#F7F3ED',
        surface: '#FFFFFF',
        sidebar: '#FAF7F2',
        border: '#EBE5DC',
        'border-subtle': '#F0EBE3',
        card: '#FFFFFF',
        'card-hover': '#FDFBF7',
        'warm-accent': '#E08035',
        'warm-badge': '#FBF0E4',
        'warm-badge-text': '#B45309',
        text: {
          main: '#18181B',
          secondary: '#71717A',
          muted: '#8E887F',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04), 0 2px 6px -1px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 12px -2px rgba(0, 0, 0, 0.03), 0 1px 4px -1px rgba(0, 0, 0, 0.02)',
        'hero': '0 12px 36px -4px rgba(180, 150, 120, 0.12), 0 4px 16px -2px rgba(0, 0, 0, 0.04)',
        'glow-warm': '0 0 30px 2px rgba(245, 158, 11, 0.15)',
      }
    },
  },
  plugins: [],
}
