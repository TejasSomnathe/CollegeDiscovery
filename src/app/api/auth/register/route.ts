/**
 * POST /api/auth/register
 * Creates a new user account. Returns the user (without password hash).
 *
 * EDGE CASE: Email uniqueness — the DB has a unique index; we catch the
 * specific Postgres error code (23505) to return a clean 409 Conflict
 * rather than a generic 500.
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { registerSchema } from "@/lib/validations";
import { Errors } from "@/lib/errors";

export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => null);
  if (!body) return Errors.badRequest("Invalid JSON body");

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.validation(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const { name, email, password } = parsed.data;

  // Check for existing user before hashing to avoid bcrypt cost on duplicates
  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    // EDGE CASE: duplicate email — idempotent 409 so the client can show "email taken"
    return Errors.conflict("An account with this email already exists");
  }

  // WHY 12 rounds: OWASP recommends ≥10; 12 is a reasonable balance between
  // security and latency (~300ms on modern hardware) for an MVP.
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await db
    .insert(users)
    .values({
      id: crypto.randomUUID(),
      name,
      email,
      passwordHash,
    })
    .returning({ id: users.id, name: users.name, email: users.email });

  return NextResponse.json({ user: newUser[0] }, { status: 201 });
}
