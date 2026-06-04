import {
  createMockAuthenticatedContext,
  createMockGraphQLContext,
  createMockTaskDocument,
  mockMongooseModel,
  mockMongooseQuery,
} from "@tests/test-utils/backend";
import { Kind } from "graphql";

jest.mock("mongoose", () => {
  const mockObjectId = jest.fn().mockImplementation((id?: string) => ({
    toString: () => id || "507f1f77bcf86cd799439011",
  }));

  const SchemaConstructor = jest.fn().mockImplementation(() => {
    const schema = {
      pre: jest.fn().mockReturnThis(),
      index: jest.fn().mockReturnThis(),
      virtual: jest.fn().mockReturnValue({ get: jest.fn() }),
      plugin: jest.fn().mockReturnThis(),
    };
    return schema;
  });

  (SchemaConstructor as unknown as { Types: { ObjectId: jest.Mock } }).Types = { ObjectId: mockObjectId };

  return {
    Schema: SchemaConstructor,
    model: jest.fn(),
    models: {},
    Types: {
      ObjectId: mockObjectId,
    },
  };
});

jest.mock("@/models/Task", () => ({
  Task: {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
  },
}));

import { Task } from "@/models/Task";
import { taskResolvers } from "@/server/resolvers/task.resolver";

const mockTask = mockMongooseModel();

describe("Task Query Resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Task.find as jest.Mock) = mockTask.find;
    (Task.findOne as jest.Mock) = mockTask.findOne;
    (Task.findOneAndUpdate as jest.Mock) = mockTask.findOneAndUpdate;
    (Task.findOneAndDelete as jest.Mock) = mockTask.findOneAndDelete;
    (Task.create as jest.Mock) = mockTask.create;
    (Task.countDocuments as jest.Mock) = mockTask.countDocuments;
  });

  describe("getTasks", () => {
    it("returns all tasks for authenticated user sorted by createdAt desc", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTasks = [
        createMockTaskDocument({ id: "1", title: "Task 1", userId: "user-1" }),
        createMockTaskDocument({ id: "2", title: "Task 2", userId: "user-1" }),
      ];

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(mockTasks);
      mockTask.find.mockReturnValue(mockQuery);

      const result = await taskResolvers.Query.getTasks({}, {}, ctx);

      expect(mockTask.find).toHaveBeenCalledWith({ userId: "user-1" });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(result).toEqual(mockTasks);
    });

    it("returns empty array when user has no tasks", async () => {
      const ctx = createMockAuthenticatedContext("user-1");

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue([]);
      mockTask.find.mockReturnValue(mockQuery);

      const result = await taskResolvers.Query.getTasks({}, {}, ctx);

      expect(result).toEqual([]);
    });

    it("throws Unauthorized error when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();

      await expect(taskResolvers.Query.getTasks({}, {}, ctx)).rejects.toThrow("Unauthorized");
      expect(mockTask.find).not.toHaveBeenCalled();
    });
  });

  describe("getTask", () => {
    it("returns a single task by id for authenticated user", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTaskDoc = createMockTaskDocument({ id: "task-1", title: "My Task", userId: "user-1" });

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(mockTaskDoc);
      mockTask.findOne.mockReturnValue(mockQuery);

      const result = await taskResolvers.Query.getTask({}, { id: "task-1" }, ctx);

      expect(mockTask.findOne).toHaveBeenCalledWith({ _id: "task-1", userId: "user-1" }, {}, { virtuals: true });
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(result).toEqual(mockTaskDoc);
    });

    it("returns null when task not found", async () => {
      const ctx = createMockAuthenticatedContext("user-1");

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(null);
      mockTask.findOne.mockReturnValue(mockQuery);

      const result = await taskResolvers.Query.getTask({}, { id: "nonexistent" }, ctx);

      expect(result).toBeNull();
    });

    it("throws Unauthorized error when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();

      await expect(taskResolvers.Query.getTask({}, { id: "task-1" }, ctx)).rejects.toThrow("Unauthorized");
      expect(mockTask.findOne).not.toHaveBeenCalled();
    });
  });

  describe("tasksPaginated", () => {
    it("returns paginated tasks with total count", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTasks = [
        createMockTaskDocument({ id: "1", title: "Task 1" }),
        createMockTaskDocument({ id: "2", title: "Task 2" }),
      ];

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(mockTasks);
      mockTask.find.mockReturnValue(mockQuery);
      mockTask.countDocuments.mockResolvedValue(10);

      const result = await taskResolvers.Query.tasksPaginated({}, { limit: 2, offset: 0 }, ctx);

      expect(mockTask.find).toHaveBeenCalledWith({ userId: "user-1" });
      expect(mockQuery.skip).toHaveBeenCalledWith(0);
      expect(mockQuery.limit).toHaveBeenCalledWith(2);
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockTask.countDocuments).toHaveBeenCalledWith({ userId: "user-1" });
      expect(result).toEqual({ items: mockTasks, totalCount: 10 });
    });

    it("filters tasks by completed status", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTasks = [createMockTaskDocument({ id: "1", completed: true })];

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(mockTasks);
      mockTask.find.mockReturnValue(mockQuery);
      mockTask.countDocuments.mockResolvedValue(1);

      await taskResolvers.Query.tasksPaginated({}, { limit: 10, offset: 0, filter: { completed: true } }, ctx);

      expect(mockTask.find).toHaveBeenCalledWith({ userId: "user-1", completed: true });
      expect(mockTask.countDocuments).toHaveBeenCalledWith({ userId: "user-1", completed: true });
    });

    it("filters tasks by priority", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTasks = [createMockTaskDocument({ id: "1", priority: "HIGH" })];

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(mockTasks);
      mockTask.find.mockReturnValue(mockQuery);
      mockTask.countDocuments.mockResolvedValue(1);

      await taskResolvers.Query.tasksPaginated({}, { limit: 10, offset: 0, filter: { priority: "HIGH" } }, ctx);

      expect(mockTask.find).toHaveBeenCalledWith({ userId: "user-1", priority: "HIGH" });
      expect(mockTask.countDocuments).toHaveBeenCalledWith({ userId: "user-1", priority: "HIGH" });
    });

    it("throws Unauthorized error when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();

      await expect(taskResolvers.Query.tasksPaginated({}, { limit: 10, offset: 0 }, ctx)).rejects.toThrow(
        "Unauthorized",
      );
      expect(mockTask.find).not.toHaveBeenCalled();
    });
  });
});

describe("Task Mutation Resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (Task.find as jest.Mock) = mockTask.find;
    (Task.findOne as jest.Mock) = mockTask.findOne;
    (Task.findOneAndUpdate as jest.Mock) = mockTask.findOneAndUpdate;
    (Task.findOneAndDelete as jest.Mock) = mockTask.findOneAndDelete;
    (Task.create as jest.Mock) = mockTask.create;
    (Task.countDocuments as jest.Mock) = mockTask.countDocuments;
  });

  describe("createTask", () => {
    it("creates a task with required fields only", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const input = {
        title: "New Task",
        priority: "MEDIUM" as const,
      };
      const createdTask = createMockTaskDocument({ id: "new-1", title: "New Task", userId: "user-1" });

      mockTask.create.mockResolvedValue(createdTask);

      const result = await taskResolvers.Mutation.createTask({}, { input }, ctx);

      expect(mockTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Task",
          priority: "MEDIUM",
        }),
      );
      expect(result).toEqual(createdTask);
    });

    it("creates a task with all optional fields", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const input = {
        title: "Complete Task",
        priority: "HIGH" as const,
        description: "Task description",
        dueDate: new Date("2024-12-31"),
        completed: true,
        started: true,
      };
      const createdTask = createMockTaskDocument({
        id: "new-1",
        title: "Complete Task",
        description: "Task description",
        completed: true,
        started: true,
      });

      mockTask.create.mockResolvedValue(createdTask);

      const result = await taskResolvers.Mutation.createTask({}, { input }, ctx);

      expect(mockTask.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Complete Task",
          priority: "HIGH",
          description: "Task description",
          completed: true,
          started: true,
        }),
      );
      expect(result).toEqual(createdTask);
    });

    it("throws Unauthorized error when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();
      const input = {
        title: "New Task",
        priority: "MEDIUM" as const,
      };

      await expect(taskResolvers.Mutation.createTask({}, { input }, ctx)).rejects.toThrow("Unauthorized");
      expect(mockTask.create).not.toHaveBeenCalled();
    });
  });

  describe("updateTask", () => {
    it("updates task title", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const input = {
        id: "task-1",
        title: "Updated Title",
      };
      const updatedTask = createMockTaskDocument({ id: "task-1", title: "Updated Title" });

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(updatedTask);
      mockTask.findOneAndUpdate.mockReturnValue(mockQuery);

      const result = await taskResolvers.Mutation.updateTask({}, { input }, ctx);

      expect(mockTask.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: "task-1", userId: "user-1" },
        { title: "Updated Title" },
        { new: true },
      );
      expect(mockQuery.lean).toHaveBeenCalledWith({ virtuals: true });
      expect(result).toEqual(updatedTask);
    });

    it("throws when task is not found", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const input = {
        id: "nonexistent",
        title: "Updated Title",
      };

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(null);
      mockTask.findOneAndUpdate.mockReturnValue(mockQuery);

      await expect(taskResolvers.Mutation.updateTask({}, { input }, ctx)).rejects.toThrow("Task not found");
    });

    it("throws Unauthorized error when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();
      const input = {
        id: "task-1",
        title: "Updated Title",
      };

      await expect(taskResolvers.Mutation.updateTask({}, { input }, ctx)).rejects.toThrow("Unauthorized");
      expect(mockTask.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  describe("deleteTask", () => {
    it("deletes task and returns true", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const deletedTask = createMockTaskDocument({ id: "task-1" });

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(deletedTask);
      mockTask.findOneAndDelete.mockReturnValue(mockQuery);

      const result = await taskResolvers.Mutation.deleteTask({}, { id: "task-1" }, ctx);

      expect(mockTask.findOneAndDelete).toHaveBeenCalledWith({ _id: "task-1", userId: "user-1" });
      expect(mockQuery.lean).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("returns false when task not found", async () => {
      const ctx = createMockAuthenticatedContext("user-1");

      const mockQuery = mockMongooseQuery();
      mockQuery.exec.mockResolvedValue(null);
      mockTask.findOneAndDelete.mockReturnValue(mockQuery);

      const result = await taskResolvers.Mutation.deleteTask({}, { id: "nonexistent" }, ctx);

      expect(result).toBe(false);
    });

    it("throws Unauthorized error when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();

      await expect(taskResolvers.Mutation.deleteTask({}, { id: "task-1" }, ctx)).rejects.toThrow("Unauthorized");
      expect(mockTask.findOneAndDelete).not.toHaveBeenCalled();
    });
  });

  describe("toggleTaskCompleted", () => {
    it("toggles completed from false to true and sets started", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTaskDoc = {
        _id: "task-1",
        completed: false,
        started: false,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockTask.findOne.mockResolvedValue(mockTaskDoc);

      const result = await taskResolvers.Mutation.toggleTaskCompleted({}, { id: "task-1" }, ctx);

      expect(mockTask.findOne).toHaveBeenCalledWith({ _id: "task-1", userId: "user-1" });
      expect(mockTaskDoc.completed).toBe(true);
      expect(mockTaskDoc.started).toBe(true);
      expect(mockTaskDoc.save).toHaveBeenCalled();
      expect(result).toEqual(mockTaskDoc);
    });

    it("toggles completed from false to true without changing already-started status", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTaskDoc = {
        _id: "task-1",
        completed: false,
        started: true, // already started
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockTask.findOne.mockResolvedValue(mockTaskDoc);
      const result = await taskResolvers.Mutation.toggleTaskCompleted({}, { id: "task-1" }, ctx);

      expect(mockTaskDoc.completed).toBe(true);
      expect(mockTaskDoc.started).toBe(true); // should remain true
      expect(result).toEqual(mockTaskDoc);
    });

    it("toggles completed from true to false without changing started", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTaskDoc = {
        _id: "task-1",
        completed: true,
        started: true,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockTask.findOne.mockResolvedValue(mockTaskDoc);

      const result = await taskResolvers.Mutation.toggleTaskCompleted({}, { id: "task-1" }, ctx);

      expect(mockTaskDoc.completed).toBe(false);
      expect(mockTaskDoc.started).toBe(true);
      expect(result).toEqual(mockTaskDoc);
    });

    it("throws error when task not found", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      mockTask.findOne.mockResolvedValue(null);

      await expect(taskResolvers.Mutation.toggleTaskCompleted({}, { id: "nonexistent" }, ctx)).rejects.toThrow(
        "Task not found",
      );
    });

    it("throws Unauthorized when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();

      await expect(taskResolvers.Mutation.toggleTaskCompleted({}, { id: "task-1" }, ctx)).rejects.toThrow(
        "Unauthorized",
      );
      expect(mockTask.findOne).not.toHaveBeenCalled();
    });
  });

  describe("toggleTaskStarted", () => {
    it("toggles started from false to true", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTaskDoc = {
        _id: "task-1",
        started: false,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockTask.findOne.mockResolvedValue(mockTaskDoc);

      const result = await taskResolvers.Mutation.toggleTaskStarted({}, { id: "task-1" }, ctx);

      expect(mockTask.findOne).toHaveBeenCalledWith({ _id: "task-1", userId: "user-1" });
      expect(mockTaskDoc.started).toBe(true);
      expect(mockTaskDoc.save).toHaveBeenCalled();
      expect(result).toEqual(mockTaskDoc);
    });

    it("toggles started from true to false", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTaskDoc = {
        _id: "task-1",
        started: true,
        completed: false,
        save: jest.fn().mockResolvedValue(undefined),
      };

      mockTask.findOne.mockResolvedValue(mockTaskDoc);

      const result = await taskResolvers.Mutation.toggleTaskStarted({}, { id: "task-1" }, ctx);

      expect(mockTaskDoc.started).toBe(false);
      expect(mockTaskDoc.save).toHaveBeenCalled();
      expect(result).toEqual(mockTaskDoc);
    });

    it("throws error when task not found", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      mockTask.findOne.mockResolvedValue(null);

      await expect(taskResolvers.Mutation.toggleTaskStarted({}, { id: "nonexistent" }, ctx)).rejects.toThrow(
        "Task not found",
      );
    });

    it("throws Unauthorized when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();

      await expect(taskResolvers.Mutation.toggleTaskStarted({}, { id: "task-1" }, ctx)).rejects.toThrow("Unauthorized");
      expect(mockTask.findOne).not.toHaveBeenCalled();
    });

    it("throws error when task is completed", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const mockTaskDoc = { _id: "task-1", started: true, completed: true, save: jest.fn() };
      mockTask.findOne.mockResolvedValue(mockTaskDoc);

      await expect(taskResolvers.Mutation.toggleTaskStarted({}, { id: "task-1" }, ctx)).rejects.toThrow(
        "Cannot change started status of a completed task",
      );
      expect(mockTaskDoc.save).not.toHaveBeenCalled();
    });
  });
});

describe("Task Field Resolvers", () => {
  describe("Task.user", () => {
    it("loads user using dataloader", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const parent = createMockTaskDocument({ userId: "user-123" });

      await taskResolvers.Task.user(parent, {}, ctx);

      expect(ctx.loaders.user.load).toHaveBeenCalledWith("user-123");
    });
  });

  describe("Task.id", () => {
    it("returns id field when present", () => {
      const task = createMockTaskDocument({ id: "task-123" });

      const result = taskResolvers.Task.id(task as never);

      expect(result).toBe("task-123");
    });

    it("returns _id.toString() when id field is missing", () => {
      const task = {
        _id: {
          toString: () => "507f1f77bcf86cd799439011",
        },
      };

      const result = taskResolvers.Task.id(task as never);

      expect(result).toBe("507f1f77bcf86cd799439011");
    });
  });
});

describe("DateTime Scalar", () => {
  const dateTimeScalar = taskResolvers.DateTime;

  describe("parseValue", () => {
    it("parses ISO string to Date", () => {
      const result = dateTimeScalar.parseValue("2024-01-01T00:00:00.000Z");
      expect(result).toBeInstanceOf(Date);
      if (result instanceof Date) {
        expect(result.toISOString()).toBe("2024-01-01T00:00:00.000Z");
      }
    });

    it("throws TypeError for invalid date", () => {
      expect(() => dateTimeScalar.parseValue("invalid-date")).toThrow(TypeError);
      expect(() => dateTimeScalar.parseValue("invalid-date")).toThrow("Invalid date value");
    });
  });

  describe("serialize", () => {
    it("serializes Date to ISO string", () => {
      const date = new Date("2024-01-01T00:00:00.000Z");
      const result = dateTimeScalar.serialize(date);
      expect(result).toBe("2024-01-01T00:00:00.000Z");
    });

    it("throws TypeError for invalid value", () => {
      expect(() => dateTimeScalar.serialize({})).toThrow(TypeError);
      expect(() => dateTimeScalar.serialize({})).toThrow("Date cannot be serialized");
    });
  });

  describe("parseLiteral", () => {
    it("parses string literal to Date", () => {
      const ast = { kind: Kind.STRING, value: "2024-01-01T00:00:00.000Z" } as const;
      const result = dateTimeScalar.parseLiteral(ast as never, {});
      expect(result).toBeInstanceOf(Date);
    });

    it("parses int literal to Date", () => {
      const ast = { kind: Kind.INT, value: "1704067200000" } as const;
      const result = dateTimeScalar.parseLiteral(ast as never, {});
      expect(result).toBeInstanceOf(Date);
    });

    it("returns null for unsupported literal types", () => {
      const ast = { kind: Kind.BOOLEAN, value: "true" } as const;
      const result = dateTimeScalar.parseLiteral(ast as never, {});
      expect(result).toBeNull();
    });
  });
});
