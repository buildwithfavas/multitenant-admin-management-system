// ============================================================
// app/admin/layout.tsx — Organization Admin Layout
// ============================================================
// This layout wraps all /admin/* pages with an organization-scoped
// sidebar and header. Only accessible to Org Admins.
// ============================================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Verify authentication and role is admin (or superadmin for convenience)
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "superadmin")) {
    redirect("/login");
  }

  // Fetch the organization membership for this admin
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ["admin", "owner"] },
    },
    include: {
      organization: true,
    },
  });

  // Fallback for superadmin who doesn't belong to any org
  const activeOrg = membership?.organization || {
    id: "global",
    name: "System Administrator View",
    slug: "system",
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Scope-scoped Sidebar */}
      <AdminSidebar user={session.user} organization={activeOrg} />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
