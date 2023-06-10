/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      ringWidth: {
        DEFAULT: 'var(--rounded-token)',
      },
      borderRadius: {
        DEFAULT: 'var(--rounded-token)',
        'token': 'var(--rounded-token)',
      },
      colors: {
        'background': 'rgb(var(--background-token) / <alpha-value>)',
        'primary': 'rgb(var(--primary) / <alpha-value>)',
      }
    },
  },
  plugins: [],
}
