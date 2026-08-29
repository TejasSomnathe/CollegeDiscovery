import type { Metadata } from "next";
import { Suspense } from "react";
import { SavedClient } from "./saved-client";

export const metadata: Metadata = {
  title: "Saved Colleges & Comparisons",
  description: "Your bookmarked colleges and saved comparisons.",
};

export default function SavedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <SavedClient />
    </Suspense>
  );
}
