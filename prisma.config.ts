// ============================================================
// prisma.config.ts — Prisma 7 Configuration File
// ============================================================
//
// WHY THIS FILE?
// Prisma version 7 introduced a new way to configure the database
// connection. Instead of putting the database URL directly in
// schema.prisma (the old way), you now use this config file.
//
// This change was made to:
// 1. Support multiple environments more cleanly
// 2. Support Prisma Accelerate (a connection pooling service)
// 3. Keep connection details separate from the schema
//
// HOW IT WORKS:
// Prisma reads this file when you run:
//   - pnpm db:generate  (generates TypeScript types from schema)
//   - pnpm db:migrate   (creates/updates database tables)
//   - pnpm db:push      (pushes schema to database without migration)
//   - pnpm db:studio    (opens the visual database browser)
// ============================================================

import "dotenv/config";
import path from "node:path";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  // Where is your schema file?
  schema: path.join("prisma", "schema.prisma"),

  // ── Database Connection ────────────────────────────────────
  // This replaces the `url = env("DATABASE_URL")` that was
  // previously inside schema.prisma in older Prisma versions.
  //
  // env("DATABASE_URL") reads from your .env file safely.
  datasource: {
    url: env("DATABASE_URL"),
  },

  migrations: {
    // Where to store migration files?
    path: path.join("prisma", "migrations"),
    seed: "tsx ./prisma/seed.ts",
  },
});
