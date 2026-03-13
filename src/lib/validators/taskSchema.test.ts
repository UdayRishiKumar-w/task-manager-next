import { createTaskSchema, UpdateTaskSchema } from "./taskSchema";

describe("createTaskSchema", () => {
  describe("valid input acceptance", () => {
    it("accepts valid task with all required fields", () => {
      const validTask = {
        title: "Complete project",
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Complete project");
        expect(result.data.priority).toBe("MEDIUM");
        expect(result.data.completed).toBe(false);
        expect(result.data.started).toBe(false);
      }
    });

    it("accepts valid task with all fields including optional ones", () => {
      const validTask = {
        title: "Complete project",
        description: "This is a detailed description",
        priority: "HIGH" as const,
        dueDate: "2024-12-31",
        completed: true,
        started: true,
      };

      const result = createTaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe("Complete project");
        expect(result.data.description).toBe("This is a detailed description");
        expect(result.data.priority).toBe("HIGH");
        expect(result.data.dueDate).toBe("2024-12-31");
        expect(result.data.completed).toBe(true);
        expect(result.data.started).toBe(true);
      }
    });

    it("accepts task with LOW priority", () => {
      const validTask = {
        title: "Low priority task",
        priority: "LOW" as const,
      };

      const result = createTaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("LOW");
      }
    });

    it("accepts task with HIGH priority", () => {
      const validTask = {
        title: "High priority task",
        priority: "HIGH" as const,
      };

      const result = createTaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe("HIGH");
      }
    });

    it("accepts task with valid ISO date format", () => {
      const validTask = {
        title: "Task with date",
        priority: "MEDIUM" as const,
        dueDate: "2024-01-15T10:30:00Z",
      };

      const result = createTaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
    });

    it("accepts task with started true and completed true", () => {
      const validTask = {
        title: "Completed task",
        priority: "MEDIUM" as const,
        started: true,
        completed: true,
      };

      const result = createTaskSchema.safeParse(validTask);

      expect(result.success).toBe(true);
    });
  });

  describe("invalid input rejection", () => {
    it("rejects task with empty title", () => {
      const invalidTask = {
        title: "",
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["title"],
            message: "Title is required",
          }),
        );
      }
    });

    it("rejects task with title exceeding 100 characters", () => {
      const invalidTask = {
        title: "a".repeat(101),
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["title"],
            message: "Title cannot exceed 100 characters",
          }),
        );
      }
    });

    it("rejects task with description exceeding 500 characters", () => {
      const invalidTask = {
        title: "Valid title",
        description: "a".repeat(501),
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["description"],
            message: "Description cannot exceed 500 characters",
          }),
        );
      }
    });

    it("rejects task with invalid priority", () => {
      const invalidTask = {
        title: "Valid title",
        priority: "URGENT",
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.path).toContain("priority");
      }
    });

    it("rejects task with invalid date format", () => {
      const invalidTask = {
        title: "Valid title",
        priority: "MEDIUM" as const,
        dueDate: "not-a-date",
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["dueDate"],
            message: "Invalid date format",
          }),
        );
      }
    });

    it("rejects task with completed true but started false", () => {
      const invalidTask = {
        title: "Valid title",
        priority: "MEDIUM" as const,
        completed: true,
        started: false,
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["started"],
            message: "If task is completed, started must be true",
          }),
        );
      }
    });

    it("rejects task missing required title field", () => {
      const invalidTask = {
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.path).toContain("title");
      }
    });

    it("rejects task missing required priority field", () => {
      const invalidTask = {
        title: "Valid title",
      };

      const result = createTaskSchema.safeParse(invalidTask);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.path).toContain("priority");
      }
    });
  });

  describe("optional field handling", () => {
    it("accepts task without optional description field", () => {
      const taskWithoutDescription = {
        title: "Task without description",
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(taskWithoutDescription);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("accepts task with optional description field", () => {
      const taskWithDescription = {
        title: "Task with description",
        description: "This is a description",
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(taskWithDescription);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("This is a description");
      }
    });

    it("accepts task without optional dueDate field", () => {
      const taskWithoutDueDate = {
        title: "Task without due date",
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(taskWithoutDueDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBeUndefined();
      }
    });

    it("accepts task with optional dueDate field", () => {
      const taskWithDueDate = {
        title: "Task with due date",
        priority: "MEDIUM" as const,
        dueDate: "2024-12-31",
      };

      const result = createTaskSchema.safeParse(taskWithDueDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBe("2024-12-31");
      }
    });

    it("accepts task without optional completed field and applies default", () => {
      const taskWithoutCompleted = {
        title: "Task without completed",
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(taskWithoutCompleted);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.completed).toBe(false);
      }
    });

    it("accepts task without optional started field and applies default", () => {
      const taskWithoutStarted = {
        title: "Task without started",
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(taskWithoutStarted);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.started).toBe(false);
      }
    });

    it("accepts task with all optional fields omitted", () => {
      const minimalTask = {
        title: "Minimal task",
        priority: "LOW" as const,
      };

      const result = createTaskSchema.safeParse(minimalTask);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
        expect(result.data.dueDate).toBeUndefined();
        expect(result.data.completed).toBe(false);
        expect(result.data.started).toBe(false);
      }
    });

    it("validates optional description when provided", () => {
      const taskWithInvalidDescription = {
        title: "Task",
        description: "a".repeat(501),
        priority: "MEDIUM" as const,
      };

      const result = createTaskSchema.safeParse(taskWithInvalidDescription);

      expect(result.success).toBe(false);
    });

    it("validates optional dueDate when provided", () => {
      const taskWithInvalidDate = {
        title: "Task",
        priority: "MEDIUM" as const,
        dueDate: "invalid-date",
      };

      const result = createTaskSchema.safeParse(taskWithInvalidDate);

      expect(result.success).toBe(false);
    });
  });

  describe("schema transformations", () => {
    // Tests will be added in subtask 4.5
  });

  describe("edge cases and boundary conditions", () => {
    // Tests will be added in subtask 4.6
  });
});

describe("UpdateTaskSchema", () => {
  describe("valid input acceptance", () => {
    it("accepts valid update with all required fields", () => {
      const validUpdate = {
        id: "task-123",
        title: "Updated task",
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(validUpdate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("task-123");
        expect(result.data.title).toBe("Updated task");
        expect(result.data.priority).toBe("MEDIUM");
      }
    });

    it("accepts valid update with all fields", () => {
      const validUpdate = {
        id: "task-456",
        title: "Updated task",
        description: "Updated description",
        priority: "HIGH" as const,
        dueDate: "2024-12-31",
        completed: true,
        started: true,
      };

      const result = UpdateTaskSchema.safeParse(validUpdate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe("task-456");
        expect(result.data.title).toBe("Updated task");
        expect(result.data.description).toBe("Updated description");
      }
    });
  });

  describe("invalid input rejection", () => {
    it("rejects update missing required id field", () => {
      const invalidUpdate = {
        title: "Updated task",
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(invalidUpdate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues[0]?.path).toContain("id");
      }
    });

    it("rejects update with empty title", () => {
      const invalidUpdate = {
        id: "task-123",
        title: "",
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(invalidUpdate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["title"],
            message: "Title is required",
          }),
        );
      }
    });

    it("rejects update with title exceeding 100 characters", () => {
      const invalidUpdate = {
        id: "task-123",
        title: "a".repeat(101),
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(invalidUpdate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["title"],
            message: "Title cannot exceed 100 characters",
          }),
        );
      }
    });

    it("rejects update with completed true but started false", () => {
      const invalidUpdate = {
        id: "task-123",
        title: "Valid title",
        priority: "MEDIUM" as const,
        completed: true,
        started: false,
      };

      const result = UpdateTaskSchema.safeParse(invalidUpdate);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error?.issues).toContainEqual(
          expect.objectContaining({
            path: ["started"],
            message: "If task is completed, started must be true",
          }),
        );
      }
    });
  });

  describe("optional field handling", () => {
    it("accepts update without optional description field", () => {
      const updateWithoutDescription = {
        id: "task-123",
        title: "Updated task",
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(updateWithoutDescription);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it("accepts update with optional description field", () => {
      const updateWithDescription = {
        id: "task-123",
        title: "Updated task",
        description: "Updated description",
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(updateWithDescription);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe("Updated description");
      }
    });

    it("accepts update without optional dueDate field", () => {
      const updateWithoutDueDate = {
        id: "task-123",
        title: "Updated task",
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(updateWithoutDueDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBeUndefined();
      }
    });

    it("accepts update with optional dueDate field", () => {
      const updateWithDueDate = {
        id: "task-123",
        title: "Updated task",
        priority: "MEDIUM" as const,
        dueDate: "2024-12-31",
      };

      const result = UpdateTaskSchema.safeParse(updateWithDueDate);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.dueDate).toBe("2024-12-31");
      }
    });
  });

  describe("schema transformations", () => {
    // Tests will be added in subtask 4.5
  });

  describe("edge cases and boundary conditions", () => {
    // Tests will be added in subtask 4.6
  });
});

describe("createTaskSchema - schema transformations", () => {
  it("applies default value false to completed field when omitted", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(false);
    }
  });

  it("applies default value false to started field when omitted", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.started).toBe(false);
    }
  });

  it("preserves explicitly set completed value true", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
      completed: true,
      started: true,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(true);
    }
  });

  it("preserves explicitly set started value true", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
      started: true,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.started).toBe(true);
    }
  });

  it("applies both default values when both fields omitted", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(false);
      expect(result.data.started).toBe(false);
    }
  });
});

describe("UpdateTaskSchema - schema transformations", () => {
  it("applies default value false to completed field when omitted", () => {
    const update = {
      id: "task-123",
      title: "Test task",
      priority: "MEDIUM" as const,
    };

    const result = UpdateTaskSchema.safeParse(update);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completed).toBe(false);
    }
  });

  it("applies default value false to started field when omitted", () => {
    const update = {
      id: "task-123",
      title: "Test task",
      priority: "MEDIUM" as const,
    };

    const result = UpdateTaskSchema.safeParse(update);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.started).toBe(false);
    }
  });
});

describe("createTaskSchema - edge cases and boundary conditions", () => {
  it("accepts title with exactly 1 character (minimum)", () => {
    const task = {
      title: "a",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts title with exactly 100 characters (maximum)", () => {
    const task = {
      title: "a".repeat(100),
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts description with exactly 500 characters (maximum)", () => {
    const task = {
      title: "Test task",
      description: "a".repeat(500),
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts description with exactly 1 character", () => {
    const task = {
      title: "Test task",
      description: "a",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts empty string for optional description", () => {
    const task = {
      title: "Test task",
      description: "",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts title with special characters", () => {
    const task = {
      title: "Task with special chars: !@#$%^&*()",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts title with unicode characters", () => {
    const task = {
      title: "Task with unicode: 你好 🎉 café",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts title with newlines and tabs", () => {
    const task = {
      title: "Task\nwith\nnewlines\tand\ttabs",
      priority: "MEDIUM" as const,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts dueDate with various valid date formats", () => {
    const validDates = [
      "2024-12-31",
      "2024-01-01T00:00:00Z",
      "2024-06-15T14:30:00.000Z",
      "December 31, 2024",
      "12/31/2024",
    ];

    validDates.forEach((dueDate) => {
      const task = {
        title: "Test task",
        priority: "MEDIUM" as const,
        dueDate,
      };

      const result = createTaskSchema.safeParse(task);

      expect(result.success).toBe(true);
    });
  });

  it("rejects dueDate with invalid date strings", () => {
    const invalidDates = ["not-a-date", "invalid", "abc123", "just text"];

    invalidDates.forEach((dueDate) => {
      const task = {
        title: "Test task",
        priority: "MEDIUM" as const,
        dueDate,
      };

      const result = createTaskSchema.safeParse(task);

      expect(result.success).toBe(false);
    });
  });

  it("accepts task with started false and completed false", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
      started: false,
      completed: false,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("accepts task with started true and completed false", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
      started: true,
      completed: false,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(true);
  });

  it("rejects task with non-string title", () => {
    const task = {
      title: 123,
      priority: "MEDIUM",
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(false);
  });

  it("rejects task with non-boolean completed", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
      completed: "true",
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(false);
  });

  it("rejects task with non-boolean started", () => {
    const task = {
      title: "Test task",
      priority: "MEDIUM" as const,
      started: 1,
    };

    const result = createTaskSchema.safeParse(task);

    expect(result.success).toBe(false);
  });
});

describe("UpdateTaskSchema - edge cases and boundary conditions", () => {
  it("accepts id with various string formats", () => {
    const validIds = ["task-123", "123", "abc-def-ghi", "task_123", "TASK-123"];

    validIds.forEach((id) => {
      const update = {
        id,
        title: "Test task",
        priority: "MEDIUM" as const,
      };

      const result = UpdateTaskSchema.safeParse(update);

      expect(result.success).toBe(true);
    });
  });

  it("rejects update with non-string id", () => {
    const update = {
      id: 123,
      title: "Test task",
      priority: "MEDIUM",
    };

    const result = UpdateTaskSchema.safeParse(update);

    expect(result.success).toBe(false);
  });

  it("accepts update with empty string id", () => {
    const update = {
      id: "",
      title: "Test task",
      priority: "MEDIUM" as const,
    };

    const result = UpdateTaskSchema.safeParse(update);

    expect(result.success).toBe(true);
  });
});
