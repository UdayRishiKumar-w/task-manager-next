import { AuthErrorMessage } from "@/components/AuthErrorMessage";
import LoginForm from "@/components/LoginForm";
import OAuthButtons from "@/components/OAuthButtons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Sign in</CardTitle>
          </CardHeader>
          <CardContent>
            <AuthErrorMessage />
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
