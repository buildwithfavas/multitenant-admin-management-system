"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
type LoginFormValues = z.infer<typeof loginSchema>;
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });
    async function onSubmit(values: LoginFormValues) {
        setIsLoading(true);
        try {
            const result = await authClient.signIn.email({
                email: values.email,
                password: values.password,
            }, {
                onSuccess: async (ctx) => {
                    const user = ctx.data.user;
                    toast.success(`Welcome back, ${user.name}!`);
                    if (user.role === "superadmin") {
                        router.push("/superadmin/dashboard");
                    }
                    else if (user.role === "admin") {
                        router.push("/admin/dashboard");
                    }
                    else {
                        router.push("/staff/dashboard");
                    }
                },
                onError: (ctx) => {
                    toast.error(ctx.error.message || "Invalid email or password.");
                    setIsLoading(false);
                },
            });
            if (!result) {
                setIsLoading(false);
            }
        }
        catch (error) {
            toast.error("Something went wrong. Please try again.");
            setIsLoading(false);
        }
    }
    return (<div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="shadow-lg border-0 bg-card/95 backdrop-blur">
        <CardHeader className="text-center pb-2">
          
          <div className="flex items-center justify-center mb-4">
            <div className="size-12 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-6 text-primary-foreground">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" disabled={isLoading} {...form.register("email")}/>
              
              {form.formState.errors.email && (<p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>)}
            </div>

            
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" autoComplete="current-password" disabled={isLoading} {...form.register("password")}/>
              {form.formState.errors.password && (<p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>)}
            </div>

            
            <Button type="submit" className="w-full mt-1 font-semibold" disabled={isLoading}>
              {isLoading ? (<span className="flex items-center gap-2">
                  <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Signing in...
                </span>) : ("Sign In")}
            </Button>
          </form>

          
          <p className="mt-6 text-center text-xs text-muted-foreground">
            Contact your administrator if you need access.
          </p>
        </CardContent>
      </Card>
    </div>);
}
