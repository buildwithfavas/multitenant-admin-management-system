// ============================================================
// lib/prisma.ts — Prisma Client Singleton (Prisma 7)
// ============================================================
//
// WHY A SINGLETON?
// In Next.js development mode, hot-reloading (fast refresh) causes
// the module to be re-imported many times. Without a singleton, each
// reload would create a NEW database connection, quickly exhausting
// your PostgreSQL connection pool.
//
// The trick: we store the Prisma client on the `global` object so it
// survives hot-reloads. In production, new connections are fine.
//
// PRISMA 7 CHANGES:
// Prisma 7 uses a "driver adapter" pattern. Instead of Prisma
// managing the database connection internally, you use a proper
// database driver (here: `pg`, the Node.js PostgreSQL driver)
// and pass it to Prisma as an adapter.
//
// WHY THIS PATTERN?
// - Better connection pooling control
// - Works with serverless environments (Vercel, Cloudflare)
// - Supports edge runtime
// - Allows using different drivers (pg, neon, etc.)
// ============================================================

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Declare a type for the global prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// ── Create Prisma Client with pg adapter ──────────────────────
function createPrismaClient() {
  // Create a PostgreSQL connection pool
  // A "pool" manages multiple connections that can be reused,
  // avoiding the overhead of opening a new connection for each query.
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Maximum connections in the pool
    max: process.env.NODE_ENV === "production" ? 10 : 3,
  });

  // Create the Prisma adapter that wraps the pg pool
  const adapter = new PrismaPg(pool);

  // Create and return the Prisma client with the adapter
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"] // Show SQL queries in development
        : ["error"], // Only show errors in production
  });
}

// Create or reuse the Prisma client
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// In development, save to global so we reuse across hot-reloads
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
