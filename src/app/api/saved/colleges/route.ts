/**
 * GET  /api/saved/colleges — list saved colleges
 * POST /api/saved/colleges — save a college (idempotent)
 *
 * All routes auth-protected server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getSavedColleges,
  saveCollege,
} from "@/features/saved/saved.service";
import { saveCollegeSchema } from "@/lib/validations";
import { Errors } from "@/lib/errors";

export async function GET() {
  const user = await requireAuth();
  if (!user) return Errors.unauthorized();

  const saved = await getSavedColleges(user.id);
  return NextResponse.json({ saved });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return Errors.unauthorized();

  const body: unknown = await req.json().catch(() => null);
  if (!body) return Errors.badRequest("Invalid JSON body");

  const parsed = saveCollegeSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.validation(parsed.error.issues.map((i) => i.message).join("; "));
  }

  // EDGE CASE: Duplicate save — onConflictDoNothing in the service makes this idempotent
  const result = await saveCollege(user.id, parsed.data.collegeId);
  return NextResponse.json({ saved: result }, { status: 201 });
}
