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

            <div className="mt-4 flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="mt-4">
              <OAuthButtons />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
