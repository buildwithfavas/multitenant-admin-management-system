"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
export function SignOutButton() {
    const router = useRouter();
    const [isPending, setIsPending] = useState(false);
    async function handleSignOut() {
        setIsPending(true);
        try {
            await authClient.signOut({
                fetchOptions: {
                    onSuccess: () => {
                        toast.success("Signed out successfully");
                        router.push("/login");
                    },
                    onError: () => {
                        toast.error("Failed to sign out");
                        setIsPending(false);
                    },
                },
            });
        }
        catch {
            toast.error("An unexpected error occurred during sign out");
            setIsPending(false);
        }
    }
    return (<Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2 font-medium" onClick={handleSignOut} disabled={isPending}>
      <LogOut className="size-4"/>
      <span className="hidden sm:inline">Sign Out</span>
    </Button>);
}
