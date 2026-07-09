import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { adminAc, userAc } from "better-auth/plugins/admin/access";
import { organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        requireEmailVerification: false,
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7,
        updateAge: 60 * 60 * 24,
        cookieCache: {
            enabled: true,
            maxAge: 5 * 60,
        },
    },
    plugins: [
        admin({
            defaultRole: "member",
            adminRoles: ["superadmin", "admin"],
            roles: {
                superadmin: adminAc,
                admin: adminAc,
                member: userAc,
            },
        }),
        organization({
            allowUserToCreateOrganization: false,
        }),
    ],
    trustedOrigins: [
        process.env.BETTER_AUTH_URL || "http://localhost:3000",
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    ],
});
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
