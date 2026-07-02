// ============================================================
// lib/safe-action.ts — next-safe-action Client Setup
// ============================================================
//
// WHAT IS NEXT-SAFE-ACTION?
// next-safe-action is a library that makes server actions:
//   1. Type-safe (TypeScript knows input & output types)
//   2. Validated (Zod schemas validate inputs before your code runs)
//   3. Authenticated (middleware checks if user is logged in)
//   4. Permission-checked (middleware enforces role requirements)
//
// HOW IT WORKS:
// Instead of writing raw server actions like:
//   "use server"
//   async function createUser(data: unknown) { ... }
//
// You define actions using an "action client":
//   export const createUserAction = superAdminAction
//     .schema(createUserSchema)   ← Zod validation
//     .action(async ({ parsedInput, ctx }) => {
//       // parsedInput is type-safe!
//       // ctx.user has the authenticated user
//       ...
//     });
//
// THREE ACTION CLIENTS:
// 1. publicAction     → No auth required (not used in our app)
// 2. protectedAction  → Requires login
// 3. superAdminAction → Requires login + superadmin role
// 4. adminAction      → Requires login + admin or superadmin role
// ============================================================

import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

// ── Error Handling ──────────────────────────────────────────
// A custom error class for action-level errors
export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

// ── Base Action Client ──────────────────────────────────────
// The base client that all other clients extend.
// Handles error formatting for client-side consumption.
const actionClient = createSafeActionClient({
  handleServerError: (e) => {
    // In production, don't leak internal error details
    if (e instanceof ActionError) {
      return e.message;
    }
    console.error("Unexpected server action error:", e);
    return "An unexpected error occurred. Please try again.";
  },
});

// ── Protected Action Client ─────────────────────────────────
// Requires the user to be logged in.
// ctx.user = the authenticated user object
export const protectedAction = actionClient.use(async ({ next }) => {
  // Get the session from the incoming request headers
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If no session, throw an error (middleware usually catches this,
  // but this is a safety net for direct action calls)
  if (!session?.user) {
    throw new ActionError("You must be logged in to perform this action.");
  }

  // Pass the user to the action's `ctx` parameter
  return next({
    ctx: {
      user: session.user,
      session: session.session,
    },
  });
});

// ── Super Admin Action Client ───────────────────────────────
// Requires login AND the "superadmin" role.
// Only the Super Admin can call these actions.
export const superAdminAction = protectedAction.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "superadmin") {
    throw new ActionError(
      "Access denied. Super Admin privileges required."
    );
  }
  return next({ ctx });
});

// ── Admin Action Client ─────────────────────────────────────
// Requires login AND either "admin" or "superadmin" role.
// Org Admins and Super Admins can call these actions.
export const adminAction = protectedAction.use(async ({ next, ctx }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
    throw new ActionError(
      "Access denied. Admin privileges required."
    );
  }
  return next({ ctx });
});
