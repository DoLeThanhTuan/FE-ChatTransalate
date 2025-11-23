export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        border: 'var(--border-color)',
        text: 'var(--text-color)',
        background: 'var(--background-color)',
      },
    },
  },
  plugins: [],
}
