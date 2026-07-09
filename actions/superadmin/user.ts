"use server";
import { z } from "zod";
import { superAdminAction } from "@/lib/safe-action";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { userSchema, updateUserSchema } from "@/lib/validations";

export const createUserAction = superAdminAction
    .schema(userSchema)
    .action(async ({ parsedInput }) => {
    const { name, email, password, orgRole, organizationId } = parsedInput;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        throw new Error(`A user with email "${email}" already exists.`);
    }
    const result = await auth.api.createUser({
        body: {
            name,
            email,
            password,
            role: orgRole === "admin" ? "admin" : "member",
        },
    });
    if (!result?.user) {
        throw new Error("Failed to create user.");
    }
    if (organizationId) {
        await prisma.member.create({
            data: {
                userId: result.user.id,
                organizationId,
                role: orgRole,
            },
        });
    }
    revalidatePath("/superadmin/users");
    revalidatePath("/superadmin/organizations");
    return { success: true, user: result.user };
});

export const promoteToAdminAction = superAdminAction
    .schema(z.object({
    userId: z.string().min(1),
    organizationId: z.string().min(1),
}))
    .action(async ({ parsedInput }) => {
    const { userId, organizationId } = parsedInput;
    await prisma.member.updateMany({
        where: { userId, organizationId },
        data: { role: "admin" },
    });
    await prisma.user.update({
        where: { id: userId },
        data: { role: "admin" },
    });
    revalidatePath("/superadmin/users");
    return { success: true };
});

export const demoteToStaffAction = superAdminAction
    .schema(z.object({
    userId: z.string().min(1),
    organizationId: z.string().min(1),
}))
    .action(async ({ parsedInput }) => {
    const { userId, organizationId } = parsedInput;
    await prisma.member.updateMany({
        where: { userId, organizationId },
        data: { role: "member" },
    });
    const otherAdminMemberships = await prisma.member.findFirst({
        where: {
            userId,
            role: "admin",
            NOT: { organizationId },
        },
    });
    if (!otherAdminMemberships) {
        await prisma.user.update({
            where: { id: userId },
            data: { role: "member" },
        });
    }
    revalidatePath("/superadmin/users");
    return { success: true };
});

export const deleteUserAction = superAdminAction
    .schema(z.object({ userId: z.string().min(1) }))
    .action(async ({ parsedInput, ctx }) => {
    if (parsedInput.userId === ctx.user.id) {
        throw new Error("You cannot delete your own account.");
    }
    await prisma.user.delete({
        where: { id: parsedInput.userId },
    });
    revalidatePath("/superadmin/users");
    return { success: true };
});

export const updateUserAction = superAdminAction
    .schema(updateUserSchema)
    .action(async ({ parsedInput, ctx }) => {
    const { id, name, email, password, orgRole, organizationId } = parsedInput;
    if (id === ctx.user.id) {
        throw new Error("You cannot edit your own super admin account settings here.");
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
            role: orgRole === "admin" ? "admin" : "member",
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
    await prisma.member.deleteMany({
        where: { userId: id },
    });
    if (organizationId) {
        await prisma.member.create({
            data: {
                userId: id,
                organizationId,
                role: orgRole,
            },
        });
    }
    revalidatePath("/superadmin/users");
    return { success: true };
});
