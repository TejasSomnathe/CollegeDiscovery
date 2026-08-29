"use client";

/**
 * Compare Tray — the sticky bottom bar that shows selected colleges for comparison.
 * Appears when ≥1 college is selected. User can compare or clear.
 */

import { useCompare } from "@/features/compare/compare.context";
import { XIcon, ArrowRightIcon, GitCompareArrowsIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function CompareTray() {
  const { selectedColleges, removeFromCompare, clearCompare } = useCompare();
  const router = useRouter();

  if (selectedColleges.length === 0) return null;

  const handleCompare = () => {
    const ids = selectedColleges.map((c) => c.id).join(",");
    router.push(`/compare?ids=${ids}`);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
        <div className="flex items-center gap-2 mr-auto">
          <GitCompareArrowsIcon className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <span className="text-sm font-semibold text-slate-700 hidden sm:block">
            Compare ({selectedColleges.length}/3):
          </span>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {selectedColleges.map((c) => (
              <span
                key={c.id}
                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap"
              >
                {c.name}
                <button
                  onClick={() => removeFromCompare(c.id)}
                  className="ml-1 text-indigo-400 hover:text-indigo-700"
                  aria-label={`Remove ${c.name}`}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <button
          onClick={clearCompare}
          className="text-sm text-slate-500 hover:text-red-500 transition-colors flex-shrink-0"
        >
          Clear
        </button>

        <button
          onClick={handleCompare}
          disabled={selectedColleges.length < 2}
          className="flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        >
          Compare
          <ArrowRightIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
