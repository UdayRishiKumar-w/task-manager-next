import graphqlPlugin from "@graphql-eslint/eslint-plugin";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";
import eslintJest from "eslint-plugin-jest";
import eslintJestDom from "eslint-plugin-jest-dom";
// import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPlaywright from "eslint-plugin-playwright";
import eslintPluginReactRedux from "eslint-plugin-react-redux";
import security from "eslint-plugin-security";
import sonarjs from "eslint-plugin-sonarjs";
import testingLibrary from "eslint-plugin-testing-library";
import unusedImports from "eslint-plugin-unused-imports";
import eslintPluginZod from "eslint-plugin-zod";
import { defineConfig, globalIgnores } from "eslint/config";
import tseslint from "typescript-eslint";

/** @type {import("eslint").Linter.Config} */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,

  eslintPluginZod.configs.recommended,

  ...tseslint.configs.recommendedTypeChecked,
  sonarjs.configs.recommended,
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
    "src/gql/**",
  ]),

  // Disable type-checked rules for JS/MJS files
  {
    files: ["**/*.js", "**/*.mjs"],
    extends: [tseslint.configs.disableTypeChecked],
  },

  {
    files: ["src/**/*.{ts,tsx}"],

    ...eslintPluginReactRedux.configs.recommended,

    plugins: {
      "unused-imports": unusedImports,
      security,
      "react-redux": eslintPluginReactRedux,
    },

    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },

    rules: {
      ...eslintPluginReactRedux.configs.recommended.rules,
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],

      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: { attributes: false } }],

      "security/detect-object-injection": "off",
      "sonarjs/cognitive-complexity": ["warn", 15],
      "sonarjs/no-commented-code": "warn",
      "sonarjs/prefer-read-only-props": "off",
      "sonarjs/different-types-comparison": "off",
      "sonarjs/no-nested-functions": ["warn", { threshold: 5 }],
    },
  },

  // Config files — disable type-checked rules
  {
    files: [
      "*.config.{ts,mts,cts,js,mjs,cjs}",
      "jest.setup.ts",
      "jest.config.ts",
      "commitlint.config.ts",
      "codegen.ts",
      "src/__mocks__/**/*.{ts,tsx}",
      "src/test-utils.tsx",
      "src/test-utils/**/*.ts",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
    ],
    extends: [tseslint.configs.disableTypeChecked],
    rules: {
      "sonarjs/no-commented-code": "off",
    },
  },

  // https://the-guild.dev/graphql/eslint/docs/usage/graphql
  // GraphQL schema lint
  {
    files: ["**/*.graphql", "**/*.gql"],
    extends: [tseslint.configs.disableTypeChecked],
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

      "@graphql-eslint/require-description": "off",
      "@graphql-eslint/no-root-type": "off",
      "@graphql-eslint/require-nullable-result-in-root": "off",
      "@graphql-eslint/require-field-of-type-query-in-mutation-result": "off",
      "@graphql-eslint/no-scalar-result-type-on-mutation": "off",
      "@graphql-eslint/input-name": "off",
      "@graphql-eslint/naming-convention": "off",
      "@graphql-eslint/strict-id-in-types": "off",
    },
  },

  // GraphQL operations
  {
    files: ["**/*.{ts,tsx,js,jsx}"],
    plugins: {
      "@graphql-eslint": graphqlPlugin,
    },
    processor: graphqlPlugin.processor,
  },

  // Jest + Testing Library
  {
    files: ["**/*.test.{ts,tsx}", "tests/**/*.{ts,tsx}", "src/__mocks__/**/*.{ts,tsx}"],

    plugins: {
      jest: eslintJest,
      "testing-library": testingLibrary,
      "jest-dom": eslintJestDom,
    },

    languageOptions: {
      globals: {
        ...eslintJest.environments.globals.globals,
      },
    },

    rules: {
      ...eslintJest.configs["flat/recommended"].rules,
      ...testingLibrary.configs["flat/react"].rules,
      ...eslintJestDom.configs["flat/recommended"].rules,
    },
  },

  // Playwright e2e
  {
    files: ["e2e/**/*.ts", "playwright.config.ts"],

    ...eslintPluginPlaywright.configs["flat/recommended"],

    plugins: {
      playwright: eslintPluginPlaywright,
    },

    languageOptions: {
      parser: tseslint.parser,
    },

    rules: {
      ...eslintPluginPlaywright.configs["flat/recommended"].rules,
    },
  },
]);

export default eslintConfig;
