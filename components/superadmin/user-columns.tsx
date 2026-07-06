"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { UserRoleActions } from "./user-role-actions";

export interface Organization {
  id: string;
  name: string;
}

export interface Member {
  id: string;
  role: string;
  organization: { id: string; name: string };
}

export interface UserRow {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  members: Member[];
}

function getRoleBadgeVariant(role: string) {
  switch (role) {
    case "admin": return "default" as const;
    case "member": return "secondary" as const;
    default: return "outline" as const;
  }
}

export const getUserColumns = (organizations: Organization[]): ColumnDef<UserRow>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name || "N/A"}</span>,
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.email}</span>,
  },
  {
    accessorKey: "role",
    header: "Global Role",
    cell: ({ row }) => (
      <Badge variant={getRoleBadgeVariant(row.original.role)}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    id: "organizations",
    header: "Organizations",
    cell: ({ row }) => {
      const members = row.original.members;
      return (
        <div className="flex flex-col gap-1">
          {members.length === 0 ? (
            <span className="text-xs text-muted-foreground">No org</span>
          ) : (
            members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <span className="text-xs">{m.organization.name}</span>
              </div>
            ))
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <UserRoleActions
        userId={row.original.id}
        userName={row.original.name || ""}
        userEmail={row.original.email || ""}
        members={row.original.members}
        organizations={organizations}
      />
    ),
  },
];
