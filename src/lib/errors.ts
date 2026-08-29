/**
 * Centralised error response helpers.
 * Every API endpoint uses these so the error shape is consistent:
 * { error: { code: string, message: string } }
 */

import { NextResponse } from "next/server";

type ErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "BAD_REQUEST";

export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}

export const Errors = {
  validation: (msg: string) => errorResponse("VALIDATION_ERROR", msg, 400),
  notFound: (resource = "Resource") =>
    errorResponse("NOT_FOUND", `${resource} not found`, 404),
  unauthorized: () =>
    errorResponse("UNAUTHORIZED", "Authentication required", 401),
  forbidden: () =>
    errorResponse("FORBIDDEN", "You do not have permission to do this", 403),
  conflict: (msg: string) => errorResponse("CONFLICT", msg, 409),
  badRequest: (msg: string) => errorResponse("BAD_REQUEST", msg, 400),
  internal: () =>
    errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500),
};
