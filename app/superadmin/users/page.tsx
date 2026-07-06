// app/superadmin/users/page.tsx — All Users List (Super Admin)

import { prisma } from "@/lib/prisma";
import { UsersDashboard } from "@/components/superadmin/users-dashboard";

export const metadata = { title: "All Users | Super Admin" };

export default async function AllUsersPage() {
  // Fetch all non-superadmin users with their org memberships
  const users = await prisma.user.findMany({
    where: { role: { not: "superadmin" } },
    orderBy: { createdAt: "desc" },
    include: {
      members: {
        include: {
          organization: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Also fetch organizations for role assignment
  const organizations = await prisma.organization.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return <UsersDashboard users={users} organizations={organizations} />;
}
