"use server";
// ============================================================
// actions/admin/staff.ts — Org Admin Staff Actions
// ============================================================
//
// Org Admins can:
// - List staff in THEIR organization only (data isolation!)
// - Add new staff to their organization
// - Promote staff → admin within their organization
// - Demote admin → staff within their organization
//
// KEY SECURITY PRINCIPLE — DATA ISOLATION:
// Every action verifies that the logged-in admin actually belongs
// to the target organization. This prevents an admin from Org A
// from managing users in Org B!
// ============================================================

import { z } from "zod";
import { adminAction } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { updateStaffSchema } from "@/lib/validations";

// ── Helper: Get admin's organization ─────────────────────────
// Finds which organization the logged-in admin belongs to.
// Returns the organization ID for data scoping.
async function getAdminOrganization(userId: string) {
  const membership = await prisma.member.findFirst({
    where: {
      userId,
      role: { in: ["admin"] },
    },
  });

  if (!membership) {
    throw new Error("You are not an admin of any organization.");
  }

  return membership;
}

// ── List Org Staff ──────────────────────────────────────────
// Admin sees ONLY their org's staff (not other orgs!)

// export const listOrgStaffAction = adminAction
//   .schema(
//     z.object({
//       search: z.string().optional(),
//     })
//   )
//   .action(async ({ parsedInput, ctx }) => {
//     // Get the admin's organization first
//     const adminMembership = await getAdminOrganization(ctx.user.id);

//     // List members of ONLY this organization
//     const members = await prisma.member.findMany({
//       where: {
//         organizationId: adminMembership.organizationId,
//         // Exclude the admin themselves from the list
//         NOT: { userId: ctx.user.id },
//         ...(parsedInput.search
//           ? {
//               user: {
//                 OR: [
//                   { name: { contains: parsedInput.search, mode: "insensitive" } },
//                   { email: { contains: parsedInput.search, mode: "insensitive" } },
//                 ],
//               },
//             }
//           : {}),
//       },
//       include: {
//         user: {
//           select: {
//             id: true,
//             name: true,
//             email: true,
//             role: true,
//             createdAt: true,
//           },
//         },
//       },
//       orderBy: { createdAt: "desc" },
//     });

//     return {
//       members,
//       organization: adminMembership.organizationId,
//     };
//   });

// ── Add Staff to Org ────────────────────────────────────────
// Admin adds a new staff member to their organization
export const addStaffToOrgAction = adminAction
  .schema(
    z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email address"),
      password: z.string().min(8, "Password must be at least 8 characters"),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { name, email, password } = parsedInput;

    // Get admin's organization
    const adminMembership = await getAdminOrganization(ctx.user.id);

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // User exists — check if already in this org
      const alreadyMember = await prisma.member.findFirst({
        where: {
          userId: existing.id,
          organizationId: adminMembership.organizationId,
        },
      });

      if (alreadyMember) {
        throw new Error("This user is already a member of your organization.");
      }

      // Add existing user to this org as staff
      await prisma.member.create({
        data: {
          userId: existing.id,
          organizationId: adminMembership.organizationId,
          role: "member",
        },
      });

      revalidatePath("/admin/staff");
      return { success: true, message: "Existing user added to your organization." };
    }

    // Create new user using Better Auth (hashes password properly)
    const result = await auth.api.createUser({
      body: {
        name,
        email,
        password,
      },
    });

    if (!result?.user) {
      throw new Error("Failed to create user.");
    }

    // Add to organization as staff (member)
    await prisma.member.create({
      data: {
        userId: result.user.id,
        organizationId: adminMembership.organizationId,
        role: "member",
      },
    });

    revalidatePath("/admin/staff");
    return { success: true, user: result.user };
  });

// ── Promote Staff to Admin ──────────────────────────────────
// Admin promotes a staff member to admin IN THEIR ORG ONLY
export const promoteStaffToAdminAction = adminAction
  .schema(
    z.object({
      memberId: z.string().min(1),
      userId: z.string().min(1),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { memberId, userId } = parsedInput;

    // Get admin's organization (for isolation)
    const adminMembership = await getAdminOrganization(ctx.user.id);

    // Verify this member is in the admin's org
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: adminMembership.organizationId,
        userId,
      },
    });

    if (!member) {
      throw new Error("Member not found in your organization.");
    }

    // Promote in org
    await prisma.member.update({
      where: { id: memberId },
      data: { role: "admin" },
    });

    // Update global user role
    await prisma.user.update({
      where: { id: userId },
      data: { role: "admin" },
    });

    revalidatePath("/admin/staff");
    return { success: true };
  });

// ── Demote Admin to Staff ───────────────────────────────────
// Admin demotes an admin back to staff IN THEIR ORG ONLY
export const demoteAdminToStaffAction = adminAction
  .schema(
    z.object({
      memberId: z.string().min(1),
      userId: z.string().min(1),
    })
  )
  .action(async ({ parsedInput, ctx }) => {
    const { memberId, userId } = parsedInput;

    // Get admin's organization
    const adminMembership = await getAdminOrganization(ctx.user.id);

    // Verify this member is in the admin's org
    const member = await prisma.member.findFirst({
      where: {
        id: memberId,
        organizationId: adminMembership.organizationId,
        userId,
      },
    });

    if (!member) {
      throw new Error("Member not found in your organization.");
    }

    // Demote in org
    await prisma.member.update({
      where: { id: memberId },
      data: { role: "member" },
    });

    // Check if user is admin in any OTHER org before downgrading global role
    const otherAdminMemberships = await prisma.member.findFirst({
      where: {
        userId,
        role: "admin",
        NOT: { organizationId: adminMembership.organizationId },
      },
    });

    if (!otherAdminMemberships) {
      await prisma.user.update({
        where: { id: userId },
        data: { role: "member" },
      });
    }

    revalidatePath("/admin/staff");
    return { success: true };
  });

// ── Remove Staff from Org ────────────────────────────────────
// Admin removes a staff member from their organization
export const removeStaffFromOrgAction = adminAction
  .schema(z.object({ memberId: z.string().min(1) }))
  .action(async ({ parsedInput, ctx }) => {
    const adminMembership = await getAdminOrganization(ctx.user.id);

    // Verify the member belongs to admin's org
    const member = await prisma.member.findFirst({
      where: {
        id: parsedInput.memberId,
        organizationId: adminMembership.organizationId,
      },
    });

    if (!member) {
      throw new Error("Member not found in your organization.");
    }

    await prisma.member.delete({
      where: { id: parsedInput.memberId },
    });

    revalidatePath("/admin/staff");
    return { success: true };
  });

// ── Update Staff Member ──────────────────────────────────────

export const updateStaffAction = adminAction
  .schema(updateStaffSchema)
  .action(async ({ parsedInput, ctx }) => {
    const { id, name, email, password } = parsedInput;

    const adminMembership = await getAdminOrganization(ctx.user.id);

    const member = await prisma.member.findFirst({
      where: {
        userId: id,
        organizationId: adminMembership.organizationId,
      },
    });

    if (!member) {
      throw new Error("This user is not a member of your organization.");
    }

    const existing = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id },
      },
    });
    if (existing) {
      throw new Error(`A user with email "${email}" already exists.`);
    }

    await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
      },
    });

    if (password) {
      await auth.api.setUserPassword({
        body: {
          userId: id,
          newPassword: password,
        },
      });
    }

    revalidatePath("/admin/staff");
    return { success: true };
  });
