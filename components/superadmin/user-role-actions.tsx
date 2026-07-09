"use client";
import { demoteToStaffAction, promoteToAdminAction, deleteUserAction } from "@/actions/superadmin/user";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { ArrowDownCircle, ArrowUpCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";
import { EditUserForm } from "./edit-user-form";
interface Member {
    id: string;
    role: string;
    organization: {
        id: string;
        name: string;
    };
}
interface Props {
    userId: string;
    userName: string;
    userEmail: string;
    members: Member[];
    organizations: {
        id: string;
        name: string;
    }[];
}
export function UserRoleActions({ userId, userName, userEmail, members, organizations }: Props) {
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
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
    const isPending = promoteStatus === "executing" ||
        demoteStatus === "executing" ||
        deleteStatus === "executing";
    const firstMembership = members[0];
    const userProps = {
        id: userId,
        name: userName,
        email: userEmail,
        orgRole: (firstMembership?.role as "admin" | "member") || "member",
        organizationId: firstMembership?.organization.id || "",
    };
    return (<>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isPending}>
            <MoreHorizontal className="size-4"/>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Actions for {userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 size-4 text-muted-foreground"/>
            Edit User
          </DropdownMenuItem>

          {members.length > 0 && <DropdownMenuSeparator />}

          {members.map((member) => (<div key={member.id}>
              <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                {member.organization.name}
              </DropdownMenuLabel>
              {member.role !== "admin" && member.role !== "owner" ? (<DropdownMenuItem onClick={() => promote({ userId, organizationId: member.organization.id })}>
                  <ArrowUpCircle className="mr-2 size-4 text-emerald-500"/>
                  Promote to Admin
                </DropdownMenuItem>) : (<DropdownMenuItem onClick={() => demote({ userId, organizationId: member.organization.id })}>
                  <ArrowDownCircle className="mr-2 size-4 text-amber-500"/>
                  Demote to Staff
                </DropdownMenuItem>)}
              <DropdownMenuSeparator />
            </div>))}

          <DropdownMenuItem className="text-destructive focus:bg-destructive/10" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="mr-2 size-4 text-destructive"/>
            Delete User
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <EditUserForm user={userProps} organizations={organizations} onSuccess={() => setEditOpen(false)}/>
          </div>
        </DialogContent>
      </Dialog>

      
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
            <Button variant="destructive" disabled={isPending} onClick={() => deleteUser({ userId })}>
              {deleteStatus === "executing" ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>);
}
