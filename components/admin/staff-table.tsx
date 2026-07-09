"use client";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { promoteStaffToAdminAction, demoteAdminToStaffAction, removeStaffFromOrgAction, } from "@/actions/admin/staff";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { MoreHorizontal, ArrowUpCircle, ArrowDownCircle, UserMinus, Pencil } from "lucide-react";
import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/data-table";
import { EditStaffForm } from "./edit-staff-form";
interface MemberWithUser {
    id: string;
    role: string;
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}
interface Props {
    members: MemberWithUser[];
}
function CellAction({ member }: {
    member: MemberWithUser;
}) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const { execute: promote, status: promoteStatus } = useAction(promoteStaffToAdminAction, {
        onSuccess: () => toast.success("Staff member promoted to admin"),
        onError: ({ error }) => toast.error(error.serverError || "Failed to promote"),
    });
    const { execute: demote, status: demoteStatus } = useAction(demoteAdminToStaffAction, {
        onSuccess: () => toast.success("Admin demoted back to staff"),
        onError: ({ error }) => toast.error(error.serverError || "Failed to demote"),
    });
    const { execute: remove, status: removeStatus } = useAction(removeStaffFromOrgAction, {
        onSuccess: () => {
            toast.success("Staff member removed from organization");
            setDeleteOpen(false);
        },
        onError: ({ error }) => toast.error(error.serverError || "Failed to remove staff"),
    });
    const isPending = promoteStatus === "executing" ||
        demoteStatus === "executing" ||
        removeStatus === "executing";
    return (<>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            <MoreHorizontal className="size-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-4 text-muted-foreground"/>
            Edit Staff Member
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {member.role !== "admin" && member.role !== "owner" ? (<DropdownMenuItem onClick={() => promote({ memberId: member.id, userId: member.userId })}>
              <ArrowUpCircle className="mr-2 size-4 text-emerald-500"/>
              Promote to Admin
            </DropdownMenuItem>) : (<DropdownMenuItem onClick={() => demote({ memberId: member.id, userId: member.userId })}>
              <ArrowDownCircle className="mr-2 size-4 text-amber-500"/>
              Demote to Staff
            </DropdownMenuItem>)}

          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
            <UserMinus className="mr-2 size-4 text-destructive"/>
            Remove from Org
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <EditStaffForm user={{
            id: member.user.id,
            name: member.user.name,
            email: member.user.email,
        }} onSuccess={() => setEditOpen(false)}/>
          </div>
        </DialogContent>
      </Dialog>

      
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{member.user.name}</strong> from
              this organization? They will no longer have access to this tenant&apos;s resources.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isPending} onClick={() => remove({ memberId: member.id })}>
              {removeStatus === "executing" ? "Removing..." : "Remove Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
}
export function StaffTable({ members }: Props) {
    function getOrgRoleBadgeVariant(role: string) {
        switch (role) {
            case "admin":
            case "owner":
                return "default" as const;
            default:
                return "secondary" as const;
        }
    }
    const columns: ColumnDef<MemberWithUser>[] = [
        {
            accessorKey: "user.name",
            header: "Name",
            cell: ({ row }) => <span className="font-medium">{row.original.user.name || "N/A"}</span>,
        },
        {
            accessorKey: "user.email",
            id: "email",
            header: "Email",
            cell: ({ row }) => <span className="text-muted-foreground text-sm">{row.original.user.email}</span>,
        },
        {
            accessorKey: "role",
            header: "Organization Role",
            cell: ({ row }) => (<Badge variant={getOrgRoleBadgeVariant(row.original.role)}>
          {row.original.role === "admin" ? "Org Admin" : "Staff"}
        </Badge>),
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => <CellAction member={row.original}/>,
        },
    ];
    return (<div>
      <DataTable columns={columns} data={members} searchKey="email" placeholder="Search staff by email..."/>
    </div>);
}
