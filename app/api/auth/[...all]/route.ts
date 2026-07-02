// ============================================================
// app/api/auth/[...all]/route.ts — Better Auth API Route Handler
// ============================================================
//
// WHAT IS THIS FILE?
// This is a special Next.js "catch-all" route that handles ALL
// Better Auth HTTP requests. The [...all] in the folder name
// means it matches any path under /api/auth/.
//
// EXAMPLES of requests it handles:
//   POST /api/auth/sign-in/email     → Login with email/password
//   POST /api/auth/sign-up/email     → Register new account
//   POST /api/auth/sign-out          → Logout
//   GET  /api/auth/session           → Get current session
//   POST /api/auth/admin/create-user → Create user (admin only)
//   POST /api/auth/organization/create → Create org (admin only)
//   ... and many more!
//
// HOW IT WORKS:
// Better Auth provides a `handler` function that processes
// all these requests. We export it as both GET and POST
// because different auth operations use different HTTP methods.
//
// WHY KEEP IT SIMPLE?
// We don't need any custom logic here! Better Auth handles
// everything — validation, database queries, session management.
// Our config in lib/auth.ts tells it what to do.
// ============================================================

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Better Auth provides a helper to convert its handler
// to the format Next.js App Router expects.
// This exports GET and POST functions that Next.js will call
// when requests come in to /api/auth/*.
export const { GET, POST } = toNextJsHandler(auth);
