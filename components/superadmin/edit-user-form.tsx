"use client";
import { updateUserAction } from "@/actions/superadmin/user";
import { updateUserSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
type FormValues = z.input<typeof updateUserSchema>;
interface Organization {
    id: string;
    name: string;
}
interface UserProps {
    id: string;
    name: string;
    email: string;
    orgRole: "admin" | "member";
    organizationId: string;
}
export function EditUserForm({ user, organizations, onSuccess, }: {
    user: UserProps;
    organizations: Organization[];
    onSuccess?: () => void;
}) {
    const router = useRouter();
    const { execute, status } = useAction(updateUserAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success(`User updated successfully!`);
                router.refresh();
                if (onSuccess) {
                    onSuccess();
                }
                else {
                    router.push("/superadmin/users");
                }
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to update user");
        },
    });
    const form = useForm<FormValues>({
        resolver: zodResolver(updateUserSchema as any),
        defaultValues: {
            id: user.id,
            name: user.name,
            email: user.email,
            password: "",
            orgRole: user.orgRole,
            organizationId: user.organizationId,
        },
    });
    const isPending = status === "executing";
    const formContent = (<form onSubmit={form.handleSubmit((values) => execute({
            ...values,
            organizationId: values.organizationId || undefined,
        }))} className="flex flex-col gap-5">
      <input type="hidden" {...form.register("id")}/>

      <div className="grid grid-cols-2 gap-4">
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
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Password (leave blank to keep current)</Label>
        <Input id="password" type="password" placeholder="Min. 8 characters" disabled={isPending} {...form.register("password")}/>
        {form.formState.errors.password && (<p className="text-sm text-destructive">{form.formState.errors.password.message}</p>)}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label>Role in Organization</Label>
          <Select defaultValue={user.orgRole} onValueChange={(val) => form.setValue("orgRole", val as "admin" | "member")} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select role"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Staff (Member)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>Organization</Label>
          <Select defaultValue={user.organizationId || "none"} onValueChange={(val) => form.setValue("organizationId", val === "none" ? "" : val)} disabled={isPending}>
            <SelectTrigger>
              <SelectValue placeholder="Select organization"/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No organization</SelectItem>
              {organizations.map((org) => (<SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>))}
            </SelectContent>
          </Select>
        </div>
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
      <CardContent className="pt-6">{formContent}</CardContent>
    </Card>);
}
