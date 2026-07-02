import { z } from "zod";

// ── Organization Validation Schemas ──────────────────────────
export const orgSchema = z.object({
  name: z.string().min(2, "Organization name must be at least 2 characters"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers, and hyphens"
    ),
  logo: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// ── Super Admin User Validation Schemas ───────────────────────
export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  orgRole: z.enum(["admin", "member"]).default("member"),
  organizationId: z.string().optional(),
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
  orgRole: z.enum(["admin", "member"]).default("member"),
  organizationId: z.string().optional().or(z.literal("")),
});

// ── Org Admin Staff Validation Schemas ────────────────────────
export const updateStaffSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
});
