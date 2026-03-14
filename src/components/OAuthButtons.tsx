"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function OAuthButtons() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/tasks";

  return (
    <div className="mt-4 space-y-2">
      <button
        onClick={() => void signIn("github", { callbackUrl: from })}
        className="flex w-full cursor-pointer items-center justify-center gap-2 rounded border py-2"
      >
        <span>Continue with GitHub</span>
      </button>
    </div>
  );
}
