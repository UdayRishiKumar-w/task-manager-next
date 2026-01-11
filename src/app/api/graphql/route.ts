import { createContext, type GraphQLContext } from "@/graphql/context";
import { connectDB } from "@/lib/dbConnect";
import { schema } from "@/server/schema-index";
import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginCacheControl } from "@apollo/server/plugin/cacheControl";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { type NextRequest } from "next/server";

const plugins = [ApolloServerPluginCacheControl({ defaultMaxAge: 10 })];

if (process.env.NODE_ENV !== "production") {
  plugins.push(ApolloServerPluginLandingPageLocalDefault({ embed: true, includeCookies: true }));
}

const server = new ApolloServer<GraphQLContext>({
  schema,
  csrfPrevention: true,
  introspection: process.env.NODE_ENV !== "production",
  includeStacktraceInErrorResponses: process.env.NODE_ENV !== "production",
  plugins,
});

// Cache the handler so `start()` is called only once.
let cachedHandler: ReturnType<typeof startServerAndCreateNextHandler> | undefined;

async function handler(req: NextRequest) {
  await connectDB();

  cachedHandler ??= startServerAndCreateNextHandler(server, {
    context: async (r: NextRequest) => createContext(r),
  });

  return cachedHandler(req);
}

export { handler as GET, handler as POST };
