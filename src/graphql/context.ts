import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/dbConnect";
import { createUserLoader } from "@/server/loaders/userLoader";
import { getServerSession } from "next-auth";

export async function createContext() {
  await connectDB();

  const session = await getServerSession(authOptions);

  return {
    session,
    userId: session?.user?.id ?? null,
    loaders: {
      user: createUserLoader(),
    },
  };
}

export type GraphQLContext = Awaited<ReturnType<typeof createContext>>;
