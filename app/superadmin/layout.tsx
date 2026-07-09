import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SuperAdminSidebar } from "@/components/superadmin/sidebar";

export default async function SuperAdminLayout({ children, }: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.role !== "superadmin") {
        redirect("/login");
    }

    return (<div className="flex h-screen bg-background">
      
      <SuperAdminSidebar user={session.user}/>      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>);
}
