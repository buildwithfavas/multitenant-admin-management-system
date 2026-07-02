// ============================================================
// app/superadmin/dashboard/page.tsx — Super Admin Dashboard
// ============================================================
// Server Component: fetches data directly from the database
// Shows: total orgs, total users, total admins, total staff
// ============================================================

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Users, ShieldCheck, UserCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Dashboard | Super Admin",
};

export default async function SuperAdminDashboardPage() {
  // Fetch stats directly from the database (Server Component!)
  const [orgCount, userCount, adminCount, staffCount] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count({ where: { role: { not: "superadmin" } } }),
    prisma.user.count({ where: { role: "admin" } }),
    prisma.user.count({ where: { role: "member" } }),
  ]);

  const stats = [
    {
      title: "Total Organizations",
      value: orgCount,
      description: "Active companies in the system",
      icon: Building2,
      href: "/superadmin/organizations",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Users",
      value: userCount,
      description: "Admins + Staff across all orgs",
      icon: Users,
      href: "/superadmin/users",
      color: "text-violet-500",
      bg: "bg-violet-50 dark:bg-violet-950",
    },
    {
      title: "Administrators",
      value: adminCount,
      description: "Org-level admins",
      icon: ShieldCheck,
      href: "/superadmin/users",
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Staff Members",
      value: staffCount,
      description: "Regular staff users",
      icon: UserCheck,
      href: "/superadmin/users",
      color: "text-amber-500",
      bg: "bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your entire multi-tenant system
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href="/superadmin/organizations/new">
              + New Organization
            </Link>
          </Button>
          <Button asChild>
            <Link href="/superadmin/users/new">+ New User</Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`rounded-lg p-2 ${stat.bg}`}>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild variant="outline" className="justify-start h-auto py-3">
              <Link href="/superadmin/organizations/new">
                <Building2 className="mr-2 size-4 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">Create Organization</div>
                  <div className="text-xs text-muted-foreground">Set up a new company/tenant</div>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start h-auto py-3">
              <Link href="/superadmin/users/new">
                <Users className="mr-2 size-4 text-violet-500" />
                <div className="text-left">
                  <div className="font-medium">Create User</div>
                  <div className="text-xs text-muted-foreground">Add admin or staff to an org</div>
                </div>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>At a glance</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Organizations</span>
              <span className="font-semibold">{orgCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <span className="font-semibold">{userCount}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-muted-foreground">Administrators</span>
              <span className="font-semibold">{adminCount}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Staff</span>
              <span className="font-semibold">{staffCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
