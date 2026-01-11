/** @type {import('stylelint').Config} */
const stylelintConfig = {
  extends: ["stylelint-config-standard", "stylelint-config-tailwindcss", "stylelint-prettier/recommended"],
  overrides: [
    {
      files: ["**/*.{jsx,tsx,html}"],
      customSyntax: "postcss-html", // enables JSX/TSX parsing
    },
  ],
  plugins: ["stylelint-high-performance-animation"],
  rules: {
    "plugin/no-low-performance-animation-properties": true,
    "custom-property-pattern": null,
    "number-max-precision": null,
    "selector-class-pattern": null,
  },
  ignoreFiles: [
    "/node_modules/**",
    "/dist/**",
    "/.next/**",
    "/dev-dist/**",
    "**/*.js",
    "**/*.ts",
    "/coverage/**",
    "/playwright-report/**",
    "/test-results/**",
  ],
};

export default stylelintConfig;
