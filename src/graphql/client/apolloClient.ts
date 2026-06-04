import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

let client: ApolloClient | null = null;

export function getApolloClient() {
  if (globalThis.window === undefined) {
    return createApolloClient();
  }

  client ??= createApolloClient();

  return client;
}

function createApolloClient() {
  return new ApolloClient({
    ssrMode: globalThis.window === undefined,
    link: new HttpLink({
      uri: "/api/graphql",
      credentials: "same-origin",
    }),
    cache: new InMemoryCache({
      typePolicies: {
        Task: {
          keyFields: ["id"],
          fields: {
            user: {
              merge(existing: unknown, incoming: unknown) {
                return incoming ?? existing;
              },
            },
          },
        },
        User: {
          keyFields: ["id"],
        },
      },
    }),
  });
}
