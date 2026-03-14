import { CreateTaskDocument } from "@/gql/graphql";
import { createMutationMock, render, screen, waitFor } from "@/test-utils";
import { axe } from "jest-axe";
import TaskForm from "./TaskForm";

describe("TaskForm", () => {
  describe("Accessibility", () => {
    it("should have no accessibility violations when rendered", async () => {
      const { container } = render(<TaskForm />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it("should provide accessible labels for all form controls", () => {
      render(<TaskForm />);

      expect(screen.getByLabelText("Task title")).toBeInTheDocument();
      expect(screen.getByLabelText("Task description")).toBeInTheDocument();
      expect(screen.getByLabelText("Task priority")).toBeInTheDocument();
    });

    it("should have an accessible submit button", () => {
      render(<TaskForm />);

      const submitButton = screen.getByRole("button", { name: /add/i });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveAccessibleName();
    });

    it("should indicate required fields to screen readers", () => {
      render(<TaskForm />);

      const titleInput = screen.getByLabelText("Task title");
      expect(titleInput).toBeRequired();
    });

    it.skip("should associate error messages with form fields using aria-describedby", async () => {
      const { userEvent } = render(<TaskForm />);

      const titleInput = screen.getByLabelText("Task title");
      const submitButton = screen.getByRole("button", { name: /add/i });

      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(titleInput).toHaveAttribute("aria-invalid", "true");
      });
      expect(titleInput).toHaveAttribute("aria-describedby", "title-error");
    });

    it.skip("should announce errors to screen readers with role=alert", async () => {
      const { userEvent } = render(<TaskForm />);

      const submitButton = screen.getByRole("button", { name: /add/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        const errorMessage = screen.getByRole("alert");
        expect(errorMessage).toBeInTheDocument();
      });
    });

    it("should have accessible form label", () => {
      render(<TaskForm />);

      const form = screen.getByRole("form", { name: /create new task/i });
      expect(form).toBeInTheDocument();
    });

    it.skip("should provide loading state feedback to screen readers", async () => {
      const mockMutation = createMutationMock(CreateTaskDocument, {
        createTask: {
          __typename: "Task",
          id: "task-1",
          title: "Test",
          priority: "MEDIUM",
          completed: false,
          started: false,
        },
      });

      const { userEvent } = render(<TaskForm />, { mocks: [mockMutation] });

      const titleInput = screen.getByLabelText("Task title");
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await userEvent.type(titleInput, "Test Task");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /adding/i })).toBeInTheDocument();
      });
    });
  });

  describe("Form Structure and Rendering", () => {
    it("should render all required form fields", () => {
      render(<TaskForm />);

      expect(screen.getByPlaceholderText("Task title")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Description (optional)")).toBeInTheDocument();
      expect(screen.getByLabelText("Task priority")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
    });

    it("should configure title input with correct attributes", () => {
      render(<TaskForm />);

      const titleInput = screen.getByLabelText("Task title");
      expect(titleInput).toHaveAttribute("placeholder", "Task title");
      expect(titleInput).toBeRequired();
    });

    it("should configure description textarea with correct attributes", () => {
      render(<TaskForm />);

      const descriptionInput = screen.getByLabelText("Task description");
      expect(descriptionInput).toHaveAttribute("placeholder", "Description (optional)");
      expect(descriptionInput).not.toBeRequired();
      expect(descriptionInput.tagName).toBe("TEXTAREA");
    });

    it("should set priority select default value to MEDIUM", () => {
      render(<TaskForm />);

      const prioritySelect = screen.getByLabelText("Task priority");
      expect(prioritySelect).toHaveValue("MEDIUM");
    });

    it("should provide all priority options in select dropdown", () => {
      render(<TaskForm />);

      expect(screen.getByRole("option", { name: "Low" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "Medium" })).toBeInTheDocument();
      expect(screen.getByRole("option", { name: "High" })).toBeInTheDocument();
    });

    it("should render priority options in correct order", () => {
      render(<TaskForm />);

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveTextContent("Low");
      expect(options[1]).toHaveTextContent("Medium");
      expect(options[2]).toHaveTextContent("High");
    });
  });

  describe("Form Validation", () => {
    it("should mark title field as required", () => {
      render(<TaskForm />);

      const titleInput = screen.getByPlaceholderText("Task title");
      expect(titleInput).toBeRequired();
    });

    it("should mark description field as optional", () => {
      render(<TaskForm />);

      const descriptionInput = screen.getByPlaceholderText("Description (optional)");
      expect(descriptionInput).not.toBeRequired();
    });

    it("should not allow form submission with empty title", () => {
      render(<TaskForm />);

      const titleInput: HTMLInputElement = screen.getByLabelText("Task title");
      expect(titleInput.validity.valid).toBe(false);
      expect(titleInput.validity.valueMissing).toBe(true);
    });
  });

  describe("User Interactions", () => {
    it("should allow user to type in title input field", async () => {
      const { userEvent } = render(<TaskForm />);

      const titleInput = screen.getByPlaceholderText("Task title");
      await userEvent.type(titleInput, "New Task Title");

      expect(titleInput).toHaveValue("New Task Title");
    });

    it("should allow user to type in description textarea", async () => {
      const { userEvent } = render(<TaskForm />);

      const descriptionInput = screen.getByPlaceholderText("Description (optional)");
      await userEvent.type(descriptionInput, "Task description here");

      expect(descriptionInput).toHaveValue("Task description here");
    });

    it("should allow user to change priority selection", async () => {
      const { userEvent } = render(<TaskForm />);

      const prioritySelect = screen.getByLabelText("Task priority");
      await userEvent.selectOptions(prioritySelect, "HIGH");

      expect(prioritySelect).toHaveValue("HIGH");
    });

    it("should allow user to clear title input after typing", async () => {
      const { userEvent } = render(<TaskForm />);

      const titleInput = screen.getByPlaceholderText("Task title");
      await userEvent.type(titleInput, "Temporary Task");
      await userEvent.clear(titleInput);

      expect(titleInput).toHaveValue("");
    });

    it("should allow user to type multiline text in description", async () => {
      const { userEvent } = render(<TaskForm />);

      const descriptionInput = screen.getByPlaceholderText("Description (optional)");
      await userEvent.type(descriptionInput, "Line 1{Enter}Line 2");

      expect(descriptionInput).toHaveValue("Line 1\nLine 2");
    });

    it("should allow user to change priority multiple times", async () => {
      const { userEvent } = render(<TaskForm />);

      const prioritySelect = screen.getByLabelText("Task priority");

      await userEvent.selectOptions(prioritySelect, "HIGH");
      expect(prioritySelect).toHaveValue("HIGH");

      await userEvent.selectOptions(prioritySelect, "LOW");
      expect(prioritySelect).toHaveValue("LOW");

      await userEvent.selectOptions(prioritySelect, "MEDIUM");
      expect(prioritySelect).toHaveValue("MEDIUM");
    });
  });

  describe("Form Submission", () => {
    it.skip("should call createTask mutation when form is submitted with valid data", async () => {
      const mockMutation = createMutationMock(CreateTaskDocument, {
        createTask: {
          __typename: "Task",
          id: "new-task-id",
          title: "New Task",
          priority: "HIGH",
          completed: false,
          started: false,
        },
      });

      const { userEvent } = render(<TaskForm />, { mocks: [mockMutation] });

      const titleInput = screen.getByLabelText("Task title");
      const prioritySelect = screen.getByLabelText("Task priority");
      const submitButton = screen.getByRole("button", { name: /add/i });

      await userEvent.type(titleInput, "New Task");
      await userEvent.selectOptions(prioritySelect, "HIGH");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(titleInput).toHaveValue("");
      });
    });

    it.skip("should reset form fields after successful submission", async () => {
      const mockMutation = createMutationMock(CreateTaskDocument, {
        createTask: {
          __typename: "Task",
          id: "task-1",
          title: "Test Task",
          priority: "MEDIUM",
          completed: false,
          started: false,
        },
      });

      const { userEvent } = render(<TaskForm />, { mocks: [mockMutation] });

      const titleInput = screen.getByLabelText("Task title");
      const descriptionInput = screen.getByLabelText("Task description");
      const prioritySelect = screen.getByLabelText("Task priority");
      const submitButton = screen.getByRole("button", { name: /add/i });

      await userEvent.type(titleInput, "Test Task");
      await userEvent.type(descriptionInput, "Test Description");
      await userEvent.selectOptions(prioritySelect, "HIGH");
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(titleInput).toHaveValue("");
        expect(descriptionInput).toHaveValue("");
        expect(prioritySelect).toHaveValue("MEDIUM");
      });
    });

    it("should prevent form submission when title is empty", async () => {
      const { userEvent } = render(<TaskForm />);

      const submitButton = screen.getByRole("button", { name: /add/i });
      await userEvent.click(submitButton);

      const titleInput = screen.getByLabelText("Task title");
      expect(titleInput).toHaveValue("");
      expect(titleInput).toBeInvalid();
    });
  });

  describe("Loading State", () => {
    it.skip("should disable submit button during form submission", async () => {
      const mockMutation = createMutationMock(CreateTaskDocument, {
        createTask: {
          __typename: "Task",
          id: "task-1",
          title: "Test",
          priority: "MEDIUM",
          completed: false,
          started: false,
        },
      });

      const { userEvent } = render(<TaskForm />, { mocks: [mockMutation] });

      const titleInput = screen.getByLabelText("Task title");
      const submitButton = screen.getByRole("button", { name: /add task/i });

      await userEvent.type(titleInput, "Test Task");

      expect(submitButton).toBeEnabled();
    });
  });
});
