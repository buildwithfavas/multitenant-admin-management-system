import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({ children, }: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
        redirect("/login");
    }

    const membership = await prisma.member.findFirst({
        where: {
            userId: session.user.id,
            role: { in: ["admin", "owner"] },
        },
        include: {
            organization: true,
        },
    });

    const activeOrg = membership?.organization || {
        id: "global",
        name: "System Administrator View",
        slug: "system",
    };

    return (<div className="flex h-screen bg-background">
      
      <AdminSidebar user={session.user} organization={activeOrg}/>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>);
}
