// ============================================================
// app/superadmin/layout.tsx — Super Admin Layout
// ============================================================
// This layout wraps all /superadmin/* pages with a sidebar
// and header. Only visible to superadmin users.
// (Middleware protects this route — anyone else is redirected)
// ============================================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SuperAdminSidebar } from "@/components/superadmin/sidebar";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Double-check: get the current session on the server
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If somehow the middleware missed it, redirect here too
  if (!session?.user || session.user.role !== "superadmin") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar navigation */}
      <SuperAdminSidebar user={session.user} />

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
