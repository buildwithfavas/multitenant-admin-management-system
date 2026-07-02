// ============================================================
// app/staff/dashboard/page.tsx — Staff Dashboard Page
// ============================================================
// Server Component: displays a greeting, the user's role status,
// and information regarding their assigned organization.
// ============================================================

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building, Calendar, Info, User } from "lucide-react";

export const metadata = {
  title: "Dashboard | Staff",
};

export default async function StaffDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch the organization membership for this staff user
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      role: "member",
    },
    include: {
      organization: true,
    },
  });

  const organization = membership?.organization;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {session.user.name}!</h1>
        <p className="text-muted-foreground mt-1">
          You are logged in as a staff member.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <User className="size-4 text-blue-500" />
              Your Account Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold">Email address</label>
              <p className="text-sm font-medium mt-0.5">{session.user.email}</p>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold">Assigned Role</label>
              <div className="mt-1">
                <Badge variant="secondary">Staff Member</Badge>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase font-semibold">Account Created</label>
              <p className="text-sm font-medium flex items-center gap-1.5 mt-0.5">
                <Calendar className="size-3.5 text-muted-foreground" />
                {new Date(session.user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Organization Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Building className="size-4 text-emerald-500" />
              Your Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {organization ? (
              <>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Name</label>
                  <p className="text-lg font-bold mt-0.5">{organization.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase font-semibold">Slug Identifier</label>
                  <p className="text-sm font-mono mt-0.5">/{organization.slug}</p>
                </div>
                <div className="flex items-start gap-2.5 rounded-lg border bg-muted/30 p-3.5 text-sm text-muted-foreground">
                  <Info className="size-4 text-blue-500 shrink-0 mt-0.5" />
                  <p>
                    Your data is strictly isolated within the sandbox boundary of{" "}
                    <strong>{organization.name}</strong>. You do not have permissions to access administrative functions or view resources of other tenants.
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Info className="size-8 text-amber-500 mx-auto mb-2" />
                <p className="font-semibold">No assigned organization</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You are not currently linked to any organization. Please contact your administrator.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
