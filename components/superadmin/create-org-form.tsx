"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizationAction } from "@/actions/superadmin/organization";
import { orgSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
type FormValues = z.input<typeof orgSchema>;
export function CreateOrgForm() {
    const router = useRouter();
    const { execute, status } = useAction(createOrganizationAction, {
        onSuccess: ({ data }) => {
            if (data?.success) {
                toast.success(`Organization "${data.organization.name}" created!`);
                router.push("/superadmin/organizations");
            }
        },
        onError: ({ error }) => {
            toast.error(error.serverError || "Failed to create organization");
        },
    });
    const form = useForm<FormValues>({
        resolver: zodResolver(orgSchema as any),
        defaultValues: { name: "", slug: "", logo: "" },
    });
    function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
        const name = e.target.value;
        form.setValue("name", name);
        const slug = name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-")
            .trim();
        form.setValue("slug", slug);
    }
    const isPending = status === "executing";
    return (<Card className="max-w-lg">
      <CardHeader>
        <CardTitle>Create Organization</CardTitle>
        <CardDescription>
          Set up a new company/tenant in your system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit((values) => execute(values))} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Organization Name *</Label>
            <Input id="name" placeholder="Acme Corporation" disabled={isPending} {...form.register("name")} onChange={handleNameChange}/>
            {form.formState.errors.name && (<p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>)}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">
              Slug (URL identifier) *
              <span className="text-xs text-muted-foreground ml-2">
                auto-generated from name
              </span>
            </Label>
            <Input id="slug" placeholder="acme-corporation" disabled={isPending} {...form.register("slug")}/>
            {form.formState.errors.slug && (<p className="text-sm text-destructive">
                {form.formState.errors.slug.message}
              </p>)}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="logo">Logo URL (optional)</Label>
            <Input id="logo" type="url" placeholder="https://example.com/logo.png" disabled={isPending} {...form.register("logo")}/>
          </div>

          <div className="flex gap-3 mt-2">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Organization"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);
}
