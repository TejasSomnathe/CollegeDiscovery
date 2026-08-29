import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes without conflicts */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format INR currency */
export function formatINR(amount: number): string {
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

/** Format LPA salary */
export function formatLPA(lpa: number): string {
  return `${lpa.toFixed(1)} LPA`;
}

/** Encode a cursor from a college's createdAt + id for stable cursor pagination */
export function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(JSON.stringify({ createdAt: createdAt.toISOString(), id })).toString(
    "base64url"
  );
}

export function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const parsed = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")) as {
      createdAt: string;
      id: string;
    };
    return { createdAt: new Date(parsed.createdAt), id: parsed.id };
  } catch {
    return null;
  }
}
