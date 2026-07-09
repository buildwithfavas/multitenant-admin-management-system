import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { LogOut, User, Building, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "@/components/shared/sign-out-button";

export default async function StaffLayout({ children, }: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const membership = await prisma.member.findFirst({
        where: {
            userId: session.user.id,
            role: "member",
        },
        include: {
            organization: true,
        },
    });

    const organization = membership?.organization;
    const initials = session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (<div className="flex flex-col min-h-screen bg-muted/40">
      
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Building className="size-4 text-blue-600 dark:text-blue-400"/>
          </div>
          <div>
            <p className="font-bold text-sm leading-none">
              {organization?.name || "No Organization Assigned"}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Staff Portal</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-sm font-medium leading-none">{session.user.name}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{session.user.email}</span>
            </div>
          </div>
          <SignOutButton />
        </div>
      </header>
      
      <main className="flex-grow p-6 lg:p-8">
        {children}
      </main>
    </div>);
}
