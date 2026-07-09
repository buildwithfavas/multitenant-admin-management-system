import { createSafeActionClient } from "next-safe-action";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
export class ActionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "ActionError";
    }
}
const actionClient = createSafeActionClient({
    handleServerError: (e) => {
        if (e instanceof ActionError) {
            return e.message;
        }
        console.error("Unexpected server action error:", e);
        return "An unexpected error occurred. Please try again.";
    },
});
export const protectedAction = actionClient.use(async ({ next }) => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    if (!session?.user) {
        throw new ActionError("You must be logged in to perform this action.");
    }
    return next({
        ctx: {
            user: session.user,
            session: session.session,
        },
    });
});
export const superAdminAction = protectedAction.use(async ({ next, ctx }) => {
    if (ctx.user.role !== "superadmin") {
        throw new ActionError("Access denied. Super Admin privileges required.");
    }
    return next({ ctx });
});
export const adminAction = protectedAction.use(async ({ next, ctx }) => {
    if (ctx.user.role !== "admin" && ctx.user.role !== "superadmin") {
        throw new ActionError("Access denied. Admin privileges required.");
    }
    return next({ ctx });
});
