"use client";
import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    plugins: [
        adminClient(),
        organizationClient(),
    ],
});
export const { useSession, signIn, signOut, useActiveOrganization } = authClient;
export default authClient;
