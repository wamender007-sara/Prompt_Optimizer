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
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        vibgyor: {
          violet: '#8B5CF6',
          indigo: '#6366F1',
          blue: '#3B82F6',
          green: '#10B981',
          yellow: '#EAB308',
          orange: '#F97316',
          red: '#EF4444',
          // Light tints
          'violet-light': '#F5F3FF',
          'indigo-light': '#EEF2FF',
          'blue-light': '#EFF6FF',
          'green-light': '#ECFDF5',
          'yellow-light': '#FEFCE8',
          'orange-light': '#FFF7ED',
          'red-light': '#FEF2F2',
        },
        cyber: {
          dark: '#0B0F19',
          card: '#111827',
          border: '#1F2937',
          accent: '#38BDF8',
          purple: '#8B5CF6',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
