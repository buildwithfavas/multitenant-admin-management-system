"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateStaffAction } from "@/actions/admin/staff";
import { updateStaffSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
type FormValues = z.input<typeof updateStaffSchema>;
interface UserProps {
    id: string;
    name: string;
    email: string;
}
export function EditStaffForm({ user, onSuccess }: {
    user: UserProps;
    onSuccess?: () => void;
}) {
    const router = useRouter();
    const { execute, status } = useAction(updateStaffAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success("Staff member updated successfully!");
                router.refresh();
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    router.push("/admin/staff");
                }
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to update staff member.");
        },
    });
    const form = useForm<FormValues>({
        resolver: zodResolver(updateStaffSchema as any),
        defaultValues: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: "",
        },
    });
    const isPending = status === "executing";
    const formContent = (<form onSubmit={form.handleSubmit((values) => execute(values))} className="flex flex-col gap-5">
      <input type="hidden" {...form.register("id")}/>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input id="name" placeholder="John Doe" disabled={isPending} {...form.register("name")}/>
        {form.formState.errors.name && (<p className="text-sm text-destructive">{form.formState.errors.name.message}</p>)}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" placeholder="john@company.com" disabled={isPending} {...form.register("email")}/>
        {form.formState.errors.email && (<p className="text-sm text-destructive">{form.formState.errors.email.message}</p>)}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Temporary Password (leave blank to keep current)</Label>
        <Input id="password" type="password" placeholder="Min. 8 characters" disabled={isPending} {...form.register("password")}/>
        {form.formState.errors.password && (<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>)}
      </div>

      <div className="flex gap-3 mt-2">
        <Button type="button" variant="outline" onClick={() => {
            if (onSuccess) {
                onSuccess();
            }
            else {
                router.back();
            }
        }} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>);
    if (onSuccess) {
        return formContent;
    }
    return (<Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Edit Staff Member</CardTitle>
        <CardDescription>
          Update user profile or set a new temporary password for {user.name}
        </CardDescription>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>);
}
