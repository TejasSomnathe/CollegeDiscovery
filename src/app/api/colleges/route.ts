

import { NextRequest, NextResponse } from "next/server";
import { collegeListSchema } from "@/lib/validations";
import { getColleges } from "@/features/colleges/college.service";
import { Errors } from "@/lib/errors";

export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());

  
  const parsed = collegeListSchema.safeParse(params);
  if (!parsed.success) {
    return Errors.validation(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const filters = { ...parsed.data };
  if (
    filters.feesMin !== undefined &&
    filters.feesMax !== undefined &&
    filters.feesMin > filters.feesMax
  ) {
    [filters.feesMin, filters.feesMax] = [filters.feesMax, filters.feesMin];
  }

  const result = await getColleges(filters);


  return NextResponse.json(result);
}
