/**
 * GET  /api/saved/comparisons — list saved comparisons
 * POST /api/saved/comparisons — save a new comparison
 *
 * Auth-protected server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getSavedComparisons, saveComparison } from "@/features/saved/saved.service";
import { saveComparisonSchema } from "@/lib/validations";
import { Errors } from "@/lib/errors";

export async function GET() {
  const user = await requireAuth();
  if (!user) return Errors.unauthorized();

  const comparisons = await getSavedComparisons(user.id);
  return NextResponse.json({ comparisons });
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return Errors.unauthorized();

  const body: unknown = await req.json().catch(() => null);
  if (!body) return Errors.badRequest("Invalid JSON body");

  const parsed = saveComparisonSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.validation(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const result = await saveComparison(user.id, parsed.data.name, parsed.data.collegeIds);
  return NextResponse.json({ comparison: result }, { status: 201 });
}
