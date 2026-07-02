// app/superadmin/organizations/new/page.tsx
import { CreateOrgForm } from "@/components/superadmin/create-org-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Organization | Super Admin" };

export default function NewOrganizationPage() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/superadmin/organizations">
            <ChevronLeft className="mr-1 size-4" />
            Back to Organizations
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Organization</h1>
        <p className="text-muted-foreground mt-1">
          Create a new company/tenant in your system
        </p>
      </div>
      <CreateOrgForm />
    </div>
  );
}
