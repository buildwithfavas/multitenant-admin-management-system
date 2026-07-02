"use server";
// ============================================================
// actions/superadmin/user.ts — Super Admin User Actions
// ============================================================
//
// Super Admin can:
// - Create any user (admin or staff) in any organization
// - List all users across all organizations
// - Promote staff → admin within an organization
// - Demote admin → staff within an organization
// - Delete users
// ============================================================

import { z } from "zod";
import { superAdminAction } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const userSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      // org-level role: "admin" or "member" (staff)
      orgRole: z.enum(["admin", "member"]).default("member"),
      // Which org to add them to (optional — superadmin might not need an org)
      organizationId: z.string().optional(),
    })

// ── Create User ─────────────────────────────────────────────
// Creates a user and optionally adds them to an organization
export const createUserAction = superAdminAction
  .schema(userSchema)
  .action(async ({ parsedInput }) => {
    const { name, email, password, orgRole, organizationId } = parsedInput;

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error(`A user with email "${email}" already exists.`);
    }

    // Use Better Auth's admin API to create the user
    // This properly hashes the password!
    const result = await auth.api.createUser({
      body: {
        name,
        email,
        password,
        role: orgRole === "admin" ? "admin" : "member", // user-level role
      },
    });

    if (!result?.user) {
      throw new Error("Failed to create user.");
    }

    // If an organization was specified, add them as a member
    if (organizationId) {
      await prisma.member.create({
        data: {
          userId: result.user.id,
          organizationId,
          role: orgRole, // "admin" or "member" in the org
        },
      });
    }

    revalidatePath("/superadmin/users");
    revalidatePath("/superadmin/organizations");

    return { success: true, user: result.user };
  });

// ── List All Users ──────────────────────────────────────────
// Super Admin views ALL users across ALL organizations
export const listAllUsersAction = superAdminAction
  .schema(
    z.object({
      search: z.string().optional(),
    })
  )
  .action(async ({ parsedInput }) => {
    const { search } = parsedInput;

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        // Include org memberships for each user
        members: {
          include: {
            organization: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    return { users };
  });

// ── Promote Staff to Admin (within an org) ───────────────────
// Changes a member's role in an organization from "member" → "admin"
export const promoteToAdminAction = superAdminAction
  .schema(
    z.object({
      userId: z.string().min(1),
      organizationId: z.string().min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    const { userId, organizationId } = parsedInput;

    // Update the member's role in the organization
    await prisma.member.updateMany({
      where: { userId, organizationId },
      data: { role: "admin" },
    });

    // Also update the user's global role to "admin"
    await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });

    revalidatePath("/superadmin/users");
    return { success: true };
  });

// ── Demote Admin to Staff (within an org) ───────────────────
// Changes a member's role in an organization from "admin" → "member"
export const demoteToStaffAction = superAdminAction
  .schema(
    z.object({
      userId: z.string().min(1),
      organizationId: z.string().min(1),
    })
  )
  .action(async ({ parsedInput }) => {
    const { userId, organizationId } = parsedInput;

    // Update the member's role in the organization
    await prisma.member.updateMany({
      where: { userId, organizationId },
      data: { role: "member" },
    });

    // Check if user is admin in ANY other org
    const otherAdminMemberships = await prisma.member.findFirst({
      where: {
        userId,
        role: "admin",
        NOT: { organizationId },
      },
    });

    // If not admin anywhere else, downgrade their global role
    if (!otherAdminMemberships) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "member" },
      });
    }

    revalidatePath("/superadmin/users");
    return { success: true };
  });

// ── Delete User ─────────────────────────────────────────────
export const deleteUserAction = superAdminAction
  .schema(z.object({ userId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    // Prevent super admin from deleting themselves
    if (parsedInput.userId === ctx.user.id) {
      throw new Error("You cannot delete your own account.");
    }

    await prisma.user.delete({
      where: { id: parsedInput.userId },
    });

    revalidatePath("/superadmin/users");
    return { success: true };
  });
