/**
 * DELETE /api/saved/colleges/[collegeId]
 * Removes a saved college. Auth-protected server-side.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { unsaveCollege } from "@/features/saved/saved.service";
import { Errors } from "@/lib/errors";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ collegeId: string }> }
) {
  const user = await requireAuth();
  if (!user) return Errors.unauthorized();

  const { collegeId } = await params;
  await unsaveCollege(user.id, collegeId);

  return NextResponse.json({ success: true });
}
