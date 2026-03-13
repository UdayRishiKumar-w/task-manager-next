"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-6 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!session) {
    return (
      <nav className="flex items-center gap-2 sm:gap-3" aria-label="Authentication">
        <Link
          href="/login"
          className="cursor-pointer text-xs font-medium text-blue-700 transition-colors hover:text-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm dark:text-blue-400 dark:hover:text-blue-300"
          aria-label="Log in to your account"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="cursor-pointer rounded bg-blue-700 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-800 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-3 sm:text-sm dark:bg-blue-600 dark:hover:bg-blue-700"
          aria-label="Create a new account"
        >
          Sign up
        </Link>
      </nav>
    );
  }

  return (
    <nav className="flex items-center gap-2 sm:gap-3" aria-label="User navigation">
      <Link
        href="/dashboard"
        className="cursor-pointer text-xs font-medium text-gray-800 transition-colors hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:text-sm dark:text-gray-200 dark:hover:text-blue-400"
        aria-label="Go to dashboard"
      >
        Dashboard
      </Link>
      <Link
        href="/tasks"
        className="cursor-pointer text-xs font-medium text-gray-800 transition-colors hover:text-blue-700 hover:underline focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:inline sm:text-sm dark:text-gray-200 dark:hover:text-blue-400"
        aria-label="Go to tasks"
      >
        Tasks
      </Link>
      <span
        className="text-xs font-medium text-gray-800 sm:inline sm:text-sm dark:text-gray-200"
        aria-label={`Logged in as ${session.user?.name || session.user?.email || "user"}`}
      >
        Hi, {session.user?.name || session.user?.email || "there"}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="cursor-pointer rounded border-2 border-red-700 px-2.5 py-1.5 text-xs font-medium text-red-700 transition-colors hover:bg-red-700 hover:text-white focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:outline-none sm:px-3 sm:text-sm dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500 dark:hover:text-white"
        aria-label="Sign out of your account"
      >
        Sign out
      </button>
    </nav>
  );
}
