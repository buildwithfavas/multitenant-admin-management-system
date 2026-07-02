// ============================================================
// proxy.ts — Route Protection Proxy (Next.js 16)
// ============================================================
//
// WHAT IS PROXY?
// In Next.js 16, the deprecated `middleware` convention is replaced by `proxy`.
//
// WHERE DOES IT RUN?
// It runs on the Node.js runtime by default, meaning we can safely use
// node modules and database clients like Prisma.
//
// WHAT WE DO HERE:
// 1. Check if the user is logged in (has a valid session)
// 2. If NOT logged in → redirect to /login
// 3. If logged in → check their role:
//    - "superadmin" → can access /superadmin/** ✅
//    - "admin" or "member" in an org → can access /admin/** ✅
//    - "member" → can only access /staff/** ✅
//    - Wrong role for a route → redirect to correct dashboard
//
// ROUTE PROTECTION MAP:
//   /superadmin/** → require role === "superadmin"
//   /admin/**      → require org membership with role "admin"|"owner"
//   /staff/**      → require any authenticated user
//   /login         → redirect to dashboard if already logged in
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// ============================================================
// matcher: which routes should proxy run on?
// We skip:
//   - /api/auth/** → Better Auth handles these itself
//   - /_next/**    → Next.js internals (CSS, JS bundles)
//   - /favicon.ico → browser requests this automatically
// ============================================================
export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)",
  ],
};

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Step 1: Get current session ─────────────────────────────
  // Better Auth reads the session cookie from the request headers
  // and looks up the session in the database.
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  const user = session?.user;

  // ── Step 2: Redirect logged-in users away from /login ───────
  // If someone is already logged in and visits /login,
  // send them to their appropriate dashboard instead.
  if (pathname === "/login" || pathname === "/") {
    if (user) {
      return redirectToDashboard(user, request);
    }
    // Not logged in + visiting /login → allow through
    return NextResponse.next();
  }

  // ── Step 3: Protect all other routes ─────────────────────────
  // If trying to access any protected route without being logged in
  if (!user) {
    const loginUrl = new URL("/login", request.url);
    // Save where they were trying to go (for redirect after login)
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ── Step 4: Role-based route protection ──────────────────────

  // SUPERADMIN ROUTES — only superadmin can access
  if (pathname.startsWith("/superadmin")) {
    if (user.role !== "superadmin") {
      // Not a superadmin → redirect to their correct dashboard
      return redirectToDashboard(user, request);
    }
  }

  // ADMIN ROUTES — org admins (and superadmin for testing)
  if (pathname.startsWith("/admin")) {
    if (user.role !== "superadmin" && user.role !== "admin") {
      return redirectToDashboard(user, request);
    }
  }

  // STAFF ROUTES — any logged-in user can access their staff dashboard
  if (pathname.startsWith("/staff")) {
    // Even admins can access /staff (they can see their own dashboard)
    // But redirect superadmin to their proper dashboard
    if (user.role === "superadmin") {
      return NextResponse.redirect(new URL("/superadmin/dashboard", request.url));
    }
  }

  // ── Step 5: Allow through ────────────────────────────────────
  return NextResponse.next();
}

// ── Helper: redirect user to their role's dashboard ─────────
function redirectToDashboard(user: { role?: string | null }, request: NextRequest) {
  let dashboardUrl: string;

  switch (user.role) {
    case "superadmin":
      dashboardUrl = "/superadmin/dashboard";
      break;
    case "admin":
      dashboardUrl = "/admin/dashboard";
      break;
    default:
      // "member" or any other role → staff dashboard
      dashboardUrl = "/staff/dashboard";
      break;
  }

  return NextResponse.redirect(new URL(dashboardUrl, request.url));
}
