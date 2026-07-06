// app/admin/staff/page.tsx — Scoped Staff Management Page (Org Admin)

import { StaffTable } from "@/components/admin/staff-table"
import { AddStaffDialog } from "@/components/admin/add-staff-dialog"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export const metadata = { title: "Staff Members | Org Admin" }

export default async function AdminStaffPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/login")
  }

  // Find organization membership
  const membership = await prisma.member.findFirst({
    where: {
      userId: session.user.id,
      role: { in: ["admin"] },
    },
  })

  const orgId = membership?.organizationId

  if (!orgId && session.user.role !== "admin") {
    redirect("/login")
  }

  // Scoped database query to fetch members of THIS organization
  const members = await prisma.member.findMany({
    where: {
      organizationId: orgId,
      // Optional: Exclude current logged in admin from list to avoid self-modification
      NOT: { userId: session.user.id },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Members</h1>
          <p className="mt-1 text-muted-foreground">
            Manage users in your organization ({members.length} total)
          </p>
        </div>
        <AddStaffDialog />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-muted-foreground" />
            Organization Directory
          </CardTitle>
          <CardDescription>
            List of users assigned to your organization. Promote members to
            Admins, demote back to Staff, or revoke access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StaffTable members={members} />
        </CardContent>
      </Card>
    </div>
  )
}
