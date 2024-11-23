module.exports = {
  plugins: [
    require('postcss-import'), // If you're using `@import` in CSS
    require('postcss-nested'), // Add this plugin to handle nested CSS
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};
