/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
  theme: {
    extend: {
      containers: {
        xs: "30rem",    
        sm: "40rem",    
        md: "48rem",    
        lg: "64rem",    
        xl: "80rem",    
        "2xl": "96rem", 
        "3xl": "120rem", 
        "4xl": "160rem", 
        "5xl": "240rem", 
      },
      screens: {
        xs: '30rem'
      }
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
};
