/**
 * GET /api/colleges
 * Search, filter, sort, and paginate colleges.
 * All filters are validated by zod — invalid values get a 400.
 *
 * WHY cursor pagination: See comment in college.service.ts for the rationale.
 * Short version: offset pagination produces duplicate/missing items when new
 * records are inserted between page fetches. Cursor pagination is stable.
 */

import { NextRequest, NextResponse } from "next/server";
import { collegeListSchema } from "@/lib/validations";
import { getColleges } from "@/features/colleges/college.service";
import { Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());

  // Validate and coerce — zod handles string→number coercion for numeric params
  const parsed = collegeListSchema.safeParse(params);
  if (!parsed.success) {
    return Errors.validation(parsed.error.issues.map((i) => i.message).join("; "));
  }

  // EDGE CASE: feesMin > feesMax makes no sense — normalize rather than error,
  // since the UI might send them in the wrong order during a drag interaction.
  const filters = { ...parsed.data };
  if (
    filters.feesMin !== undefined &&
    filters.feesMax !== undefined &&
    filters.feesMin > filters.feesMax
  ) {
    [filters.feesMin, filters.feesMax] = [filters.feesMax, filters.feesMin];
  }

  const result = await getColleges(filters);

  // EDGE CASE: empty results — still 200 with empty array and null cursor
  return NextResponse.json(result);
}
