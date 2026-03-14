import * as z from "zod";

const priorityEnumSchema = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createTaskSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional(),
    priority: priorityEnumSchema,
    dueDate: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date format"),
    completed: z.boolean().default(false),
    started: z.boolean().default(false),
  })
  .refine((data) => !(data.completed && data.started === false), {
    error: "If task is completed, started must be true",
    path: ["started"],
  });

export const UpdateTaskSchema = z
  .object({
    id: z.string().trim(),
    title: z.string().trim().min(1, "Title is required").max(100, "Title cannot exceed 100 characters"),
    description: z.string().trim().max(500, "Description cannot exceed 500 characters").optional(),
    priority: priorityEnumSchema,
    completed: z.boolean().default(false),
    started: z.boolean().default(false),
    dueDate: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date format"),
  })
  .refine((data) => !(data.completed && data.started === false), {
    error: "If task is completed, started must be true",
    path: ["started"],
  });

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof UpdateTaskSchema>;
