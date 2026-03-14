import type { AppStore } from "@/store";
import { makeStore } from "@/store";
import type { Task } from "@/types/types";
import type { MockLink } from "@apollo/client/testing";
import { MockedProvider } from "@apollo/client/testing/react";
import { render, RenderOptions, RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DocumentNode, GraphQLError } from "graphql";
import { Session } from "next-auth";
import React, { ReactElement } from "react";
import { Provider } from "react-redux";

export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";

type MockedResponse = MockLink.MockedResponse;

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  mocks?: readonly MockedResponse[];
  session?: Session | null;
  store?: AppStore;
}

interface CustomRenderResult extends RenderResult {
  userEvent: ReturnType<typeof userEvent.setup>;
  store: AppStore;
}

interface AllTheProvidersProps {
  readonly children: React.ReactNode;
  readonly mocks?: readonly MockedResponse[];
  readonly session?: Session | null | undefined;
  readonly store: AppStore;
}

function AllTheProviders({ children, mocks = [], session, store }: AllTheProvidersProps) {
  if (session !== undefined) {
    try {
      const nextAuthReact = jest.requireMock("next-auth/react");
      if (nextAuthReact?.useSession) {
        nextAuthReact.useSession.mockReturnValue({
          data: session,
          status: session ? "authenticated" : "unauthenticated",
        });
      }
    } catch {}
  }

  return (
    <Provider store={store}>
      <MockedProvider mocks={mocks}>{children}</MockedProvider>
    </Provider>
  );
}

function customRender(ui: ReactElement, options?: CustomRenderOptions): CustomRenderResult {
  const { mocks = [], session, store = makeStore(), ...renderOptions } = options || {};

  const renderResult = render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders mocks={mocks} session={session} store={store}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });

  return {
    ...renderResult,
    store,
    userEvent: userEvent.setup(),
  };
}

export { customRender as render };

export function createQueryMock(
  query: DocumentNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any,
): MockedResponse {
  return {
    request: {
      query,
      variables,
    },
    result: {
      data,
    },
  };
}

export function createMutationMock(
  mutation: DocumentNode,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables?: any,
): MockedResponse {
  return {
    request: {
      query: mutation,
      variables,
    },
    result: {
      data,
    },
  };
}

export function createErrorMock(operation: DocumentNode, error: GraphQLError): MockedResponse {
  return {
    request: {
      query: operation,
    },
    error,
  };
}

export function createMockTask(overrides?: Partial<Task>): Task {
  return {
    id: "task-1",
    title: "Test Task",
    completed: false,
    started: false,
    priority: "MEDIUM",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockUser(overrides?: Partial<Session["user"]>): NonNullable<Session["user"]> {
  return {
    id: "user-1",
    name: "Test User",
    email: "test@example.com",
    ...overrides,
  };
}

export function createMockSession(overrides?: Partial<Session>): Session {
  return {
    user: createMockUser(overrides?.user),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    ...overrides,
  };
}
