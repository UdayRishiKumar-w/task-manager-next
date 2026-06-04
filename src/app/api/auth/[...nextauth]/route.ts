import { authOptions } from "@/lib/auth";
import NextAuth from "next-auth";

type NextAuthRouteHandler = (request: Request, context?: Record<string, unknown>) => Response | Promise<Response>;

const handler = NextAuth(authOptions) as NextAuthRouteHandler;

export { handler as GET, handler as POST };
