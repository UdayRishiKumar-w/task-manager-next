import { createMockAuthenticatedContext, createMockGraphQLContext, createMockTaskDocument } from "@/test-utils/backend";
import { userResolvers } from "./user.resolver";

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
  },
}));

import { Task } from "@/models/Task";

describe("User Field Resolvers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("User.tasks", () => {
    it("returns tasks for authenticated user viewing their own profile", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const parent = { id: "user-1" };
      const mockTasks = [
        createMockTaskDocument({ id: "1", title: "Task 1", userId: "user-1" }),
        createMockTaskDocument({ id: "2", title: "Task 2", userId: "user-1" }),
      ];

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockTasks),

        then: jest.fn((resolve) => resolve(mockTasks)) as never,
      };
      (Task.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await userResolvers.User.tasks(parent, {}, ctx);

      expect(Task.find).toHaveBeenCalledWith({ userId: "user-1" }, {}, { virtuals: true, lean: true });
      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toEqual(mockTasks);
    });

    it("returns empty array when user has no tasks", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const parent = { id: "user-1" };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),

        then: jest.fn((resolve) => resolve([])) as never,
      };
      (Task.find as jest.Mock).mockReturnValue(mockQuery);

      const result = await userResolvers.User.tasks(parent, {}, ctx);

      expect(result).toEqual([]);
    });

    it("throws Unauthorized error when user is not authenticated", async () => {
      const ctx = createMockGraphQLContext();
      const parent = { id: "user-1" };

      expect(() => userResolvers.User.tasks(parent, {}, ctx)).toThrow("Unauthorized");
      expect(Task.find).not.toHaveBeenCalled();
    });

    it("throws Unauthorized error when user tries to view another user's tasks", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const parent = { id: "user-2" };

      expect(() => userResolvers.User.tasks(parent, {}, ctx)).toThrow("Unauthorized");
      expect(Task.find).not.toHaveBeenCalled();
    });

    it("sorts tasks by createdAt in descending order", async () => {
      const ctx = createMockAuthenticatedContext("user-1");
      const parent = { id: "user-1" };

      const mockQuery = {
        sort: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),

        then: jest.fn((resolve) => resolve([])) as never,
      };
      (Task.find as jest.Mock).mockReturnValue(mockQuery);

      await userResolvers.User.tasks(parent, {}, ctx);

      expect(mockQuery.sort).toHaveBeenCalledWith({ createdAt: -1 });
    });
  });

  describe("User.id", () => {
    it("returns id field when present", () => {
      const user = {
        id: "user-123",
        _id: {
          toString: () => "507f1f77bcf86cd799439011",
        },
      };

      const result = userResolvers.User.id(user as never);

      expect(result).toBe("user-123");
    });

    it("returns _id.toString() when id field is missing", () => {
      const user = {
        _id: {
          toString: () => "507f1f77bcf86cd799439011",
        },
      };

      const result = userResolvers.User.id(user as never);

      expect(result).toBe("507f1f77bcf86cd799439011");
    });

    it("handles _id as string", () => {
      const user = {
        _id: "507f1f77bcf86cd799439011",
      };

      const result = userResolvers.User.id(user as never);

      expect(result).toBe("507f1f77bcf86cd799439011");
    });
  });
});
