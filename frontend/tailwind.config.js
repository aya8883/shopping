/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          dark: 'var(--color-brand-dark)',
          light: 'var(--color-brand-light)',
          muted: 'var(--color-brand-muted)',
        },
        savings: 'var(--color-savings)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"IBM Plex Sans Arabic"', '"IBM Plex Sans"', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        app: '28rem',
        desktop: '72rem',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
