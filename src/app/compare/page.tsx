import type { Metadata } from "next";
import { Suspense } from "react";
import { CompareClient } from "./compare-client";

export const metadata: Metadata = {
  title: "Compare Colleges",
  description: "Compare colleges side by side — fees, placements, courses, and ratings.",
};

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-slate-500">Loading comparison...</div></div>}>
      <CompareClient />
    </Suspense>
  );
}
