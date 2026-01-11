import type { CreateTaskInput } from "@/gql/graphql";
import type { GraphQLContext } from "@/graphql/context";
import { GraphQLError } from "@/lib/errors";
import type { TaskDocument, TaskSchemaType } from "@/models/Task";
import { Task } from "@/models/Task";
import { GraphQLScalarType, Kind } from "graphql";
import { Types } from "mongoose";

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
    getTasks: async (_: unknown, __: unknown, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new GraphQLError("Unauthorized");
      const tasks = await Task.find({ userId: ctx.userId })
        .sort({
          createdAt: -1,
        })
        .lean();
      const count = tasks?.length;
      console.info("Fetched tasks for user:", ctx.userId, "count:", count);

      return tasks;
    },
    getTask: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new GraphQLError("Unauthorized");

      return await Task.findOne({ _id: id, userId: ctx.userId }, {}, { virtuals: true }).lean();
    },

    tasksPaginated: async (
      _: unknown,
      {
        limit,
        offset,
        filter,
      }: {
        limit: number;
        offset: number;
        filter?: { completed?: boolean; priority?: string };
      },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.userId) throw new GraphQLError("Unauthorized");

      const query = {
        userId: ctx.userId,
        ...(filter?.completed !== undefined && { completed: filter.completed }),
        ...(filter?.priority !== undefined && { priority: filter.priority }),
      };

      const [items, totalCount] = await Promise.all([
        Task.find(query).skip(offset).limit(limit).sort({ createdAt: -1 }).lean({ virtuals: true }),
        Task.countDocuments(query),
      ]);

      return { items, totalCount };
    },
  },

  Mutation: {
    createTask: async (_: unknown, { input }: { input: CreateTaskInput }, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new GraphQLError("Unauthorized");

      const payload: Partial<TaskSchemaType> & { dueDate?: Date } = {
        title: input.title,
        priority: input.priority,
        userId: new Types.ObjectId(ctx.userId),
      };

      if (input.description !== undefined) {
        payload.description = input.description ?? null;
      }
      if (input.dueDate !== undefined && input.dueDate !== null) {
        const d = input.dueDate as unknown;
        payload.dueDate = d instanceof Date ? d : new Date(d as string | number);
      }
      if (input.completed !== undefined && input.completed !== null) {
        payload.completed = input.completed;
      }
      if (input.started !== undefined && input.started !== null) {
        payload.started = input.started;
      }

      return Task.create(payload);
    },
    updateTask: async (
      _: unknown,
      {
        input,
      }: {
        input: {
          id: string;
          title?: string;
          completed?: boolean;
          description?: string;
          priority?: string;
          dueDate?: string;
          started?: boolean;
        };
      },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.userId) throw new GraphQLError("Unauthorized");

      const update: Partial<TaskSchemaType> & { dueDate?: Date } = {};
      if (input.title !== undefined) update.title = input.title;
      if (input.completed !== undefined) update.completed = input.completed;
      if (input.started !== undefined) update.started = input.started;
      if (input.description !== undefined) update.description = input.description;
      if (input.priority !== undefined) update.priority = input.priority as TaskSchemaType["priority"];
      if (input.dueDate !== undefined && input.dueDate !== null) {
        const d = input.dueDate as unknown;
        update.dueDate = d instanceof Date ? d : new Date(d as string | number);
      }

      const updated = await Task.findOneAndUpdate({ _id: input.id, userId: ctx.userId }, update, { new: true }).lean({
        virtuals: true,
      });
      return updated;
    },
    deleteTask: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new GraphQLError("Unauthorized");

      const res = await Task.findOneAndDelete({ _id: id, userId: ctx.userId }).lean();
      return !!res;
    },
    toggleTask: async (_: unknown, { id }: { id: string }, ctx: GraphQLContext) => {
      if (!ctx.userId) throw new GraphQLError("Unauthorized");

      const task = await Task.findOne({
        _id: id,
        userId: ctx.userId,
      });

      if (!task) throw new GraphQLError("Task not found");

      task.completed = !task.completed;
      await task.save();

      return task;
    },
  },

  Task: {
    user: (parent: { userId: string }, _: unknown, ctx: GraphQLContext) =>
      ctx.loaders.user.load(parent?.userId?.toString()),
    id: (task: TaskDocument) => task.id ?? task._id.toString(),
  },
};
