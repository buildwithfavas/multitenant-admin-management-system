"use client";
// ============================================================
// lib/auth-client.ts — Better Auth Client Configuration
// ============================================================
//
// WHAT IS THIS FILE?
// While lib/auth.ts runs on the SERVER, this file runs in the BROWSER.
// It provides React hooks and functions you use in client components to:
//   - Get the current logged-in user: useSession()
//   - Sign in: authClient.signIn.email()
//   - Sign out: authClient.signOut()
//   - Organization operations: authClient.organization.create()
//   - Admin operations: authClient.admin.createUser()
//
// NOTE: This file has "use client" at the top, meaning this code
// is only sent to the browser, never runs on the server.
//
// HOW IT CONNECTS TO THE SERVER:
// When you call authClient.signIn.email({ email, password }),
// it makes an HTTP request to /api/auth/sign-in
// → which is handled by app/api/auth/[...all]/route.ts
// → which calls auth.handler() from lib/auth.ts
// → which checks the database and returns a session
// ============================================================

import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  // The base URL of your Next.js app
  // The client will make requests to: http://localhost:3000/api/auth/*
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  plugins: [
    // ── Admin Client Plugin ───────────────────────────────────
    // Adds admin functions to authClient:
    //   authClient.admin.createUser()
    //   authClient.admin.setRole()
    //   authClient.admin.banUser()
    //   authClient.admin.listUsers()
    adminClient(),

    // ── Organization Client Plugin ────────────────────────────
    // Adds organization functions to authClient:
    //   authClient.organization.create()
    //   authClient.organization.list()
    //   authClient.organization.addMember()
    //   authClient.organization.removeMember()
    //   authClient.organization.updateMemberRole()
    organizationClient(),
  ],
});

// ============================================================
// CONVENIENCE EXPORTS
// ============================================================
// Export commonly used hooks and functions directly
// so you don't have to write `authClient.useSession` everywhere.
//
// Usage in a component:
//   import { useSession, signOut } from "@/lib/auth-client";
//   const { data: session } = useSession();
// ============================================================

export const { useSession, signIn, signOut, useActiveOrganization } =
  authClient;

// Export the full client for advanced usage
export default authClient;
