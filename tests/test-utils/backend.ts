import type { GraphQLContext } from "@/graphql/context";
import type { UserSchemaType } from "@/models/User";
import DataLoader from "dataloader";
import type { HydratedDocument } from "mongoose";
import type { Session } from "next-auth";
import type { NextRequest } from "next/server";

export function createMockNextRequest(
  options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: unknown;
    cookies?: Record<string, string>;
  } = {},
): NextRequest {
  const { method = "GET", url = "http://localhost:3000/api/test", headers = {}, body, cookies = {} } = options;

  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers),
  };

  if (body) {
    requestInit.body = JSON.stringify(body);
    if (!headers["content-type"]) {
      (requestInit.headers as Headers).set("content-type", "application/json");
    }
  }

  const request = new Request(url, requestInit) as NextRequest;

  if (Object.keys(cookies).length > 0) {
    Object.defineProperty(request, "cookies", {
      value: {
        get: (name: string) => cookies[name],
        getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })),
        has: (name: string) => name in cookies,
        set: jest.fn(),
        delete: jest.fn(),
      },
      writable: true,
    });
  }

  return request;
}

export function createMockGraphQLContext(overrides?: Partial<GraphQLContext>): GraphQLContext {
  type UserDocument = HydratedDocument<UserSchemaType>;

  const mockUserLoader: DataLoader<string, UserDocument> = {
    load: jest.fn().mockResolvedValue(null),
    loadMany: jest.fn().mockResolvedValue([]),
    clear: jest.fn().mockReturnThis(),
    clearAll: jest.fn().mockReturnThis(),
    prime: jest.fn().mockReturnThis(),
    name: "userLoader",
  };

  const defaultContext: GraphQLContext = {
    session: null,
    userId: null,
    loaders: {
      user: mockUserLoader,
    },
  };

  return {
    ...defaultContext,
    ...overrides,
  };
}

export function createMockAuthenticatedContext(
  userId: string = "user-1",
  sessionOverrides?: Partial<Session>,
): GraphQLContext {
  const session: Session = {
    user: {
      id: userId,
      name: "Test User",
      email: "test@example.com",
      ...sessionOverrides?.user,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...sessionOverrides,
  };

  return createMockGraphQLContext({
    session,
    userId,
  });
}

export function mockMongoDbClient() {
  const mockDb = {
    collection: jest.fn(),
    command: jest.fn(),
  };

  const mockCollection = {
    find: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn(),
    insertMany: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    createIndex: jest.fn(),
  };

  mockDb.collection.mockReturnValue(mockCollection);

  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb),
    connect: jest.fn(),
    close: jest.fn(),
  };

  return {
    client: mockClient,
    db: mockDb,
    collection: mockCollection,
  };
}

export function mockNextResponse() {
  return {
    json: jest.fn((data: unknown, init?: ResponseInit) => {
      return new Response(JSON.stringify(data), {
        ...init,
        headers: {
          "content-type": "application/json",
          ...init?.headers,
        },
      });
    }),
    redirect: jest.fn(),
    rewrite: jest.fn(),
    next: jest.fn(),
  };
}

export interface MockTaskDocument {
  _id: string;
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  started: boolean;
  priority: "LOW" | "MEDIUM" | "HIGH";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date | null;
}

export function createMockTaskDocument(overrides?: Partial<MockTaskDocument>): MockTaskDocument {
  return {
    _id: "507f1f77bcf86cd799439011",
    id: "507f1f77bcf86cd799439011",
    title: "Test Task",
    description: null,
    completed: false,
    started: false,
    priority: "MEDIUM",
    userId: "user-1",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    dueDate: null,
    ...overrides,
  };
}

export interface MockMongooseModel {
  find: jest.Mock;
  findOne: jest.Mock;
  findById: jest.Mock;
  findOneAndUpdate: jest.Mock;
  findOneAndDelete: jest.Mock;
  findByIdAndUpdate: jest.Mock;
  findByIdAndDelete: jest.Mock;
  create: jest.Mock;
  insertMany: jest.Mock;
  updateOne: jest.Mock;
  updateMany: jest.Mock;
  deleteOne: jest.Mock;
  deleteMany: jest.Mock;
  countDocuments: jest.Mock;
  aggregate: jest.Mock;
  save: jest.Mock;
}

export function mockMongooseModel(): MockMongooseModel {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    create: jest.fn(),
    insertMany: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    deleteOne: jest.fn(),
    deleteMany: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
    save: jest.fn(),
  };
}

export interface MockMongooseQuery {
  sort: jest.Mock;
  skip: jest.Mock;
  limit: jest.Mock;
  lean: jest.Mock;
  select: jest.Mock;
  populate: jest.Mock;
  exec: jest.Mock;
  then: jest.Mock;
}

export function mockMongooseQuery(): MockMongooseQuery {
  const query: MockMongooseQuery = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
    select: jest.fn(),
    populate: jest.fn(),
    exec: jest.fn(),
    then: jest.fn(),
  };

  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.lean.mockReturnValue(query);
  query.select.mockReturnValue(query);
  query.populate.mockReturnValue(query);
  query.exec.mockResolvedValue(null);

  query.then.mockImplementation((resolve) => {
    return query.exec().then(resolve);
  });

  return query;
}

export interface MockMongooseDocument extends MockTaskDocument {
  save: jest.Mock;
  remove: jest.Mock;
  deleteOne: jest.Mock;
  toObject: jest.Mock;
  toJSON: jest.Mock;
}

export function mockMongooseDocument(data: Partial<MockTaskDocument> = {}): MockMongooseDocument {
  const doc = createMockTaskDocument(data);
  return {
    ...doc,
    save: jest.fn().mockResolvedValue(doc),
    remove: jest.fn().mockResolvedValue(doc),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    toObject: jest.fn().mockReturnValue(doc),
    toJSON: jest.fn().mockReturnValue(doc),
  };
}
