"use server";
// ============================================================
// actions/superadmin/organization.ts — Super Admin Org Actions
// ============================================================
//
// WHAT ARE THESE?
// These are "server actions" — functions that run on the SERVER
// but can be called from client components (like form submissions).
//
// SECURITY MODEL:
// Every action uses `superAdminAction` which means:
// 1. The user MUST be logged in (otherwise → error)
// 2. The user MUST have role === "superadmin" (otherwise → error)
// 3. The inputs are validated by Zod (otherwise → error)
// All three checks happen BEFORE your code runs!
//
// HOW TO USE IN A COMPONENT:
//   const { execute, result, status } = useAction(createOrganizationAction);
//   <form onSubmit={() => execute({ name: "Acme Corp", slug: "acme-corp" })}>
// ============================================================

import { z } from "zod";
import { superAdminAction } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { orgSchema } from "@/lib/validations";



// ── Create Organization ─────────────────────────────────────
// Super Admin creates a new organization (company/tenant)
export const createOrganizationAction = superAdminAction
  .schema(orgSchema)
  .action(async ({ parsedInput }) => {
    const { name, slug, logo } = parsedInput;

    // Check if slug is already taken
    const existing = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new Error(`An organization with slug "${slug}" already exists.`);
    }

    // Create the organization
    const organization = await prisma.organization.create({
      data: {
        name,
        slug,
        logo: logo || null,
      },
    });

    // Refresh the organizations list page
    revalidatePath("/superadmin/organizations");

    return { success: true, organization };
  });

// ── List All Organizations ──────────────────────────────────
// Super Admin views all organizations in the system
export const listOrganizationsAction = superAdminAction
  .schema(z.object({}))
  .action(async () => {
    const organizations = await prisma.organization.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        // Count members in each org
        _count: {
          select: { members: true },
        },
      },
    });

    return { organizations };
  });

// ── Delete Organization ─────────────────────────────────────
// Super Admin deletes an organization (cascades to members)
export const deleteOrganizationAction = superAdminAction
  .schema(
    z.object({
      organizationId: z.string().min(1, "Organization ID required"),
    })
  )
  .action(async ({ parsedInput }) => {
    await prisma.organization.delete({
      where: { id: parsedInput.organizationId },
    });

    revalidatePath("/superadmin/organizations");
    return { success: true };
  });
