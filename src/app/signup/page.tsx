import OAuthButtons from "@/components/OAuthButtons";
import SignUpForm from "@/components/SignUpForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
          </CardHeader>
          <CardContent>
            <SignUpForm />

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
