"use client";
// components/superadmin/user-role-actions.tsx — Role promote/demote buttons

import { demoteToStaffAction, promoteToAdminAction, deleteUserAction } from "@/actions/superadmin/user";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

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
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { execute: promote, status: promoteStatus } = useAction(promoteToAdminAction, {
    onSuccess: () => toast.success(`${userName} promoted to Admin`),
    onError: ({ error }) => toast.error(error.serverError || "Failed to promote"),
  });

  const { execute: demote, status: demoteStatus } = useAction(demoteToStaffAction, {
    onSuccess: () => toast.success(`${userName} demoted to Staff`),
    onError: ({ error }) => toast.error(error.serverError || "Failed to demote"),
  });

  const { execute: deleteUser, status: deleteStatus } = useAction(deleteUserAction, {
    onSuccess: () => {
      toast.success(`${userName} deleted successfully`);
      setDeleteOpen(false);
    },
    onError: ({ error }) => toast.error(error.serverError || "Failed to delete user"),
  });

  const isPending =
    promoteStatus === "executing" ||
    demoteStatus === "executing" ||
    deleteStatus === "executing";

  return (
    <>
      <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isPending}>
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Actions for {userName}</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href={`/superadmin/users/${userId}/edit`}>
            <Pencil className="mr-2 size-4 text-muted-foreground" />
            Edit User
          </Link>
        </DropdownMenuItem>

        {members.length > 0 && <DropdownMenuSeparator />}

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

        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-2 size-4 text-destructive" />
          Delete User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

    {/* Delete Confirmation Dialog */}
    <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete user <strong>{userName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => deleteUser({ userId })}
          >
            {deleteStatus === "executing" ? "Deleting..." : "Delete User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
