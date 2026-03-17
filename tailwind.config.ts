import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sand: '#f6f1e8',
        ink: '#1f2a2f',
        mist: '#eef4f3',
        pine: '#24413f',
        clay: '#d4c2ad',
        gold: '#caa764',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Fraunces"', 'serif'],
      },
      boxShadow: {
        calm: '0 24px 80px rgba(31, 42, 47, 0.12)',
      },
      backgroundImage: {
        glow:
          'radial-gradient(circle at top left, rgba(202, 167, 100, 0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(36, 65, 63, 0.14), transparent 30%)',
      },
    },
  },
  plugins: [],
} satisfies Config
