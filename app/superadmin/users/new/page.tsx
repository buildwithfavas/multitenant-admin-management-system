import { prisma } from "@/lib/prisma";
import { CreateUserForm } from "@/components/superadmin/create-user-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
export const metadata = { title: "New User | Super Admin" };

export default async function NewUserPage() {

    const organizations = await prisma.organization.findMany({
        select: { id: true, name: true },
        orderBy: { name: "asc" },
    });
    
    return (<div className="flex flex-col gap-8 p-6 lg:p-8">
      <div>
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground">
          <Link href="/superadmin/users">
            <ChevronLeft className="mr-1 size-4"/>
            Back to Users
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New User</h1>
        <p className="text-muted-foreground mt-1">
          Create a user and assign them a role in an organization
        </p>
      </div>
      <CreateUserForm organizations={organizations}/>
    </div>);
}
