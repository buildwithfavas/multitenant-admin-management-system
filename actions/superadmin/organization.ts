"use server";
import { z } from "zod";
import { superAdminAction } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { orgSchema } from "@/lib/validations";

export const createOrganizationAction = superAdminAction
    .schema(orgSchema)
    .action(async ({ parsedInput }) => {
    const { name, slug, logo } = parsedInput;
    const existing = await prisma.organization.findUnique({
        where: { slug },
    });
    if (existing) {
        throw new Error(`An organization with slug "${slug}" already exists.`);
    }
    const organization = await prisma.organization.create({
        data: {
            name,
            slug,
            logo: logo || null,
        },
    });
    revalidatePath("/superadmin/organizations");
    return { success: true, organization };
});

export const deleteOrganizationAction = superAdminAction
    .schema(z.object({
    organizationId: z.string().min(1, "Organization ID required"),
}))
    .action(async ({ parsedInput }) => {
    await prisma.organization.delete({
        where: { id: parsedInput.organizationId },
    });
    revalidatePath("/superadmin/organizations");
    return { success: true };
});
