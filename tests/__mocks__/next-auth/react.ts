import { Session } from "next-auth";

export const useSession = jest.fn(() => ({
  data: null,
  status: "unauthenticated" as const,
  update: jest.fn(),
}));

export const signIn = jest.fn(() => Promise.resolve({ ok: true, error: null, status: 200, url: null }));

export const signOut = jest.fn(() => Promise.resolve({ url: "/login" }));

export const SessionProvider = jest.fn(({ children }: { children: React.ReactNode }) => children);

export const getCsrfToken = jest.fn(() => Promise.resolve("mock-csrf-token"));

export const getProviders = jest.fn(() => Promise.resolve({}));

export const getSession = jest.fn(() => Promise.resolve(null));

export interface UseSessionReturn {
  data: Session | null;
  status: "authenticated" | "unauthenticated" | "loading";
  update: jest.Mock;
}
