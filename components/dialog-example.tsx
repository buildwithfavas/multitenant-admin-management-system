"use client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { SettingsIcon } from "lucide-react";
export const DialogExample = () => {
    const [open, setOpen] = useState(false);
    return (<>
      <Button onClick={() => {
            setOpen(!open);
        }}>
        Open Dialog
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost">
            
            <SettingsIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => setOpen(!open)}>
            Open Dialog
          </DropdownMenuItem>{" "}
          
        </DropdownMenuContent>
      </DropdownMenu>

      
      <Dialog open={open} onOpenChange={setOpen}>
        
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
              
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>);
};
