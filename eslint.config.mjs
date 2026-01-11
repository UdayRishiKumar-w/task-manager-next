import graphqlPlugin from "@graphql-eslint/eslint-plugin";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import { defineConfig, globalIgnores } from "eslint/config";

/** @type {import("eslint").Linter.Config} */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/server/generated/**",
    "coverage/**",
  ]),
  {
    files: ["**/*.graphql", "**/*.gql"],
    plugins: {
      "@graphql-eslint": graphqlPlugin,
    },
    processor: graphqlPlugin.processor,
    rules: {
      ...graphqlPlugin.configs.recommended.rules,
    },
  },
]);

export default eslintConfig;
