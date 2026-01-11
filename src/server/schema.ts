import { readFileSync } from "node:fs";
import path from "node:path";

export const typeDefs = readFileSync(path.join(process.cwd(), "src/graphql/schema.graphql"), "utf8");
