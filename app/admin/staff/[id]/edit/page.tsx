// app/admin/staff/[id]/edit/page.tsx — Edit Staff Page (Org Admin)

import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { EditStaffForm } from "@/components/admin/edit-staff-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export const metadata = { title: "Edit Staff Member | Org Admin" };

export default async function EditStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Find admin's organization membership
  const adminMembership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ["admin", "owner"] },
    },
  });

  if (!adminMembership) {
    redirect("/login");
  }

  // Verify the target user belongs to the same organization
  const member = await prisma.member.findFirst({
    where: {
      userId: id,
      organizationId: adminMembership.organizationId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!member || !member.user) {
    notFound();
  }

  const userProps = {
    id: member.user.id,
    name: member.user.name || "",
    email: member.user.email || "",
  };

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/admin/staff">
            <ChevronLeft className="mr-1 size-4" />
            Back to Staff Directory
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit Staff Member</h1>
        <p className="text-muted-foreground mt-1">
          Modify details or set a new password for {member.user.name}
        </p>
      </div>
      <EditStaffForm user={userProps} />
    </div>
  );
}
