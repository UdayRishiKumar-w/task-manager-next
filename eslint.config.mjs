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
    "src/graphql/generated/**",
  ]),
  // https://the-guild.dev/graphql/eslint/docs/usage/graphql
  {
    files: ["**/*.graphql", "**/*.gql"],
    languageOptions: {
      parser: graphqlPlugin.parser,
      parserOptions: {
        graphQLConfig: {
          schema: "src/graphql/schema.graphql",
        },
      },
    },
    plugins: {
      "@graphql-eslint": graphqlPlugin,
    },
    rules: {
      ...graphqlPlugin.configs["flat/schema-all"].rules,
    },
  },

  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@graphql-eslint": graphqlPlugin,
    },
    processor: graphqlPlugin.processor,
  },
]);

export default eslintConfig;
