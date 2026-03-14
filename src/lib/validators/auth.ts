import * as z from "zod";

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().trim().min(1, "Password is required"),
});

export type LoginSchema = z.infer<typeof loginSchema>;
