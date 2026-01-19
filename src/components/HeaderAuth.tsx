"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function HeaderAuth() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-3" aria-hidden>
        <span className="h-6 w-20 animate-pulse rounded bg-gray-200" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/login" className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400">
          Log in
        </Link>
        <Link
          href="/signup"
          className="cursor-pointer rounded bg-blue-600 px-3 py-1.5 text-sm text-white dark:bg-blue-400 dark:text-black"
        >
          Sign up
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link href="/dashboard" className="cursor-pointer text-sm text-slate-700 hover:underline dark:text-slate-300">
        Dashboard
      </Link>
      <Link href="/tasks" className="cursor-pointer text-sm text-slate-700 hover:underline dark:text-slate-300">
        Tasks
      </Link>
      <span className="text-sm">Hi, {session.user?.name || session.user?.email || "there"}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="cursor-pointer rounded border border-red-700 px-3 py-1.5 text-sm text-red-700 hover:bg-red-700 hover:text-white dark:border-red-300 dark:text-red-300 dark:hover:bg-red-300 dark:hover:text-black"
        aria-label="Sign out"
      >
        Sign out
      </button>
    </div>
  );
}
