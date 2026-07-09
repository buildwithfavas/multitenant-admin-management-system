import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Page() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        redirect("/login");
    }
    if (session.user.role === "superadmin") {
        redirect("/superadmin/dashboard");
    }
    else if (session.user.role === "admin") {
        redirect("/admin/dashboard");
    }
    else {
        redirect("/staff/dashboard");
    }
}
