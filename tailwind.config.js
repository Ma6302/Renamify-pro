/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",        // <--- 扫描根目录下的 tsx 文件
    "./components/**/*.{js,ts,jsx,tsx}" // <--- 扫描 components 文件夹
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
}