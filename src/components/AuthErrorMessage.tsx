"use client";

import { useSearchParams } from "next/navigation";

export const AuthErrorMessage = () => {
  const ERROR_MESSAGES: Record<string, string> = {
    CredentialsSignin: "Invalid email or password",
    Default: "Something went wrong. Try again.",
  };

  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");

  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.Default) : null;

  return (
    errorMessage && (
      <p role="alert" className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
        {errorMessage}
      </p>
    )
  );
};
