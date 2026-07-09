"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";
import { LayoutDashboard, Users, LogOut, Building, ChevronRight, } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
const navItems = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Staff Members",
        href: "/admin/staff",
        icon: Users,
    },
];
interface User {
    name: string;
    email: string;
    role?: string | null;
}
interface Organization {
    id: string;
    name: string;
    slug: string;
}
export function AdminSidebar({ user, organization, }: {
    user: User;
    organization: Organization;
}) {
    const pathname = usePathname();
    const router = useRouter();
    async function handleSignOut() {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Signed out successfully");
                    router.push("/login");
                },
            },
        });
    }
    const initials = user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    return (<aside className="flex flex-col w-64 border-r bg-card/50 backdrop-blur shrink-0">
      
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Building className="size-5 text-emerald-600 dark:text-emerald-400"/>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm tracking-tight truncate">
              {organization.name}
            </p>
            <p className="text-xs text-muted-foreground truncate">Org Admin Panel</p>
          </div>
        </div>
      </div>

      
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (<Link key={item.href} href={item.href} className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150", isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground")}>
              <item.icon className="size-4 shrink-0"/>
              <span className="flex-1">{item.label}</span>
              {isActive && <ChevronRight className="size-3 opacity-60"/>}
            </Link>);
        })}
      </nav>

      <Separator />

      
      <div className="p-3">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors mb-2">
          <Avatar className="size-8">
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
        <Separator />
        <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2" onClick={handleSignOut}>
          <LogOut className="size-4"/>
          Sign Out
        </Button>
      </div>
    </aside>);
}
