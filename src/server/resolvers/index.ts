import { taskResolvers } from "@/server/resolvers/task.resolver";
import { userResolvers } from "@/server/resolvers/user.resolver";

export const resolvers = {
  Query: {
    ...taskResolvers.Query,
    ...userResolvers.Query,
  },
  Mutation: {
    ...taskResolvers.Mutation,
  },
  Task: taskResolvers.Task,
  User: userResolvers.User,
  DateTime: taskResolvers.DateTime,
};
