import type { GraphQLContext } from "@/graphql/context";
import { Task } from "@/models/Task";
import type { UserDocument } from "@/models/User";
import { GraphQLError } from "graphql";

export const userResolvers = {
  User: {
    tasks: (parent: { id: string }, _: unknown, ctx: GraphQLContext) => {
      if (!ctx.userId || parent.id !== ctx.userId) throw new GraphQLError("Unauthorized");
      return Task.find({ userId: parent.id }, {}, { virtuals: true, lean: true }).sort({ createdAt: -1 });
    },
    id: (user: UserDocument) => user.id ?? user._id.toString(),
  },
};
