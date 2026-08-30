/**
 * College service — all business logic for college queries.
 * Route handlers call these functions; they never query the DB directly.
 * This separation makes the logic independently testable.
 */

import { db } from "@/db";
import { colleges, courses, placements, reviews, users } from "@/db/schema";
import { and, desc, asc, ilike, gte, lte, eq, inArray, lt, or, sql } from "drizzle-orm";
import { type CollegeListParams } from "@/lib/validations";
import { encodeCursor, decodeCursor } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CollegeListItem = typeof colleges.$inferSelect;

export type CollegeDetail = CollegeListItem & {
  courses: (typeof courses.$inferSelect)[];
  placements: (typeof placements.$inferSelect)[];
  reviews: Array<
    typeof reviews.$inferSelect & {
      user: { id: string; name: string } | null;
    }
  >;
};

// ─── List / Search ────────────────────────────────────────────────────────────

export async function getColleges(params: CollegeListParams) {
  const { q, city, state, type, stream, feesMin, feesMax, minRating, sort, limit, cursor } =
    params;

  // Build WHERE clauses dynamically
  const conditions = [];

  // Free-text search across name, city, state
  if (q) {
    conditions.push(
      or(
        ilike(colleges.name, `%${q}%`),
        ilike(colleges.city, `%${q}%`),
        ilike(colleges.state, `%${q}%`),
        ilike(colleges.stream, `%${q}%`)
      )
    );
  }

  if (city) conditions.push(ilike(colleges.city, `%${city}%`));
  if (state) conditions.push(ilike(colleges.state, `%${state}%`));
  if (type) conditions.push(eq(colleges.type, type));
  if (stream) conditions.push(ilike(colleges.stream, `%${stream}%`));

  // EDGE CASE: invalid fee ranges are caught by zod; here we also check logical order
  if (feesMin !== undefined) conditions.push(gte(colleges.feesMax, feesMin));
  if (feesMax !== undefined) conditions.push(lte(colleges.feesMin, feesMax));
  if (minRating !== undefined) conditions.push(gte(colleges.avgRating, minRating));

  // ── Cursor pagination ──────────────────────────────────────────────────────
  // WHY cursor over offset: With offset pagination, if a new college is inserted
  // between page fetches, records shift and the user sees duplicates or misses items.
  // Cursor pagination is stable: we use (createdAt, id) as the cursor tuple.
  // We encode them in a base64url string so the client treats it as opaque.
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      // Keyset: get rows where (createdAt, id) comes after the cursor position
      conditions.push(
        or(
          lt(colleges.createdAt, decoded.createdAt),
          and(eq(colleges.createdAt, decoded.createdAt), lt(colleges.id, decoded.id))
        )
      );
    }
    // EDGE CASE: malformed cursor → decodeCursor returns null → we ignore it
    // and return the first page, preventing 400 errors for minor client bugs
  }

  // ── Sorting ───────────────────────────────────────────────────────────────
  const orderBy = (() => {
    switch (sort) {
      case "rating_asc":
        return [asc(colleges.avgRating), desc(colleges.createdAt)];
      case "fees_asc":
        return [asc(colleges.feesMin), desc(colleges.createdAt)];
      case "fees_desc":
        return [desc(colleges.feesMax), desc(colleges.createdAt)];
      case "established_asc":
        return [asc(colleges.establishedYear), desc(colleges.createdAt)];
      case "established_desc":
        return [desc(colleges.establishedYear), desc(colleges.createdAt)];
      case "name_asc":
        return [asc(colleges.name), desc(colleges.createdAt)];
      case "rating_desc":
      default:
        return [desc(colleges.avgRating), desc(colleges.createdAt)];
    }
  })();

  // Fetch limit+1 to determine if there is a next page without a separate COUNT query
  const rows = await db
    .select()
    .from(colleges)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(limit + 1); // fetch one extra to detect next page

  // EDGE CASE: last page / no next cursor
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  const nextCursor =
    hasMore && data.length > 0
      ? encodeCursor(data[data.length - 1].createdAt, data[data.length - 1].id)
      : null;

  return { data, nextCursor, hasMore };
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export async function getCollegeBySlug(
  slug: string,
  reviewPage = 1,
  reviewLimit = 5
): Promise<CollegeDetail | null> {
  const college = await db
    .select()
    .from(colleges)
    .where(eq(colleges.slug, slug))
    .limit(1)
    .then((r) => r[0] ?? null);

  if (!college) return null;

  const [collegeCourses, collegePlacements, collegeReviews] = await Promise.all([
    db.select().from(courses).where(eq(courses.collegeId, college.id)),
    db
      .select()
      .from(placements)
      .where(eq(placements.collegeId, college.id))
      .orderBy(desc(placements.year)),
    db
      .select({
        id: reviews.id,
        collegeId: reviews.collegeId,
        userId: reviews.userId,
        rating: reviews.rating,
        title: reviews.title,
        body: reviews.body,
        helpful: reviews.helpful,
        createdAt: reviews.createdAt,
        user: {
          id: users.id,
          name: users.name,
        },
      })
      .from(reviews)
      .leftJoin(users, eq(reviews.userId, users.id))
      .where(eq(reviews.collegeId, college.id))
      .orderBy(desc(reviews.createdAt))
      .limit(reviewLimit)
      .offset((reviewPage - 1) * reviewLimit),
  ]);

  return {
    ...college,
    courses: collegeCourses,
    placements: collegePlacements,
    reviews: collegeReviews,
  };
}

// ─── Compare ─────────────────────────────────────────────────────────────────

export async function getCollegesForCompare(ids: string[]) {
  const results = await db
    .select()
    .from(colleges)
    .where(inArray(colleges.id, ids));

  const courseMap = new Map<string, (typeof courses.$inferSelect)[]>();
  const placementMap = new Map<string, typeof placements.$inferSelect>();

  // Fetch courses and latest placement for each college in parallel
  await Promise.all(
    results.map(async (c) => {
      const [collegeCourses, latestPlacement] = await Promise.all([
        db.select().from(courses).where(eq(courses.collegeId, c.id)),
        db
          .select()
          .from(placements)
          .where(eq(placements.collegeId, c.id))
          .orderBy(desc(placements.year))
          .limit(1)
          .then((r) => r[0] ?? null),
      ]);
      courseMap.set(c.id, collegeCourses);
      if (latestPlacement) placementMap.set(c.id, latestPlacement);
    })
  );

  // Preserve the requested order so the comparison columns match what the user selected
  return ids
    .map((id) => results.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .map((c) => ({
      ...c,
      courses: courseMap.get(c.id) ?? [],
      latestPlacement: placementMap.get(c.id) ?? null,
    }));
}

// ─── Add Review ───────────────────────────────────────────────────────────────

export async function addReview(
  collegeId: string,
  userId: string,
  data: { rating: number; title: string; body: string }
) {
  const newReview = await db
    .insert(reviews)
    .values({
      id: crypto.randomUUID(),
      collegeId,
      userId,
      rating: data.rating,
      title: data.title,
      body: data.body,
    })
    .returning()
    .then((r) => r[0]);

  // EDGE CASE: Recalculate avgRating synchronously after insert.
  // WHY denormalized recalc here: A live aggregate (AVG()) on every listing page
  // load would be expensive at scale. We pay the write cost once per review
  // to keep reads fast. For very high write volume, a queue/background job
  // would be better — noted in ARCHITECTURE.md tradeoffs.
  const ratingResult = await db
    .select({
      avg: sql<number>`AVG(${reviews.rating})::float`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(reviews)
    .where(eq(reviews.collegeId, collegeId));

  const { avg, count } = ratingResult[0];

  await db
    .update(colleges)
    .set({
      avgRating: parseFloat(avg.toFixed(1)),
      totalReviews: count,
      updatedAt: new Date(),
    })
    .where(eq(colleges.id, collegeId));

  return newReview;
}
