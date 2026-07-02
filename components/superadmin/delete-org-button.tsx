"use client";
// ============================================================
// components/superadmin/delete-org-button.tsx
// ============================================================

import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { deleteOrganizationAction } from "@/actions/superadmin/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";

export function DeleteOrganizationButton({
  orgId,
  orgName,
}: {
  orgId: string;
  orgName: string;
}) {
  const [open, setOpen] = useState(false);

  const { execute, status } = useAction(deleteOrganizationAction, {
    onSuccess: () => {
      toast.success(`"${orgName}" deleted`);
      setOpen(false);
    },
    onError: ({ error }) => {
      toast.error(error.serverError || "Failed to delete organization");
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
          <Trash2 className="size-3.5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Organization</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete <strong>{orgName}</strong>? This will
            also remove all member records. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={status === "executing"}
            onClick={() => execute({ organizationId: orgId })}
          >
            {status === "executing" ? "Deleting..." : "Delete Organization"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
