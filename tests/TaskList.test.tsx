import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

// Mock Apollo hooks used in TaskList
jest.mock("@apollo/client/react", () => ({
  useQuery: () => ({
    data: {
      getTasks: [
        {
          __typename: "Task",
          id: "1",
          title: "Test task",
          completed: false,
          priority: "MEDIUM",
          createdAt: new Date().toISOString(),
          user: { __typename: "User", id: "u1", name: "Alice", email: "a@example.com" },
        },
      ],
    },
    loading: false,
    error: null,
  }),
  useMutation: () => [jest.fn(), {}],
}));

// Mock fragment masking helper
jest.mock("@/gql/fragment-masking", () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFragmentData: (_: any, data: any) => data,
}));

import TaskList from "@/components/TaskList";

describe("TaskList", () => {
  it("renders tasks and matches snapshot", () => {
    const { container } = render(<TaskList />);
    expect(screen.getByText("Test task")).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
