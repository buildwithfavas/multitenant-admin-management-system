import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditUserForm } from "@/components/superadmin/edit-user-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
export const metadata = { title: "Edit User | Super Admin" };

export default async function EditUserPage({ params, }: {
    params: Promise<{
        id: string;
    }>;
}) {
    const { id } = await params;
    const user = await prisma.user.findUnique({
        where: { id },
        include: {
            members: true,
        },
    });

    if (!user) {
        notFound();
    }

    const organizations = await prisma.organization.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });

    const firstMembership = user.members[0];
    const userProps = {
        id: user.id,
        name: user.name || "",
        email: user.email || "",
        orgRole: (firstMembership?.role as "admin" | "member") || "member",
        organizationId: firstMembership?.organizationId || "",
    };
    
    return (<div className="flex flex-col gap-8 p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/superadmin/users">
            <ChevronLeft className="mr-1 size-4"/>
            Back to Users
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground mt-1">
          Modify details or change organization roles for {user.name}
        </p>
      </div>
      <EditUserForm user={userProps} organizations={organizations}/>
    </div>);
}
