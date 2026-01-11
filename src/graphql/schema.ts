import { gql } from "graphql-tag";

export const typeDefs = gql`
  scalar Date

  enum Priority {
    low
    medium
    high
  }

  type Task {
    id: ID!
    title: String!
    description: String
    completed: Boolean!
    priority: Priority!
    dueDate: Date
    createdAt: Date!
    updatedAt: Date!
    ownerId: String
  }

  input CreateTaskInput {
    title: String!
    description: String
    priority: Priority = medium
    dueDate: Date
    ownerId: String
  }

  input UpdateTaskInput {
    title: String
    description: String
    completed: Boolean
    priority: Priority
    dueDate: Date
  }

  type Query {
    tasks(limit: Int = 50): [Task!]!
    task(id: ID!): Task
  }

  type Mutation {
    createTask(input: CreateTaskInput!): Task!
    updateTask(id: ID!, input: UpdateTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
  }
`;
