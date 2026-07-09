"use server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminAction } from "@/lib/safe-action";
import { updateStaffSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { z } from "zod";

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

export const listOrgStaffAction = adminAction
    .schema(z.object({
        search: z.string().optional(),
    }))
    .action(async ({ parsedInput, ctx }) => {
        const adminMembership = await getAdminOrganization(ctx.user.id);
        const members = await prisma.member.findMany({
            where: {
                organizationId: adminMembership.organizationId,
                NOT: { userId: ctx.user.id },
                ...(parsedInput.search
                    ? {
                        user: {
                            OR: [
                                {
                                    name: { contains: parsedInput.search, mode: "insensitive" },
                                },
                                {
                                    email: {
                                        contains: parsedInput.search,
                                        mode: "insensitive",
                                    },
                                },
                            ],
                        },
                    }
                    : {}),
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });
        return {
            members,
            organization: adminMembership.organizationId,
        };
    });

export const addStaffToOrgAction = adminAction
    .schema(z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(8, "Password must be at least 8 characters"),
    }))
    .action(async ({ parsedInput, ctx }) => {
        const { name, email, password } = parsedInput;
        const adminMembership = await getAdminOrganization(ctx.user.id);
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            const alreadyMember = await prisma.member.findFirst({
                where: {
                    userId: existing.id,
                    organizationId: adminMembership.organizationId,
                },
            });
            if (alreadyMember) {
                throw new Error("This user is already a member of your organization.");
            }
            await prisma.member.create({
                data: {
                    userId: existing.id,
                    organizationId: adminMembership.organizationId,
                    role: "member",
                },
            });
            revalidatePath("/admin/staff");
            return {
                success: true,
                message: "Existing user added to your organization.",
            };
        }
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

export const promoteStaffToAdminAction = adminAction
    .schema(z.object({
        memberId: z.string().min(1),
        userId: z.string().min(1),
    }))
    .action(async ({ parsedInput, ctx }) => {
        const { memberId, userId } = parsedInput;
        const adminMembership = await getAdminOrganization(ctx.user.id);
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
        await prisma.member.update({
            where: { id: memberId },
            data: { role: "admin" },
        });
        await prisma.user.update({
            where: { id: userId },
            data: { role: "admin" },
        });
        revalidatePath("/admin/staff");
        return { success: true };
    });
export const demoteAdminToStaffAction = adminAction
    .schema(z.object({
        memberId: z.string().min(1),
        userId: z.string().min(1),
    }))
    .action(async ({ parsedInput, ctx }) => {
        const { memberId, userId } = parsedInput;
        const adminMembership = await getAdminOrganization(ctx.user.id);
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
        await prisma.member.update({
            where: { id: memberId },
            data: { role: "member" },
        });
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

export const removeStaffFromOrgAction = adminAction
    .schema(z.object({ memberId: z.string().min(1) }))
    .action(async ({ parsedInput, ctx }) => {
        const adminMembership = await getAdminOrganization(ctx.user.id);
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
