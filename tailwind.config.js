/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        void: {
          900: '#050510',
          800: '#0a0a1f',
          700: '#0f1030',
        },
        cosmos: {
          glow: '#8b5cf6',
          cyan: '#22d3ee',
          amber: '#f59e0b',
          rose: '#fb7185',
        },
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '0.2' },
          '50%': { opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
      },
      animation: {
        twinkle: 'twinkle 4s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
