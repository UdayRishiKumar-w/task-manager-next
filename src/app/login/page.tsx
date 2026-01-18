"use client";

import LoginForm from "@/components/LoginForm";
import OAuthButtons from "@/components/OAuthButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password",
  Default: "Something went wrong. Try again.",
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const errorKey = searchParams.get("error");

  const errorMessage = errorKey ? (ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.Default) : null;

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            {errorMessage && (
              <p role="alert" className="mb-3 rounded bg-red-100 p-2 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
            <LoginForm />

            <div className="my-4 flex items-center gap-2" aria-hidden="true">
              <div className="h-px flex-1 bg-muted" />
              <span className="text-sm text-muted-foreground">OR</span>
              <div className="h-px flex-1 bg-muted" />
            </div>

            <OAuthButtons />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
