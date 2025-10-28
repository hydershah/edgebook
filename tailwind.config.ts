import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4A9B7F',
          dark: '#3D8266',
          light: '#5FB194',
        },
        background: '#F5F5F5',
      },
    },
  },
  plugins: [],
}
export default config
