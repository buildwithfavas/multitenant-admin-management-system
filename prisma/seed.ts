// ============================================================
// prisma/seed.ts — Super Admin Seeder
// ============================================================
//
// WHAT IS A SEED SCRIPT?
// A "seed" populates the database with initial data so the app
// can actually be used right away. Without a seed, you'd have
// no users, no super admin — the app would be empty!
//
// HOW TO RUN THIS:
//   pnpm db:seed
//
// WHAT THIS DOES:
// 1. Creates the Super Admin user in the database
// 2. Hashes the password (never store plain text passwords!)
// 3. Sets role = "superadmin" via the admin plugin
//
// AFTER RUNNING:
// You can log in with:
//   Email:    superadmin@admin.com
//   Password: SuperAdmin@123
//
// ⚠️  CHANGE THE PASSWORD after first login in production!
// ============================================================

import "dotenv/config";
import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";


// ============================================================
// WHY DO WE NEED BETTER AUTH TO CREATE THE USER?
// ============================================================
// Better Auth handles password hashing and user creation.
// If we insert directly into the database, the password would
// be stored as plain text — a huge security risk!
//
// By using Better Auth's admin.createUser(), it:
// 1. Hashes the password with bcrypt (a secure algorithm)
// 2. Creates the user AND account records correctly
// 3. Sets the role properly
// ============================================================


async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── Step 1: Check if super admin already exists ─────────
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
    } else {
      console.log(`   Email: superadmin@admin.com`);
      console.log(`   Role:  ${existingAdmin.role}`);
    }
    return;
  }

  // ── Step 2: Create the Super Admin user ─────────────────
  console.log("👤 Creating Super Admin user...");

  try {
    // We use Better Auth's admin API to create the user
    // This ensures password is properly hashed!
    const ctx = await auth.api.signUpEmail({
      body: {
        email: "superadmin@admin.com",
        password: "SuperAdmin@123", // ⚠️ Change this in production!
        name: "Super Admin",
      },
      asResponse: false,
    });

    if (ctx?.user) {
      // ── Step 3: Set role to "superadmin" ──────────────────
      // The sign-up creates a user with default role ("member")
      // We need to promote it to "superadmin"
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
  } catch (error) {
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
