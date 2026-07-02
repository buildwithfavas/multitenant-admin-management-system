// ============================================================
// lib/auth.ts — Better Auth Server Configuration
// ============================================================
//
// WHAT IS THIS FILE?
// This is the HEART of our authentication system.
// Better Auth reads this configuration to know:
//   - Where to store sessions (our PostgreSQL database via Prisma)
//   - Which login methods are allowed (email + password)
//   - Which plugins to enable (admin + organization)
//   - What the roles and permissions are
//
// WHY "SERVER ONLY"?
// This file contains secrets (BETTER_AUTH_SECRET) and database
// access. It should NEVER be imported in client components!
// The `server-only` package causes a build error if you try to.
//
// HOW IT'S USED:
// - API route: app/api/auth/[...all]/route.ts  ← handles auth requests
// - Middleware: middleware.ts                   ← reads sessions
// - Server Actions: actions/**/*.ts            ← checks permissions
// ============================================================

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  // ── Database ───────────────────────────────────────────────
  // Tell Better Auth to use our PostgreSQL database via Prisma.
  // This is where users, sessions, and org data are stored.
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // ── Base URL ───────────────────────────────────────────────
  // The URL where your app is running.
  // Better Auth uses this for redirect URLs after login/logout.
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",

  // ── Secret ─────────────────────────────────────────────────
  // A secret key used to sign/encrypt session tokens.
  // Keep this PRIVATE — anyone with this can forge sessions!
  secret: process.env.BETTER_AUTH_SECRET,

  // ── Email + Password Login ─────────────────────────────────
  // Enable the classic email/password authentication method.
  // Better Auth handles:
  //   - Password hashing (bcrypt)
  //   - Sign up, sign in, sign out
  //   - Password validation
  emailAndPassword: {
    enabled: true,
    // Minimum password length
    minPasswordLength: 8,
    // We don't need email verification for this internal tool
    requireEmailVerification: false,
  },

  // ── Session ────────────────────────────────────────────────
  // Control how long sessions last.
  session: {
    // Session expires after 7 days of inactivity
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    // Refresh the session if user was active in the last day
    updateAge: 60 * 60 * 24, // 1 day
    // Cookie settings
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache session in cookie for 5 minutes
    },
  },

  // ── Plugins ────────────────────────────────────────────────
  // Plugins extend Better Auth with extra features.
  // We use TWO plugins:
  //
  // 1. admin plugin: Adds role-based access control
  //    - Adds `role` field to User table
  //    - Provides admin.createUser(), admin.setRole(), etc.
  //
  // 2. organization plugin: Adds multi-tenancy
  //    - Adds Organization, Member, Invitation tables
  //    - Provides organization.create(), member.update(), etc.
  plugins: [
    // ── Admin Plugin ─────────────────────────────────────────
    admin({
      // Default role when a new user signs up
      defaultRole: "member",

      // Which roles count as "admins" who can use admin functions?
      // "superadmin" → our Super Admin
      // "admin"      → we also let org admins use some admin functions
      adminRoles: ["superadmin", "admin"],
      roles: {
        superadmin: adminAc,
        admin: adminAc,
        member: userAc,
      },
    }),

    // ── Organization Plugin ──────────────────────────────────
    organization({
      // Can regular users create organizations?
      // NO — only the Super Admin creates orgs in our system
      allowUserToCreateOrganization: false,

      // Organization roles and their permissions
      // Better Auth org plugin has: owner > admin > member
      // We map:
      //   owner  → used only by superadmin when creating orgs
      //   admin  → Org Admin
      //   member → Staff
    }),
  ],

  // ── Trusted Origins ────────────────────────────────────────
  // Which domains can make auth requests?
  // This prevents CSRF attacks from other websites.
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ],
});

// ============================================================
// EXPORTED TYPES
// ============================================================
// These types are inferred from your auth config.
// TypeScript uses them to know exactly what fields your
// user and session objects have.
// ============================================================
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
