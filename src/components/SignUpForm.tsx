"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, SignupSchema } from "@/lib/validators/signup";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";

export default function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (values: SignupSchema) => {
    await signIn("credentials", {
      mode: "signup",
      name: values.name,
      email: values.email,
      password: values.password,
      callbackUrl: "/tasks",
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="sr-only" htmlFor="name">
          Name
        </label>
        <Input id="name" {...register("name")} placeholder="Name" />
        {errors.name && <p className="text-sm text-red-600 dark:text-red-400">{errors.name.message}</p>}
      </div>

      <div>
        <label className="sr-only" htmlFor="email">
          Email
        </label>
        <Input id="email" {...register("email")} type="email" placeholder="Email" />
        {errors.email && <p className="text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>}
      </div>

      <div>
        <label className="sr-only" htmlFor="password">
          Password
        </label>
        <Input id="password" {...register("password")} type="password" placeholder="Password" />
        {errors.password && <p className="text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href="/login" className="text-blue-600 hover:underline dark:text-blue-400">
          Log in
        </Link>
      </p>
    </form>
  );
}
