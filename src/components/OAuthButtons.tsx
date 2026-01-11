"use client";

import { signIn } from "next-auth/react";

export default function OAuthButtons() {
  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={() => signIn("github", { callbackUrl: "/tasks" })}
        className="flex w-full items-center justify-center gap-2 rounded border py-2"
      >
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
}
