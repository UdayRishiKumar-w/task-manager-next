"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema, LoginSchema } from "@/lib/validators/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (values: LoginSchema) => {
    await signIn("credentials", {
      ...values,
      callbackUrl: "/tasks",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleLogin)} className="space-y-4" aria-busy={isSubmitting} aria-live="polite">
      <div>
        <label className="sr-only" htmlFor="email">
          Email
        </label>
        <Input id="email" {...register("email")} type="email" placeholder="Email" aria-invalid={!!errors.email} />
        {errors.email && (
          <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <label className="sr-only" htmlFor="password">
          Password
        </label>
        <Input
          id="password"
          {...register("password")}
          type="password"
          placeholder="Password"
          aria-invalid={!!errors.password}
        />
        {errors.password && (
          <p role="alert" className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="inline-flex items-center gap-2">
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
            </svg>
            Signing in...
          </span>
        ) : (
          "Log in"
        )}
      </Button>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <span>Don&apos;t have an account? </span>
        <Link href="/signup" className="cursor-pointer text-blue-600 hover:underline dark:text-blue-400">
          Sign up
        </Link>
      </div>
    </form>
  );
}
