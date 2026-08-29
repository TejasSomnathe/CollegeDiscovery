/**
 * GET /api/colleges/[slug]
 * Returns full college detail including courses, placements, and paginated reviews.
 *
 * Reviews are paginated via ?reviewPage=&reviewLimit= query params.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCollegeBySlug } from "@/features/colleges/college.service";
import { Errors } from "@/lib/errors";
import { z } from "zod";

const querySchema = z.object({
  reviewPage: z.coerce.number().int().min(1).optional().default(1),
  reviewLimit: z.coerce.number().int().min(1).max(20).optional().default(5),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const query = querySchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries())
  );
  if (!query.success) return Errors.validation("Invalid pagination params");

  const college = await getCollegeBySlug(slug, query.data.reviewPage, query.data.reviewLimit);

  if (!college) return Errors.notFound("College");

  return NextResponse.json({ college });
}
