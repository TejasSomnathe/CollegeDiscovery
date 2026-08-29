/**
 * DELETE /api/saved/comparisons/[id]
 * Removes a saved comparison. Verifies ownership server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { deleteSavedComparison } from "@/features/saved/saved.service";
import { Errors } from "@/lib/errors";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireAuth();
  if (!user) return Errors.unauthorized();

  const { id } = await params;
  const result = await deleteSavedComparison(user.id, id);

  if (!result) return Errors.notFound("Saved comparison");
  return NextResponse.json({ success: true });
}
