"use client";
// ============================================================
// components/admin/staff-table.tsx — Staff Management Table (Org Admin)
// ============================================================
// Client Component utilizing next-safe-action hooks to execute
// promote, demote, and remove actions securely.
// ============================================================

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import {
  promoteStaffToAdminAction,
  demoteAdminToStaffAction,
  removeStaffFromOrgAction,
} from "@/actions/admin/staff";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
import { MoreHorizontal, ArrowUpCircle, ArrowDownCircle, UserMinus } from "lucide-react";
import { useState } from "react";

interface MemberWithUser {
  id: string;
  role: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: Date;
  };
}

interface Props {
  members: MemberWithUser[];
}

export function StaffTable({ members }: Props) {
  const [selectedMember, setSelectedMember] = useState<MemberWithUser | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  // ── Promote Action ──────────────────────────────────────────
  const { execute: promote, status: promoteStatus } = useAction(
    promoteStaffToAdminAction,
    {
      onSuccess: () => toast.success("Staff member promoted to admin"),
      onError: ({ error }) => toast.error(error.serverError || "Failed to promote"),
    }
  );

  // ── Demote Action ───────────────────────────────────────────
  const { execute: demote, status: demoteStatus } = useAction(
    demoteAdminToStaffAction,
    {
      onSuccess: () => toast.success("Admin demoted back to staff"),
      onError: ({ error }) => toast.error(error.serverError || "Failed to demote"),
    }
  );

  // ── Remove Action ───────────────────────────────────────────
  const { execute: remove, status: removeStatus } = useAction(
    removeStaffFromOrgAction,
    {
      onSuccess: () => {
        toast.success("Staff member removed from organization");
        setDeleteOpen(false);
      },
      onError: ({ error }) => toast.error(error.serverError || "Failed to remove staff"),
    }
  );

  const isPending =
    promoteStatus === "executing" ||
    demoteStatus === "executing" ||
    removeStatus === "executing";

  function handleRemoveClick(member: MemberWithUser) {
    setSelectedMember(member);
    setDeleteOpen(true);
  }

  function getOrgRoleBadgeVariant(role: string) {
    switch (role) {
      case "admin":
      case "owner":
        return "default" as const;
      default:
        return "secondary" as const;
    }
  }

  return (
    <div>
      {members.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No staff members found in this organization.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Organization Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.user.name}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {member.user.email}
                </TableCell>
                <TableCell>
                  <Badge variant={getOrgRoleBadgeVariant(member.role)}>
                    {member.role === "admin" ? "Org Admin" : "Staff"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" disabled={isPending}>
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {member.role !== "admin" && member.role !== "owner" ? (
                        <DropdownMenuItem
                          onClick={() =>
                            promote({ memberId: member.id, userId: member.userId })
                          }
                        >
                          <ArrowUpCircle className="mr-2 size-4 text-emerald-500" />
                          Promote to Admin
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() =>
                            demote({ memberId: member.id, userId: member.userId })
                          }
                        >
                          <ArrowDownCircle className="mr-2 size-4 text-amber-500" />
                          Demote to Staff
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:bg-destructive/10"
                        onClick={() => handleRemoveClick(member)}
                      >
                        <UserMinus className="mr-2 size-4 text-destructive" />
                        Remove from Org
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Delete/Remove Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{selectedMember?.user.name}</strong> from
              this organization? They will no longer have access to this tenant&apos;s resources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() => {
                if (selectedMember) {
                  remove({ memberId: selectedMember.id });
                }
              }}
            >
              {removeStatus === "executing" ? "Removing..." : "Remove Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
