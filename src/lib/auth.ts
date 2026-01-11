import { connectDB } from "@/lib/dbConnect";
import clientPromise from "@/lib/mongodb-client";
import { User } from "@/models/User";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { compare, hash } from "bcryptjs";
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import GithubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.AUTH_SECRET!,
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        await connectDB();

        const { email, password, name } = credentials as { email: string; password: string; name?: string };

        const existing = await User.findOne({ email }).exec();

        if (name) {
          // Signup flow: name present -> create new user
          const hashedPassword = await hash(password, 10);
          if (existing) {
            if (existing.password) {
              throw new Error("User already exists");
            } else {
              existing.password = hashedPassword;
              await existing.save();
              return {
                id: existing._id.toString(),
                email: existing.email,
                name: existing.name,
              };
            }
          }

          const user = await User.create({ email, name, password: hashedPassword });
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        }

        // Signin flow: name not provided -> authenticate with email+password
        if (!existing) {
          throw new Error("Invalid email or password");
        }

        if (!existing.password) {
          throw new Error("Account exists but no password is set. Please sign up or reset your password.");
        }

        const isValid = await compare(password, existing.password);
        if (!isValid) {
          throw new Error("Invalid email or password");
        }

        return {
          id: existing._id.toString(),
          email: existing.email,
          name: existing.name,
        };
      },
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    async jwt({ token, user, account, profile }): Promise<JWT> {
      // Credentials provider
      if (user?.id) {
        token.id = user.id;
        return token;
      }

      // handle GitHub OAuth
      if (account?.provider !== "github" || !profile) return token;

      try {
        await connectDB();

        const { id: providerId, email, login, name, avatar_url } = profile as any;

        const resolvedEmail = email ?? (login ? `${login}@github.com` : undefined);

        let dbUser =
          (providerId && (await User.findOne({ authProviderId: String(providerId) }))) ||
          (resolvedEmail && (await User.findOne({ email: resolvedEmail })));

        if (!dbUser) {
          dbUser = await User.create({
            name: name ?? login ?? "GitHub User",
            email: resolvedEmail,
            image: avatar_url,
            authProviderId: String(providerId),
            password: "",
          });
        } else if (!dbUser.authProviderId) {
          dbUser.authProviderId = String(providerId);
          await dbUser.save();
        }

        token.id = dbUser._id.toString();
      } catch (err) {
        console.error("JWT GitHub error:", err);
        throw new Error("Authentication failed. Please try again.");
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};
