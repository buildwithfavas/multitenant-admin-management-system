import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
async function main() {
    console.log("🌱 Starting database seed...\n");
    const existingAdmin = await prisma.user.findUnique({
        where: { email: "superadmin@admin.com" },
    });
    if (existingAdmin) {
        console.log("✅ Super Admin already exists — skipping creation.");
        if (existingAdmin.role !== "superadmin") {
            console.log("🔧 Role is not superadmin. Updating role to superadmin...");
            await prisma.user.update({
                where: { email: "superadmin@admin.com" },
                data: { role: "superadmin" },
            });
            console.log("✅ Role updated to superadmin.");
        }
        else {
            console.log(`   Email: superadmin@admin.com`);
            console.log(`   Role:  ${existingAdmin.role}`);
        }
        return;
    }
    console.log("👤 Creating Super Admin user...");
    try {
        const ctx = await auth.api.signUpEmail({
            body: {
                email: "superadmin@admin.com",
                password: "SuperAdmin@123",
                name: "Super Admin",
            },
            asResponse: false,
        });
        if (ctx?.user) {
            await prisma.user.update({
                where: { id: ctx.user.id },
                data: { role: "superadmin" },
            });
            console.log("\n✅ Super Admin created successfully!\n");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("  Login Credentials:");
            console.log("  Email:    superadmin@admin.com");
            console.log("  Password: SuperAdmin@123");
            console.log("  Role:     superadmin");
            console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
            console.log("\n⚠️  Please change the password after first login!\n");
        }
    }
    catch (error) {
        console.error("❌ Failed to create Super Admin:", error);
        throw error;
    }
    console.log("🌱 Seed completed!");
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
