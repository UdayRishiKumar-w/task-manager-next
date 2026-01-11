import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";

export const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});
