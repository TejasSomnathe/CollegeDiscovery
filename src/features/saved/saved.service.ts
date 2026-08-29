/**
 * Saved items service — manages bookmarked colleges and saved comparisons.
 */

import { db } from "@/db";
import {
  savedColleges,
  savedComparisons,
  savedComparisonColleges,
  colleges,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

// ─── Saved Colleges ───────────────────────────────────────────────────────────

export async function getSavedColleges(userId: string) {
  return db
    .select({ saved: savedColleges, college: colleges })
    .from(savedColleges)
    .innerJoin(colleges, eq(savedColleges.collegeId, colleges.id))
    .where(eq(savedColleges.userId, userId));
}

export async function saveCollege(userId: string, collegeId: string) {
  // EDGE CASE: Duplicate saves — onConflictDoNothing makes the op idempotent.
  // The UI can call this without checking saved state first (e.g. rapid double-click).
  return db
    .insert(savedColleges)
    .values({
      id: crypto.randomUUID(),
      userId,
      collegeId,
    })
    .onConflictDoNothing()
    .returning();
}

export async function unsaveCollege(userId: string, collegeId: string) {
  return db
    .delete(savedColleges)
    .where(and(eq(savedColleges.userId, userId), eq(savedColleges.collegeId, collegeId)))
    .returning();
}

export async function getSavedCollegeIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ collegeId: savedColleges.collegeId })
    .from(savedColleges)
    .where(eq(savedColleges.userId, userId));
  return rows.map((r) => r.collegeId);
}

// ─── Saved Comparisons ────────────────────────────────────────────────────────

export async function getSavedComparisons(userId: string) {
  const comparisons = await db
    .select()
    .from(savedComparisons)
    .where(eq(savedComparisons.userId, userId));

  if (comparisons.length === 0) return [];

  // Fetch the colleges for each comparison
  const comparisonIds = comparisons.map((c) => c.id);
  const joinRows = await db
    .select({ comparisonId: savedComparisonColleges.comparisonId, college: colleges })
    .from(savedComparisonColleges)
    .innerJoin(colleges, eq(savedComparisonColleges.collegeId, colleges.id))
    .where(inArray(savedComparisonColleges.comparisonId, comparisonIds));

  return comparisons.map((comp) => ({
    ...comp,
    colleges: joinRows
      .filter((r) => r.comparisonId === comp.id)
      .map((r) => r.college),
  }));
}

export async function saveComparison(
  userId: string,
  name: string,
  collegeIds: string[]
) {
  const comparisonId = crypto.randomUUID();

  await db.insert(savedComparisons).values({
    id: comparisonId,
    userId,
    name,
  });

  await db.insert(savedComparisonColleges).values(
    collegeIds.map((collegeId) => ({ comparisonId, collegeId }))
  );

  return { id: comparisonId, name, collegeIds };
}

export async function deleteSavedComparison(userId: string, comparisonId: string) {
  // Verify ownership before deleting — server-side auth check
  const existing = await db
    .select()
    .from(savedComparisons)
    .where(
      and(eq(savedComparisons.id, comparisonId), eq(savedComparisons.userId, userId))
    )
    .limit(1);

  if (existing.length === 0) return null;

  // Cascade deletes join rows via FK constraint
  await db.delete(savedComparisons).where(eq(savedComparisons.id, comparisonId));
  return comparisonId;
}
