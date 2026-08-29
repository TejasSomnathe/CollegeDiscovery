/**
 * Zod schemas shared between API route handlers and client-side forms.
 * Co-locating them here ensures the server and client validate identically —
 * no schema drift across the stack.
 */

import { z } from "zod";

// ─── College List / Search ────────────────────────────────────────────────────

const VALID_SORTS = [
  "rating_desc",
  "rating_asc",
  "fees_asc",
  "fees_desc",
  "established_asc",
  "established_desc",
  "name_asc",
] as const;

export const collegeListSchema = z.object({
  q: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  type: z.enum(["GOVERNMENT", "PRIVATE", "DEEMED"]).optional(),
  stream: z.string().max(50).optional(),
  // EDGE CASE: out-of-range fee values — coerce + clamp
  feesMin: z.coerce.number().nonnegative().optional(),
  feesMax: z.coerce.number().nonnegative().optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  sort: z.enum(VALID_SORTS).optional().default("rating_desc"),
  limit: z.coerce.number().int().min(1).max(50).optional().default(12),
  cursor: z.string().optional(),
});

export type CollegeListParams = z.infer<typeof collegeListSchema>;

// ─── Review ───────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().min(3).max(120),
  body: z.string().min(10).max(2000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// ─── Compare ─────────────────────────────────────────────────────────────────

export const compareSchema = z.object({
  // EDGE CASE: enforce 2-3 unique college IDs — duplicates cause misleading comparison
  collegeIds: z
    .array(z.string().uuid())
    .min(2, "Select at least 2 colleges to compare")
    .max(3, "You can compare at most 3 colleges at once")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate college IDs are not allowed"
    ),
});

export type CompareInput = z.infer<typeof compareSchema>;

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Saved Collections ────────────────────────────────────────────────────────

export const saveCollegeSchema = z.object({
  collegeId: z.string().uuid(),
});

export const saveComparisonSchema = z.object({
  name: z.string().min(1).max(100),
  // EDGE CASE: same 2-3 unique check as compare
  collegeIds: z
    .array(z.string().uuid())
    .min(2)
    .max(3)
    .refine((ids) => new Set(ids).size === ids.length, "Duplicate college IDs"),
});

export type SaveComparisonInput = z.infer<typeof saveComparisonSchema>;
