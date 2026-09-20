/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: {
            DEFAULT: '#1a3a6b',
            50: '#f0f4f9',
            100: '#dce5f2',
            200: '#bccde5',
            300: '#94afd3',
            400: '#648cbd',
            500: '#426fa7',
            600: '#2d558d',
            700: '#1a3a6b', // primary government navy
            800: '#173059',
            900: '#15294a',
            950: '#0d192f'
          },
          saffron: {
            DEFAULT: '#ff9933',
            50: '#fff7ed',
            100: '#ffedd5',
            200: '#fed7aa',
            300: '#fdba74',
            400: '#fb923c',
            500: '#ff9933', // official saffron accent
            600: '#ea580c',
            700: '#c2410c'
          },
          green: {
            DEFAULT: '#138808',
            50: '#f0fdf4',
            100: '#dcfce7',
            200: '#bbf7d0',
            300: '#86efac',
            400: '#4ade80',
            500: '#138808', // Indian green success
            600: '#0f6e06',
            700: '#15803d'
          },
          teal: {
            DEFAULT: '#2fa58a',
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2fa58a', // ParivarSathi identity accent
            500: '#14b8a6',
            600: '#0d9488'
          },
          surface: '#f5f7fa',
          card: '#ffffff',
          text: '#1f2937',
          muted: '#4b5563',
          border: '#d9dee7',
        }
      },
      fontFamily: {
        sans: ['Noto Sans', 'Noto Sans Gujarati', 'Inter', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'Courier New', 'monospace'],
        gujarati: ['Noto Sans Gujarati', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      boxShadow: {
        'gov-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'gov': '0 1px 3px 0 rgba(0, 0, 0, 0.08), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
        'gov-md': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.08)',
        'gov-card': '0 1px 3px rgba(0, 0, 0, 0.05), 0 0 0 1px #d9dee7',
      }
    },
  },
  plugins: [],
}
