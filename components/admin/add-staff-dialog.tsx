"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { AddStaffForm } from "./add-staff-form";
export function AddStaffDialog() {
    const [open, setOpen] = useState(false);
    return (<>
      <Button onClick={() => setOpen(true)}>
        <Plus className="mr-2 size-4"/>
        Add Staff Member
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="pt-2">
            <AddStaffForm onSuccess={() => setOpen(false)}/>
          </div>
        </DialogContent>
      </Dialog>
    </>);
}
