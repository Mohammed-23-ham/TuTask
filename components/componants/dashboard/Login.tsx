"use client";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { pb } from "@/lib/pocketbase";
import {
  Field,
  FieldGroup,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type Schema = z.infer<typeof loginSchema>;

export function DraftForm() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const form = useForm<Schema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const {
    formState: { isSubmitting },
  } = form;

  const handleSubmit = form.handleSubmit(async (data: Schema) => {
    try {
      setSubmitError("");
      await pb.collection("users").authWithPassword(data.email, data.password);
      router.push("/dashboard");
    } catch {
      setSubmitError("Email or password is incorrect.");
    }
  });

  return (
    <form
      onSubmit={handleSubmit}
      className="p-2 sm:p-5 md:p-8 w-full rounded-md gap-2 border max-w-3xl mx-auto"
    >
      <FieldGroup className="grid md:grid-cols-6 gap-4 mb-6">
        <h1 className="mt-6 mb-1 font-extrabold text-3xl tracking-tight col-span-full">
          Login
        </h1>

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldLabel htmlFor="email">Email </FieldLabel>
              <Input
                {...field}
                id="email"
                type="email"
                onChange={(e) => {
                  field.onChange(e.target.value);
                }}
                aria-invalid={fieldState.invalid}
                placeholder="Enter your Email"
              />

              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {submitError && (
          <p role="alert" className="col-span-full text-sm text-destructive">
            {submitError}
          </p>
        )}

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="gap-1 col-span-full"
            >
              <FieldContent className="gap-0.5">
                <FieldLabel htmlFor="password">Password *</FieldLabel>
              </FieldContent>
              <Input
                {...field}
                type="password"
                aria-invalid={fieldState.invalid}
                id="password"
                placeholder="Password"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="flex justify-end items-center w-full">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing in..." : "Sign in"}
        </Button>
      </div>
    </form>
  );
}
