import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "@/lib/errors";
import { Task, type TaskResolverParent } from "@/models/Task";
import { User, type UserResolverParent } from "@/models/User";
import type { Resolvers } from "@/server/generated/server";

function requireUserId(ctx: GraphQLContext): string {
  if (!ctx.userId) throw new GraphQLError("Unauthorized");
  return ctx.userId;
}

function userId(user: UserResolverParent): string {
  return user.id ?? user._id.toString();
}

export const userResolvers = {
  Query: {
    me: async (_parent, _args, ctx) => {
      const id = requireUserId(ctx);

      return User.findById(id).select("_id name email").lean<UserResolverParent>({ virtuals: true });
    },
  },
  User: {
    tasks: (parent, _args, ctx) => {
      const currentUserId = requireUserId(ctx);
      const parentId = userId(parent);
      if (parentId !== currentUserId) throw new GraphQLError("Unauthorized");

      return Task.find({ userId: parentId }).sort({ createdAt: -1 }).lean<TaskResolverParent[]>({ virtuals: true });
    },
    id: (user) => userId(user),
  },
} satisfies Pick<Resolvers, "Query" | "User">;
