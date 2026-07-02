"use client";
// ============================================================
// components/admin/add-staff-form.tsx — Add Staff Form (Org Admin)
// ============================================================

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { addStaffToOrgAction } from "@/actions/admin/staff";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

export function AddStaffForm() {
  const router = useRouter();

  const { execute, status } = useAction(addStaffToOrgAction, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message || "Staff member successfully added!");
        router.push("/admin/staff");
      }
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to add staff member.");
    },
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const isPending = status === "executing";

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Add Staff Member</CardTitle>
        <CardDescription>
          Create a new user and add them to your organization as a staff member
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((values) => execute(values))} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input id="name" placeholder="John Doe" disabled={isPending} {...form.register("name")} />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" placeholder="john@company.com" disabled={isPending} {...form.register("email")} />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Temporary Password *</Label>
            <Input id="password" type="password" placeholder="Min. 8 characters" disabled={isPending} {...form.register("password")} />
            {form.formState.errors.password && (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Adding..." : "Add Staff Member"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
