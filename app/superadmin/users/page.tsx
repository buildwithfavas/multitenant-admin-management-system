// app/superadmin/users/page.tsx — All Users List (Super Admin)

import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Plus, Users } from "lucide-react";
import { UserRoleActions } from "@/components/superadmin/user-role-actions";

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

  function getRoleBadgeVariant(role: string) {
    switch (role) {
      case "admin": return "default" as const;
      case "member": return "secondary" as const;
      default: return "outline" as const;
    }
  }

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage users across all organizations ({users.length} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/users/new">
            <Plus className="mr-2 size-4" />
            New User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="size-5 text-muted-foreground" />
            Users
          </CardTitle>
          <CardDescription>
            Click actions to edit, delete and to promote/demote users within their organizations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-12">
              <Users className="size-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No users yet.</p>
              <Button asChild className="mt-4">
                <Link href="/superadmin/users/new">Create your first user</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Global Role</TableHead>
                  <TableHead>Organizations</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {user.email}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.members.length === 0 ? (
                          <span className="text-xs text-muted-foreground">No org</span>
                        ) : (
                          user.members.map((m) => (
                            <div key={m.id} className="flex items-center gap-2">
                              <span className="text-xs">{m.organization.name}</span>
                            </div>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <UserRoleActions
                        userId={user.id}
                        userName={user.name}
                        members={user.members.map((m) => ({
                          id: m.id,
                          role: m.role,
                          organization: m.organization,
                        }))}
                        organizations={organizations}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
