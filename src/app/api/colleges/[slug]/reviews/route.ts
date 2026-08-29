/**
 * POST /api/colleges/[slug]/reviews
 * Auth-required. Adds a review and recalculates avgRating.
 *
 * EDGE CASE: Rating recalculation — handled in the service layer,
 * see addReview() in college.service.ts for the WHY.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { addReview, getCollegeBySlug } from "@/features/colleges/college.service";
import { reviewSchema } from "@/lib/validations";
import { Errors } from "@/lib/errors";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  // EDGE CASE: Re-check auth server-side — never rely on client-side guards
  const user = await requireAuth();
  if (!user) return Errors.unauthorized();

  const { slug } = await params;
  const college = await getCollegeBySlug(slug);
  if (!college) return Errors.notFound("College");

  const body: unknown = await req.json().catch(() => null);
  if (!body) return Errors.badRequest("Invalid JSON body");

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return Errors.validation(parsed.error.issues.map((i) => i.message).join("; "));
  }

  const review = await addReview(college.id, user.id, parsed.data);
  return NextResponse.json({ review }, { status: 201 });
}
