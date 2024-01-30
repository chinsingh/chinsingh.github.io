/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*html"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "cs-blue":"#46a6ff",
        "cs-black":"#030303",
        "cs-dark-gray": "#2f2f2f",
        "cs-white":"#efefef",
        "cs-light-gray": "#636363"
      },
      fontFamily: {
        Signika : ["Signika Negative, sans-serif"],
        SanFran : ["San Fransisco, sans-serif"]       
      }
    },
  },
  plugins: [
    require("tailwindcss-animate")
  ],
}

