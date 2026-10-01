"use client";

// import Input from "@/components/ui/input/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useZodForm } from "@/hooks/use-zod-form";
import { cn } from "cn";
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
    <div className={cn("flex flex-col gap-6")}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  aria-invalid={!!form.formState.errors.email?.message}
                  {...form.register("email")}
                />
                {form.formState.errors.email?.message && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.email?.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  aria-invalid={!!form.formState.errors.password?.message}
                  {...form.register("password")}
                />
                {form.formState.errors.password?.message && (
                  <FieldDescription className="text-destructive">
                    {form.formState.errors.password?.message}
                  </FieldDescription>
                )}
              </Field>
              <Field>
                <Button type="submit">
                  {mutation.isPending && <Spinner data-icon="inline-start" />}
                  Login
                </Button>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
    // <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    //   <Input
    //     label="Email"
    //     {...form.register("email")}
    //     error={form.formState.errors.email?.message}
    //   />
    //   <Input
    //     label="Password"
    //     type="password"
    //     {...form.register("password")}
    //     error={form.formState.errors.password?.message}
    //   />
    //   <Button className="w-full" loading={mutation.isPending}>
    //     Masuk
    //   </Button>
    // </form>
  );
}
