/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: "#2563eb",
          secondary: "#fbbf24",
          accent: "#10b981",
          neutral: "#f3f4f6",
          "base-100": "#f9fafb",
          info: "#38bdf8",
          success: "#22d3ee",
          warning: "#fde68a",
          error: "#fca5a5",
        },
        dark: "dark", // use default dark
      },
    ],
  },
}