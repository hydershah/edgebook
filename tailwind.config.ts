import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      fontFamily: {
        sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Primary Brand Colors
        primary: {
          DEFAULT: '#206344',
          dark: '#1a4f35',
          light: '#2a7a56',
        },
        brand: {
          green: '#206344',
        },
        // Grayscale Colors from Brand Guidelines
        gray: {
          cloud: '#EDEFF7',
          smoke: '#D3D6E0',
          steel: '#BCBFCC',
          space: '#9DA2B3',
          graphite: '#6E7180',
          arsenic: '#40424D',
          phantom: '#1E1E24',
        },
        background: '#F5F5F5',
      },
      fontSize: {
        // Typography Scaling from Brand Guidelines
        'heading-1': ['64px', { lineHeight: '1.2', fontWeight: '700' }],
        'heading-2': ['48px', { lineHeight: '1.2', fontWeight: '700' }],
        'subheader-1': ['32px', { lineHeight: '1.3', fontWeight: '600' }],
        'subheader-2': ['24px', { lineHeight: '1.4', fontWeight: '600' }],
        'paragraph-1': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'paragraph-2': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
      },
      animation: {
        'in': 'in 0.2s ease-out',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        in: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
