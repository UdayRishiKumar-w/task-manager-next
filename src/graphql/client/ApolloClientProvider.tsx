"use client";

import { ApolloProvider } from "@apollo/client/react";
import { SessionProvider } from "next-auth/react";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { getApolloClient } from "./apolloClient";

export default function ApolloClientProvider({ children }: Readonly<PropsWithChildren>) {
  const apolloClient = useMemo(() => getApolloClient(), []);
  return (
    <SessionProvider>
      <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
    </SessionProvider>
  );
}
