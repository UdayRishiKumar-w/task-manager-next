/** @type {import('stylelint').Config} */
const stylelintConfig = {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss", "stylelint-prettier/recommended"],
  overrides: [
    {
      files: ["**/*.{mjs,mts,js,ts,jsx,tsx,html}"],
      customSyntax: "postcss-html", // enables JSX/TSX parsing
    },
  ],
  plugins: ["stylelint-high-performance-animation"],
  rules: {},
  ignoreFiles: ["**/node_modules/**", "**/.next/**", "**/coverage/**", "**/playwright-report/**", "**/test-results/**"],
};

export default stylelintConfig;
