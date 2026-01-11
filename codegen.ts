import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/schema.graphql",

  documents: [
    "src/graphql/client/**/*.graphql",
    "src/**/*.tsx",
    "!src/gql/**/*",
    "!src/graphql/client/generated/**/*",
    "!src/server/generated/**/*",
  ],

  generates: {
    // Server Types
    "src/server/generated/server.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        contextType: "@/graphql/context#GraphQLContext",
        useTypeImports: true,
        useUnknownInIndexSignature: true,
        useIndexSignature: false,
        scalars: {
          DateTime: "Date",
          EmailAddress: "string",
        },
        mappers: {
          User: "@/models/User#UserDocument",
          Task: "@/models/Task#TaskDocument",
        },
      },
    },

    // Client Types
    "src/gql/": {
      preset: "client",
      // plugins: ["typescript", "typescript-operations"],
      presetConfig: {
        gqlTagName: "gql",
        exposeDocument: true,
        persistedDocuments: true,
        // fragmentMasking: false,
        fragmentMasking: { unmaskFunctionName: "getFragmentData" },
      },
      config: {
        scalars: {
          DateTime: "Date",
          EmailAddress: "string",
        },
      },
    },

    // export schema as SDL
    "src/graphql/generated/schema.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
        includeIntrospectionTypes: true,
      },
    },
  },

  ignoreNoDocuments: true,

  hooks: { afterOneFileWrite: ["prettier --write"] }, // , "eslint --fix"
};

export default config;
