import { GetTasksDocument } from "@/gql/graphql";
import { createErrorMock, createQueryMock, render, screen, waitFor } from "@/test-utils";
import { GraphQLError } from "graphql";
import { axe } from "jest-axe";
import TaskList from "./TaskList";

describe("TaskList", () => {
  const mockTasks = [
    {
      __typename: "Task" as const,
      id: "1",
      title: "Test Task 1",
      completed: false,
      started: false,
      priority: "HIGH",
      createdAt: "1640000000000",
    },
    {
      __typename: "Task" as const,
      id: "2",
      title: "Test Task 2",
      completed: true,
      started: true,
      priority: "LOW",
      createdAt: "1640000000000",
    },
  ];

  describe("accessibility", () => {
    it("should not have any accessibility violations with tasks", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      const { container } = render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have any accessibility violations in empty state", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: [] })];
      const { container } = render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("No tasks yet")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("checkboxes have accessible labels", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        checkboxes.forEach((checkbox) => {
          expect(checkbox).toHaveAccessibleName();
        });
      });
    });

    it("delete buttons have accessible labels", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole("button", { name: /delete/i });
        expect(deleteButtons.length).toBe(mockTasks.length);
        deleteButtons.forEach((button) => {
          expect(button).toHaveAccessibleName();
        });
      });
    });
  });

  describe("loading state", () => {
    it("displays loading skeletons initially", () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      const skeletons = screen.getAllByRole("generic", { hidden: true });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("removes loading skeletons after data loads", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      const { container } = render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      });

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]');
      expect(skeletons.length).toBe(0);
    });
  });

  describe("successful data display", () => {
    it("displays all tasks after query completes", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("Test Task 1")).toBeInTheDocument();
        expect(screen.getByText("Test Task 2")).toBeInTheDocument();
      });
    });

    it("displays task priority badges", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("HIGH")).toBeInTheDocument();
        expect(screen.getByText("LOW")).toBeInTheDocument();
      });
    });

    it("displays task creation dates", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const createdTexts = screen.getAllByText(/Created/);
        expect(createdTexts.length).toBeGreaterThan(0);
      });
    });

    it("displays completed tasks with line-through styling", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const completedTask = screen.getByText("Test Task 2");
        expect(completedTask).toHaveClass("line-through");
      });
    });

    it("displays uncompleted tasks without line-through styling", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const uncompletedTask = screen.getByText("Test Task 1");
        expect(uncompletedTask).not.toHaveClass("line-through");
      });
    });

    it("displays correct number of tasks", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBe(mockTasks.length * 2); // completed + started checkboxes
      });
    });
  });

  describe("empty state", () => {
    it("displays empty state message when no tasks exist", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: [] })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("No tasks yet")).toBeInTheDocument();
      });
    });

    it("does not display task list when empty", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: [] })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("No tasks yet")).toBeInTheDocument();
      });

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
  });

  describe("error handling", () => {
    it("displays error message on query error", async () => {
      const mocks = [createErrorMock(GetTasksDocument, new GraphQLError("Failed to fetch tasks"))];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText(/Error loading tasks/)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch tasks/)).toBeInTheDocument();
      });
    });

    it("displays network error message", async () => {
      const mocks = [createErrorMock(GetTasksDocument, new GraphQLError("Network error"))];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it("does not display tasks when error occurs", async () => {
      const mocks = [createErrorMock(GetTasksDocument, new GraphQLError("Failed to fetch tasks"))];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText(/Error loading tasks/)).toBeInTheDocument();
      });

      expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    });
  });

  describe("task interactions", () => {
    it("renders checkboxes for task completion", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThan(0);
      });
    });

    it("renders started status for each task", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const startedLabels = screen.getAllByText("Started");
        expect(startedLabels.length).toBe(mockTasks.length);
      });
    });

    it("renders delete button for each task", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      render(<TaskList />, { mocks });

      await waitFor(() => {
        const deleteButtons = screen.getAllByText("Delete");
        expect(deleteButtons.length).toBe(mockTasks.length);
      });
    });

    it("opens delete confirmation dialog when delete is clicked", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      const { userEvent } = render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText("Delete");
      await userEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByText("Delete task")).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete this task/)).toBeInTheDocument();
      });
    });

    it("delete dialog has cancel and confirm buttons", async () => {
      const mocks = [createQueryMock(GetTasksDocument, { getTasks: mockTasks })];
      const { userEvent } = render(<TaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("Test Task 1")).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByText("Delete");
      await userEvent.click(deleteButtons[0]!);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /delete/i })).toBeInTheDocument();
      });
    });
  });
});
