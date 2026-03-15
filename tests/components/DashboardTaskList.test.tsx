import DashboardTaskList from "@/components/DashboardTaskList";
import { TasksPaginatedDocument } from "@/gql/graphql";
import { createErrorMock, createQueryMock, render, screen, waitFor } from "@tests/utils";
import { GraphQLError } from "graphql";
import { axe } from "jest-axe";

describe("DashboardTaskList", () => {
  const mockTasks = [
    {
      __typename: "Task" as const,
      id: "1",
      title: "Active Task",
      completed: false,
      started: true,
      priority: "HIGH",
      createdAt: "1640000000000",
    },
    {
      __typename: "Task" as const,
      id: "2",
      title: "Completed Task",
      completed: true,
      started: true,
      priority: "LOW",
      createdAt: "1640000000000",
    },
  ];

  const defaultVariables = { limit: 50, offset: 0, filter: undefined };

  const createMockResponse = (items: typeof mockTasks, totalCount: number) => ({
    tasksPaginated: {
      __typename: "TaskConnection" as const,
      items,
      totalCount,
    },
  });

  describe("accessibility", () => {
    it("should not have any accessibility violations with tasks", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      const { container } = render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("Active Task")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should not have any accessibility violations in empty state", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse([], 0), defaultVariables)];
      const { container } = render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("No tasks yet")).toBeInTheDocument();
      });

      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("filter controls have accessible labels", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        const statusFilter = screen.getByLabelText("Status:");
        const priorityFilter = screen.getByLabelText("Priority:");

        expect(statusFilter).toHaveAccessibleName();
        expect(priorityFilter).toHaveAccessibleName();
      });
    });

    it("checkboxes have descriptive aria-labels", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        checkboxes.forEach((checkbox: HTMLElement) => {
          expect(checkbox).toHaveAccessibleName();
          expect(checkbox).toHaveAttribute("aria-readonly", "true");
        });
      });
    });

    it("disabled checkboxes indicate read-only state", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        checkboxes.forEach((checkbox: HTMLElement) => {
          expect(checkbox).toBeDisabled();
        });
      });
    });
  });

  describe("loading and data display", () => {
    it("displays loading skeletons initially", () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      const skeletons = screen.getAllByRole("generic", { hidden: true });
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("displays all tasks after loading", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("Active Task")).toBeInTheDocument();
        expect(screen.getByText("Completed Task")).toBeInTheDocument();
      });
    });

    it("displays task priority badges", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        const highBadges = screen.getAllByText("HIGH");
        const lowBadges = screen.getAllByText("LOW");
        expect(highBadges.length).toBeGreaterThan(0);
        expect(lowBadges.length).toBeGreaterThan(0);
      });
    });

    it("displays completed tasks with line-through styling", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        const completedTask = screen.getByText("Completed Task");
        expect(completedTask).toHaveClass("line-through");
      });
    });

    it("displays started status for tasks", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        const startedLabels = screen.getAllByText("Started");
        expect(startedLabels.length).toBeGreaterThan(0);
      });
    });
  });

  describe("filter controls", () => {
    it("renders status and priority filter dropdowns", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByLabelText("Status:")).toBeInTheDocument();
        expect(screen.getByLabelText("Priority:")).toBeInTheDocument();
      });
    });

    it("status filter has all required options", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse(mockTasks, 2), defaultVariables)];
      const { userEvent } = render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByLabelText("Status:")).toBeInTheDocument();
      });

      // Open the status combobox to reveal options
      await userEvent.click(screen.getByRole("combobox", { name: /status/i }));

      const listbox = await screen.findByRole("listbox");

      expect(listbox).toHaveTextContent("All");
      expect(listbox).toHaveTextContent("Active");
      expect(listbox).toHaveTextContent("Completed");
    });
  });

  describe("empty state", () => {
    it("displays empty state message when no tasks exist", async () => {
      const mocks = [createQueryMock(TasksPaginatedDocument, createMockResponse([], 0), defaultVariables)];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText("No tasks yet")).toBeInTheDocument();
      });
    });
  });

  describe("error handling", () => {
    it("displays error message on query error", async () => {
      const mocks = [createErrorMock(TasksPaginatedDocument, new GraphQLError("Failed to fetch tasks"))];
      render(<DashboardTaskList />, { mocks });

      await waitFor(() => {
        expect(screen.getByText(/Error loading tasks/)).toBeInTheDocument();
      });
    });
  });
});
