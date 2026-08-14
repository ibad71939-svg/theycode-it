/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#3452EB',
          dark: '#2538B8',
          tint: '#EBEEFF',
        },
        accent: {
          DEFAULT: '#F2A93B',
          dark: '#C97F16',
          tint: '#FDF1DD',
        },
        mint: {
          DEFAULT: '#0FA98A',
          dark: '#0B7C67',
          tint: '#E4F7F2',
        },
        ink: '#0B1220',
        muted: '#5C6478',
        surface: '#F7F7F5',
        line: '#0B1220',
        warn: '#C98A2E',
        danger: '#D14343',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        card: '10px',
        admin: '8px',
        editor: '10px',
      },
      boxShadow: {
        editor: '0 1px 2px rgba(11,18,32,0.04), 0 12px 32px -16px rgba(11,18,32,0.18)',
      },
    },
  },
  plugins: [],
}
