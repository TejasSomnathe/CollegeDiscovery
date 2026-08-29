/**
 * POST /api/compare
 * Returns structured side-by-side comparison data for 2–3 colleges.
 *
 * EDGE CASES handled:
 *   - < 2 or > 3 colleges → 400 (zod)
 *   - Duplicate IDs → 400 (zod .refine)
 *   - One or more college IDs not found → 404 with details of which IDs are missing
 */

import { NextRequest, NextResponse } from "next/server";
import { compareSchema } from "@/lib/validations";
import { getCollegesForCompare } from "@/features/colleges/college.service";
import { Errors } from "@/lib/errors";

export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => null);
  if (!body) return Errors.badRequest("Invalid JSON body");

  const parsed = compareSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.validation(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const { collegeIds } = parsed.data;
  const colleges = await getCollegesForCompare(collegeIds);

  // EDGE CASE: some IDs didn't resolve — tell the client which ones are invalid
  if (colleges.length !== collegeIds.length) {
    const foundIds = new Set(colleges.map((c) => c.id));
    const missingIds = collegeIds.filter((id) => !foundIds.has(id));
    return NextResponse.json(
      {
        error: {
          code: "NOT_FOUND",
          message: "Some colleges were not found",
          details: { missingIds },
        },
      },
      { status: 404 }
    );
  }

  return NextResponse.json({ colleges });
}
