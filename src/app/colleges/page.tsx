import type { Metadata } from "next";
import { Suspense } from "react";
import { CollegesClient } from "./colleges-client";

export const metadata: Metadata = {
  title: "Browse Colleges",
  description: "Search and filter colleges across India by stream, fees, location, and ratings.",
};

// WHY Suspense here: useSearchParams() requires Suspense in the App Router
// when used inside a client component. The wrapper keeps the page server-renderable.
export default function CollegesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <CollegesClient />
    </Suspense>
  );
}
