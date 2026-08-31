

import { db } from "@/db";
import { colleges, courses, placements, reviews, users } from "@/db/schema";
import { and, desc, asc, ilike, gte, lte, eq, inArray, lt, or, sql } from "drizzle-orm";
import { type CollegeListParams } from "@/lib/validations";
import { encodeCursor, decodeCursor } from "@/lib/utils";


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



export async function getColleges(params: CollegeListParams) {
  const { q, city, state, type, stream, feesMin, feesMax, minRating, sort, limit, cursor } =
    params;

  
  const conditions = [];

  
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

  
  if (feesMin !== undefined) conditions.push(gte(colleges.feesMax, feesMin));
  if (feesMax !== undefined) conditions.push(lte(colleges.feesMin, feesMax));
  if (minRating !== undefined) conditions.push(gte(colleges.avgRating, minRating));

 
  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (decoded) {
      
      conditions.push(
        or(
          lt(colleges.createdAt, decoded.createdAt),
          and(eq(colleges.createdAt, decoded.createdAt), lt(colleges.id, decoded.id))
        )
      );
    }
    
  }

 
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

  
  const rows = await db
    .select()
    .from(colleges)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(limit + 1); 

  
  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;

  const nextCursor =
    hasMore && data.length > 0
      ? encodeCursor(data[data.length - 1].createdAt, data[data.length - 1].id)
      : null;

  return { data, nextCursor, hasMore };
}



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


export async function getCollegesForCompare(ids: string[]) {
  const results = await db
    .select()
    .from(colleges)
    .where(inArray(colleges.id, ids));

  const courseMap = new Map<string, (typeof courses.$inferSelect)[]>();
  const placementMap = new Map<string, typeof placements.$inferSelect>();


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

  
  return ids
    .map((id) => results.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .map((c) => ({
      ...c,
      courses: courseMap.get(c.id) ?? [],
      latestPlacement: placementMap.get(c.id) ?? null,
    }));
}


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
