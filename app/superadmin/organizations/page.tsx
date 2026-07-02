// ============================================================
// app/superadmin/organizations/page.tsx — Org List Page
// ============================================================

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2, Users, Plus } from "lucide-react";
import { DeleteOrganizationButton } from "@/components/superadmin/delete-org-button";

export const metadata = { title: "Organizations | Super Admin" };

export default async function OrganizationsPage() {
  const organizations = await prisma.organization.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { members: true } },
      members: {
        include: { user: { select: { name: true, email: true, role: true } } },
        take: 3, // Show first 3 members as preview
      },
    },
  });

  return (
    <div className="flex flex-col gap-8 p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Organizations</h1>
          <p className="text-muted-foreground mt-1">
            Manage all companies in your system ({organizations.length} total)
          </p>
        </div>
        <Button asChild>
          <Link href="/superadmin/organizations/new">
            <Plus className="mr-2 size-4" />
            New Organization
          </Link>
        </Button>
      </div>

      {organizations.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Building2 className="size-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first organization to get started.
            </p>
            <Button asChild>
              <Link href="/superadmin/organizations/new">
                <Plus className="mr-2 size-4" />
                Create Organization
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {organizations.map((org) => (
            <Card key={org.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="size-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{org.name}</CardTitle>
                    <CardDescription className="text-xs">/{org.slug}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary">
                  <Users className="mr-1 size-3" />
                  {org._count.members}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {/* Preview of members */}
                  {org.members.length > 0 && (
                    <div className="flex flex-col gap-1">
                      {org.members.map((m) => (
                        <div key={m.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate">{m.user.email}</span>
                          <Badge
                            variant={m.role === "admin" ? "default" : "outline"}
                            className="text-xs ml-2 shrink-0"
                          >
                            {m.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/superadmin/users?org=${org.id}`}>
                        View Users
                      </Link>
                    </Button>
                    <DeleteOrganizationButton orgId={org.id} orgName={org.name} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
