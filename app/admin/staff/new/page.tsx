// app/admin/staff/new/page.tsx — Create Staff page wrapper (Org Admin)

import { AddStaffForm } from "@/components/admin/add-staff-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "New Staff Member | Org Admin" };

export default function NewStaffPage() {
  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/admin/staff">
            <ChevronLeft className="mr-1 size-4" />
            Back to Staff Directory
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New Staff Member</h1>
        <p className="text-muted-foreground mt-1">
          Create and assign a staff member to your organization
        </p>
      </div>
      <AddStaffForm />
    </div>
  );
}
