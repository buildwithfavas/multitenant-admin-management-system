// ============================================================
// app/admin/dashboard/page.tsx — Org Admin Dashboard
// ============================================================
// Server Component: fetches organization-specific statistics.
// Enforces data isolation so an admin can ONLY see their own org's data.
// ============================================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Shield, Building, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Org Admin",
};

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Find organization membership
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ["admin", "owner"] },
    },
    include: {
      organization: true,
    },
  });

  // Safe fallback if user has no org (e.g., global superadmin)
  const organization = membership?.organization;

  if (!organization && session.user.role !== "superadmin") {
    return (
      <div className="p-8">
        <h1 className="text-xl font-bold text-destructive">No active organization found.</h1>
        <p className="text-muted-foreground mt-2">
          Please contact the system administrator to assign you to an organization.
        </p>
      </div>
    );
  }

  const orgId = organization?.id || "global";
  const orgName = organization?.name || "System Admin Mock Organization";

  // Scoped queries: count members in THIS organization only
  const [totalStaff, totalAdmins] = await Promise.all([
    orgId === "global"
      ? prisma.member.count({ where: { role: "member" } })
      : prisma.member.count({ where: { organizationId: orgId, role: "member" } }),
    orgId === "global"
      ? prisma.member.count({ where: { role: { in: ["admin", "owner"] } } })
      : prisma.member.count({ where: { organizationId: orgId, role: { in: ["admin", "owner"] } } }),
  ]);

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of <strong>{orgName}</strong>
          </p>
        </div>
        {organization && (
          <Button asChild>
            <Link href="/admin/staff/new">+ Add Staff Member</Link>
          </Button>
        )}
      </div>

      {/* Scoped Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Organization name
            </CardTitle>
            <div className="rounded-lg p-2 bg-emerald-50 dark:bg-emerald-950">
              <Building className="size-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{orgName}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Active Tenant Scoping
            </p>
          </CardContent>
        </Card>

        <Link href="/admin/staff">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Staff Members
              </CardTitle>
              <div className="rounded-lg p-2 bg-blue-50 dark:bg-blue-950">
                <UserCheck className="size-4 text-blue-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalStaff}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active staff accounts in organization
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/staff">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Administrators
              </CardTitle>
              <div className="rounded-lg p-2 bg-violet-50 dark:bg-violet-950">
                <Shield className="size-4 text-violet-500" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalAdmins}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Authorized administrators for organization
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Scoped Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Data Isolation Policy</CardTitle>
          <CardDescription>Security and isolation configuration</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            Your access is locked to <strong>{orgName}</strong>. You cannot view,
            add, or modify staff members belonging to other organizations.
          </p>
          <p>
            All server action database mutations and fetches check organization
            ownership tokens before executing. Role changes within this dashboard
            are restricted to members of this organization only.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
