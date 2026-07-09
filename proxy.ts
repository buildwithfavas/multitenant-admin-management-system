import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
export const config = {
    matcher: [
        "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
    ],
};
export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const session = await auth.api.getSession({
        headers: request.headers,
    });
    const user = session?.user;
    if (pathname === "/login" || pathname === "/") {
        if (user) {
            return redirectToDashboard(user, request);
        }
        return NextResponse.next();
    }
    if (!user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }
    if (pathname.startsWith("/superadmin")) {
        if (user.role !== "superadmin") {
            return redirectToDashboard(user, request);
        }
    }
    if (pathname.startsWith("/admin")) {
        if (user.role !== "superadmin" && user.role !== "admin") {
            return redirectToDashboard(user, request);
        }
    }
    if (pathname.startsWith("/staff")) {
        if (user.role === "superadmin") {
            return NextResponse.redirect(new URL("/superadmin/dashboard", request.url));
        }
    }
    return NextResponse.next();
}
function redirectToDashboard(user: {
    role?: string | null;
}, request: NextRequest) {
    let dashboardUrl: string;
    switch (user.role) {
        case "superadmin":
            dashboardUrl = "/superadmin/dashboard";
            break;
        case "admin":
            dashboardUrl = "/admin/dashboard";
            break;
        default:
            dashboardUrl = "/staff/dashboard";
            break;
    }
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
}
