import { createTaskSchema } from "@/lib/validators/taskSchema";

describe("createTaskSchema", () => {
  it("accepts valid data", () => {
    const result = createTaskSchema.safeParse({
      title: "Write tests",
      priority: "MEDIUM",
      description: "Add unit tests and snapshots",
    });

    expect(result.success).toBe(true);
  });

  it("rejects No title", () => {
    const result = createTaskSchema.safeParse({
      title: "",
      priority: "LOW",
    });

    expect(result.success).toBe(false);
  });
});
