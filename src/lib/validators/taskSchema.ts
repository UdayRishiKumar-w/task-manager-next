import { z } from "zod";

const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
    priority: priorityEnum,
    dueDate: z
      .string()
      .optional()
      .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date format"),
    completed: z.boolean().optional().default(false),
    started: z.boolean().optional().default(false),
  })
  .refine((data) => !(data.completed && data.started === false), {
    message: "If task is completed, started must be true",
    path: ["started"],
  });

export const UpdateTaskSchema = z
  .object({
    id: z.string(),
    title: z.string().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
    priority: priorityEnum,
    completed: z.boolean().optional().default(false),
    started: z.boolean().optional().default(false),
    dueDate: z
      .string()
      .optional()
      .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date format"),
  })
  .refine((data) => !(data.completed && data.started === false), {
    message: "If task is completed, started must be true",
    path: ["started"],
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
