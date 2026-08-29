"use client";

/**
 * Collapsible filter sidebar.
 * Each filter section is independently expandable.
 * Filters immediately update the URL, keeping state shareable.
 */

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STATES = [
  "Andhra Pradesh", "Assam", "Delhi", "Gujarat", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Odisha", "Punjab",
  "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh",
  "Uttarakhand", "West Bengal",
];

const STREAMS = ["Engineering", "Medical", "Management", "Arts", "Law"];
const TYPES = [
  { value: "GOVERNMENT", label: "Government" },
  { value: "PRIVATE", label: "Private" },
  { value: "DEEMED", label: "Deemed" },
];
const RATINGS = [
  { value: "4.5", label: "4.5+ ⭐ Excellent" },
  { value: "4.0", label: "4.0+ ⭐ Very Good" },
  { value: "3.5", label: "3.5+ ⭐ Good" },
  { value: "3.0", label: "3.0+ ⭐ Average" },
];

interface FilterSidebarProps {
  filters: Record<string, string | undefined>;
  onUpdate: (key: string, value: string | undefined) => void;
  onClose?: () => void;
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 pb-4 mb-4">
      <button
        className="flex items-center justify-between w-full text-sm font-semibold text-slate-700 mb-3"
        onClick={() => setOpen((v) => !v)}
      >
        {title}
        {open ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
      </button>
      {open && children}
    </div>
  );
}

export function FilterSidebar({ filters, onUpdate, onClose }: FilterSidebarProps) {
  const activeCount = [
    filters.state,
    filters.stream,
    filters.type,
    filters.minRating,
    filters.feesMin,
    filters.feesMax,
  ].filter(Boolean).length;

  const clearAll = () => {
    ["state", "stream", "type", "minRating", "feesMin", "feesMax"].forEach((k) =>
      onUpdate(k, undefined)
    );
    onClose?.();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-slate-900 text-sm">
          Filters {activeCount > 0 && <span className="text-indigo-600">({activeCount})</span>}
        </span>
        {activeCount > 0 && (
          <button onClick={clearAll} className="text-xs text-red-500 hover:underline">
            Clear all
          </button>
        )}
      </div>

      {/* Stream */}
      <FilterSection title="Stream">
        <div className="space-y-1.5">
          {STREAMS.map((s) => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="stream"
                value={s}
                checked={filters.stream === s}
                onChange={() => onUpdate("stream", filters.stream === s ? undefined : s)}
                className="accent-indigo-600"
              />
              <span className={cn("text-sm", filters.stream === s ? "text-indigo-700 font-medium" : "text-slate-600")}>
                {s}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* College Type */}
      <FilterSection title="College Type">
        <div className="space-y-1.5">
          {TYPES.map((t) => (
            <label key={t.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.type === t.value}
                onChange={() => onUpdate("type", filters.type === t.value ? undefined : t.value)}
                className="accent-indigo-600"
              />
              <span className={cn("text-sm", filters.type === t.value ? "text-indigo-700 font-medium" : "text-slate-600")}>
                {t.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* State */}
      <FilterSection title="State" defaultOpen={false}>
        <select
          value={filters.state ?? ""}
          onChange={(e) => onUpdate("state", e.target.value || undefined)}
          className="w-full text-sm border border-slate-200 rounded-lg px-2 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <option value="">All states</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Minimum Rating">
        <div className="space-y-1.5">
          {RATINGS.map((r) => (
            <label key={r.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="minRating"
                value={r.value}
                checked={filters.minRating === r.value}
                onChange={() => onUpdate("minRating", filters.minRating === r.value ? undefined : r.value)}
                className="accent-indigo-600"
              />
              <span className={cn("text-sm", filters.minRating === r.value ? "text-indigo-700 font-medium" : "text-slate-600")}>
                {r.label}
              </span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Fees */}
      <FilterSection title="Annual Fees (₹)" defaultOpen={false}>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-slate-500">Min fees</label>
            <input
              type="number"
              placeholder="e.g. 100000"
              value={filters.feesMin ?? ""}
              onChange={(e) => onUpdate("feesMin", e.target.value || undefined)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label className="text-xs text-slate-500">Max fees</label>
            <input
              type="number"
              placeholder="e.g. 500000"
              value={filters.feesMax ?? ""}
              onChange={(e) => onUpdate("feesMax", e.target.value || undefined)}
              className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>
      </FilterSection>

      {onClose && (
        <button
          onClick={onClose}
          className="w-full mt-2 bg-indigo-600 text-white text-sm font-semibold py-2 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Apply Filters
        </button>
      )}
    </div>
  );
}
