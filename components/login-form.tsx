"use client";
// ============================================================
// components/login-form.tsx — Login Form with Better Auth
// ============================================================
//
// HOW THIS WORKS:
// 1. User fills in email + password
// 2. Zod validates the inputs (shows errors if invalid)
// 3. React Hook Form handles the form state
// 4. On submit → calls authClient.signIn.email()
// 5. Better Auth makes a POST to /api/auth/sign-in/email
// 6. Server verifies credentials, creates session, sets cookie
// 7. We redirect the user to their dashboard based on their role
// ============================================================

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Validation Schema ────────────────────────────────────────
// Zod defines the rules for the login form.
// If validation fails, React Hook Form shows the error message.
const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

// TypeScript infers the type from the Zod schema
type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // ── React Hook Form Setup ─────────────────────────────────
  // useForm manages all form state, validation, and submission.
  // zodResolver connects Zod's validation rules to React Hook Form.
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // ── Form Submit Handler ───────────────────────────────────
  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true);

    try {
      // Call Better Auth's sign-in function
      // This makes a POST request to /api/auth/sign-in/email
      const result = await authClient.signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          // These callbacks run based on the result
          onSuccess: async (ctx) => {
            const user = ctx.data.user;

            // Show success toast notification
            toast.success(`Welcome back, ${user.name}!`);

            // Redirect based on role
            // The middleware also enforces this, but redirecting
            // client-side is faster for the user experience.
            if (user.role === "superadmin") {
              router.push("/superadmin/dashboard");
            } else if (user.role === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/staff/dashboard");
            }
          },
          onError: (ctx) => {
            // Show error message from Better Auth
            toast.error(ctx.error.message || "Invalid email or password.");
            setIsLoading(false);
          },
        }
      );

      // Handle the case where callbacks aren't triggered
      if (!result) {
        setIsLoading(false);
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          {/* App Logo / Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6 text-primary-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Admin Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in to access your dashboard
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {/* React Hook Form's handleSubmit runs our onSubmit after validation */}
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                autoComplete="email"
                disabled={isLoading}
                // register() connects this input to React Hook Form
                {...form.register("email")}
              />
              {/* Show validation error if email is invalid */}
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={isLoading}
                {...form.register("password")}
              />
              {form.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-1 font-semibold"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Info text */}
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Contact your administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
