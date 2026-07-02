"use client";
// components/superadmin/user-role-actions.tsx — Role promote/demote buttons

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { promoteToAdminAction, demoteToStaffAction } from "@/actions/superadmin/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpCircle, ArrowDownCircle } from "lucide-react";

interface Member {
  id: string;
  role: string;
  organization: { id: string; name: string };
}

interface Props {
  userId: string;
  userName: string;
  members: Member[];
  organizations: { id: string; name: string }[];
}

export function UserRoleActions({ userId, userName, members }: Props) {
  const { execute: promote, status: promoteStatus } = useAction(promoteToAdminAction, {
    onSuccess: () => toast.success(`${userName} promoted to Admin`),
    onError: ({ error }) => toast.error(error.serverError || "Failed to promote"),
  });

  const { execute: demote, status: demoteStatus } = useAction(demoteToStaffAction, {
    onSuccess: () => toast.success(`${userName} demoted to Staff`),
    onError: ({ error }) => toast.error(error.serverError || "Failed to demote"),
  });

  const isPending = promoteStatus === "executing" || demoteStatus === "executing";

  if (members.length === 0) {
    return <span className="text-xs text-muted-foreground">No org assigned</span>;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Role Actions for {userName}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {members.map((member) => (
          <div key={member.id}>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              {member.organization.name}
            </DropdownMenuLabel>
            {member.role !== "admin" && member.role !== "owner" ? (
              <DropdownMenuItem
                onClick={() =>
                  promote({ userId, organizationId: member.organization.id })
                }
              >
                <ArrowUpCircle className="mr-2 size-4 text-emerald-500" />
                Promote to Admin
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={() =>
                  demote({ userId, organizationId: member.organization.id })
                }
              >
                <ArrowDownCircle className="mr-2 size-4 text-amber-500" />
                Demote to Staff
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
