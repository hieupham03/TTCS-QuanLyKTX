/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "background": "#f8f9fa",
        "surface-variant": "#e1e3e4",
        "on-error": "#ffffff",
        "error": "#ba1a1a",
        "inverse-on-surface": "#f0f1f2",
        "on-tertiary-fixed-variant": "#7f2b00",
        "on-surface": "#191c1d",
        "outline-variant": "#c2c6d8",
        "surface-dim": "#d9dadb",
        "secondary-container": "#a0baff",
        "on-secondary-fixed-variant": "#294481",
        "on-primary-fixed-variant": "#00419e",
        "on-primary-fixed": "#001946",
        "error-container": "#ffdad6",
        "inverse-primary": "#b1c5ff",
        "surface-container-high": "#e7e8e9",
        "secondary-fixed-dim": "#b1c5ff",
        "tertiary-fixed-dim": "#ffb599",
        "surface-container-lowest": "#ffffff",
        "surface": "#f8f9fa",
        "on-secondary-fixed": "#001946",
        "on-primary": "#ffffff",
        "surface-bright": "#f8f9fa",
        "primary-container": "#0d6efd",
        "primary-fixed": "#dae2ff",
        "on-secondary-container": "#2e4986",
        "primary": "#0057cd",
        "tertiary": "#a63b00",
        "inverse-surface": "#2e3132",
        "tertiary-container": "#cf4b00",
        "on-primary-container": "#ffffff",
        "on-background": "#191c1d",
        "on-tertiary": "#ffffff",
        "surface-container-highest": "#e1e3e4",
        "surface-container-low": "#f3f4f5",
        "outline": "#727787",
        "on-error-container": "#93000a",
        "secondary-fixed": "#dae2ff",
        "tertiary-fixed": "#ffdbce",
        "surface-container": "#edeeef",
        "surface-tint": "#0057ce",
        "on-surface-variant": "#424655",
        "on-secondary": "#ffffff",
        "secondary": "#425c9b",
        "on-tertiary-fixed": "#370e00",
        "on-tertiary-container": "#ffffff",
        "primary-fixed-dim": "#b1c5ff"
      },
      fontFamily: {
        "headline": ["Inter"],
        "body": ["Inter"],
        "label": ["Inter"]
      },
      animation: {
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
      },
      keyframes: {
        shake: {
          '10%, 90%': { transform: 'translate3d(-1px, 0, 0)' },
          '20%, 80%': { transform: 'translate3d(2px, 0, 0)' },
          '30%, 50%, 70%': { transform: 'translate3d(-4px, 0, 0)' },
          '40%, 60%': { transform: 'translate3d(4px, 0, 0)' },
        }
      }
    },
  },
  plugins: [],
}
