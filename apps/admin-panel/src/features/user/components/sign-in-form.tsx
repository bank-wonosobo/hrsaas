"use client";
import Button from "@/components/ui/button/button";
import Input from "@/components/ui/input/input";
import { useZodForm } from "@/hooks/use-zod-form";
import React from "react";
import { useLogin } from "../hooks/use-login";
import { SignInRequest, SignInRequestSchema } from "../schemas/auth-schema";

export default function SignInForm(): React.ReactNode {
  const form = useZodForm(SignInRequestSchema, {
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const mutation = useLogin();

  const onSubmit = (data: SignInRequest) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        {...form.register("email")}
        error={form.formState.errors.email?.message}
      />
      <Input
        label="Password"
        type="password"
        {...form.register("password")}
        error={form.formState.errors.password?.message}
      />
      <Button className="w-full" loading={mutation.isPending}>
        Masuk
      </Button>
    </form>
  );
}
