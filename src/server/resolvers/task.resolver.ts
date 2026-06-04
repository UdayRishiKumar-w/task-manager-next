import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "@/lib/errors";
import type { TaskResolverParent, TaskSchemaType } from "@/models/Task";
import { Task } from "@/models/Task";
import type { Resolvers } from "@/server/generated/server";
import { GraphQLScalarType, Kind } from "graphql";
import { Types } from "mongoose";

function requireUserId(ctx: GraphQLContext): string {
  if (!ctx.userId) throw new GraphQLError("Unauthorized");
  return ctx.userId;
}

function taskId(task: TaskResolverParent): string {
  return task.id ?? task._id.toString();
}

function taskCreatedAt(task: TaskResolverParent): Date {
  return task.createdAt ?? new Date(0);
}

export const taskResolvers = {
  DateTime: new GraphQLScalarType({
    name: "DateTime",
    description: "DateTime scalar",
    parseValue(value) {
      const date = new Date(value as string | number | Date);
      if (Number.isNaN(date.getTime())) {
        throw new TypeError("Invalid date value");
      }
      return date;
    },
    serialize(value: unknown): string {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "string" || typeof value === "number") {
        return new Date(value).toISOString();
      }
      throw new TypeError("Date cannot be serialized");
    },
    parseLiteral(ast): Date | null {
      if (ast.kind === Kind.STRING || ast.kind === Kind.INT) {
        return new Date(ast.value);
      }
      return null;
    },
  }),
  Query: {
    getTasks: async (_parent, _args, ctx) => {
      const userId = requireUserId(ctx);

      return Task.find({ userId })
        .sort({
          createdAt: -1,
        })
        .lean<TaskResolverParent[]>({ virtuals: true });
    },
    getTask: async (_parent, { id }, ctx) => {
      const userId = requireUserId(ctx);

      return Task.findOne({ _id: id, userId }, {}, { virtuals: true }).lean<TaskResolverParent>();
    },

    tasksPaginated: async (_parent, { limit, offset, filter }, ctx) => {
      const userId = requireUserId(ctx);

      const query: Partial<Pick<TaskSchemaType, "completed" | "priority">> & { userId: string } = {
        userId,
      };

      if (filter?.completed !== undefined && filter.completed !== null) {
        query.completed = filter.completed;
      }
      if (filter?.priority !== undefined && filter.priority !== null) {
        query.priority = filter.priority;
      }

      const [items, totalCount] = await Promise.all([
        Task.find(query).skip(offset).limit(limit).sort({ createdAt: -1 }).lean<TaskResolverParent[]>({
          virtuals: true,
        }),
        Task.countDocuments(query),
      ]);

      return { items, totalCount };
    },
  },

  Mutation: {
    createTask: async (_parent, { input }, ctx) => {
      const userId = requireUserId(ctx);

      const payload: Partial<TaskSchemaType> & { dueDate?: Date } = {
        title: input.title,
        priority: input.priority,
        userId: new Types.ObjectId(userId),
      };

      if (input.description !== undefined) {
        payload.description = input.description ?? null;
      }
      if (input.dueDate !== undefined && input.dueDate !== null) {
        payload.dueDate = input.dueDate;
      }
      if (input.completed !== undefined && input.completed !== null) {
        payload.completed = input.completed;
      }
      if (input.started !== undefined && input.started !== null) {
        payload.started = input.started;
      }

      return Task.create(payload);
    },
    updateTask: async (_parent, { input }, ctx) => {
      const userId = requireUserId(ctx);

      const update: Partial<TaskSchemaType> & { dueDate?: Date } = {};
      if (input.title !== undefined && input.title !== null) update.title = input.title;
      if (input.completed !== undefined && input.completed !== null) update.completed = input.completed;
      if (input.started !== undefined && input.started !== null) update.started = input.started;
      if (input.description !== undefined) update.description = input.description;
      if (input.priority !== undefined && input.priority !== null) update.priority = input.priority;
      if (input.dueDate !== undefined && input.dueDate !== null) {
        update.dueDate = input.dueDate;
      }

      const updated = await Task.findOneAndUpdate({ _id: input.id, userId }, update, {
        new: true,
      }).lean<TaskResolverParent>({
        virtuals: true,
      });

      if (!updated) throw new GraphQLError("Task not found");

      return updated;
    },
    deleteTask: async (_parent, { id }, ctx) => {
      const userId = requireUserId(ctx);

      const res = await Task.findOneAndDelete({ _id: id, userId }).lean();
      return !!res;
    },
    toggleTaskCompleted: async (_parent, { id }, ctx) => {
      const userId = requireUserId(ctx);

      const task = await Task.findOne({ _id: id, userId });
      if (!task) throw new GraphQLError("Task not found");

      task.completed = !task.completed;
      // Update task to started when task is marked as completed
      if (task.completed && !task.started) {
        task.started = true;
      }

      await task.save();

      return task;
    },
    toggleTaskStarted: async (_parent, { id }, ctx) => {
      const userId = requireUserId(ctx);

      const task = await Task.findOne({ _id: id, userId });
      if (!task) throw new GraphQLError("Task not found");
      if (task.completed) throw new GraphQLError("Cannot change started status of a completed task");

      task.started = !task.started;
      await task.save();

      return task;
    },
  },

  Task: {
    user: (parent, _args, ctx) => ctx.loaders.user.load(parent.userId.toString()),
    id: (task) => taskId(task),
    createdAt: (task) => taskCreatedAt(task),
  },
} satisfies Pick<Resolvers, "DateTime" | "Mutation" | "Query" | "Task">;
