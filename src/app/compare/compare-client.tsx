"use client";

/**
 * Compare page — reads college IDs from URL (?ids=id1,id2,id3)
 * so comparisons are shareable/bookmarkable.
 *
 * WHY URL state here (vs. Context): The comparison *result* should be
 * shareable — a student should be able to send a compare link to a parent.
 * The Context just populates the compare tray; this page reads the final IDs.
 */

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { CheckIcon, BookmarkIcon, ArrowLeftIcon, StarIcon, TrophyIcon, GraduationCapIcon } from "lucide-react";
import { formatINR, formatLPA, cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";
import { toast } from "@/lib/toast";
import Link from "next/link";

interface CourseData {
  id: string;
  name: string;
  degree: string;
  durationYears: number;
  totalFees: number;
  seatsAvailable: number;
  eligibility: string;
}

interface PlacementData {
  id: string;
  year: number;
  avgPackageLpa: number;
  medianPackageLpa: number;
  highestPackageLpa: number;
  placementPercentage: number;
  topRecruiters: string;
}

interface CollegeCompareData {
  id: string;
  slug: string;
  name: string;
  city: string;
  state: string;
  type: string;
  stream: string;
  establishedYear: number;
  avgRating: number;
  totalReviews: number;
  feesMin: number;
  feesMax: number;
  accreditation: string | null;
  overview: string;
  courses: CourseData[];
  latestPlacement: PlacementData | null;
}

type CompareResponse = { colleges: CollegeCompareData[] };

const TYPE_LABEL: Record<string, string> = {
  GOVERNMENT: "Government",
  PRIVATE: "Private",
  DEEMED: "Deemed",
};

// Rows to compare — each row has a label and a function to extract the value
const COMPARE_ROWS: {
  label: string;
  key: string;
  render: (c: CollegeCompareData) => React.ReactNode;
  highlight?: (values: CollegeCompareData[]) => string | null;
}[] = [
  {
    label: "Location",
    key: "location",
    render: (c) => `${c.city}, ${c.state}`,
  },
  {
    label: "Established",
    key: "established",
    render: (c) => c.establishedYear,
  },
  {
    label: "College Type",
    key: "type",
    render: (c) => TYPE_LABEL[c.type] ?? c.type,
  },
  {
    label: "Stream",
    key: "stream",
    render: (c) => c.stream,
  },
  {
    label: "NAAC Grade",
    key: "naac",
    render: (c) => c.accreditation ?? "Not graded",
  },
  {
    label: "Annual Fees (Min)",
    key: "feesMin",
    render: (c) => formatINR(c.feesMin),
    // Highlight cheapest — better value for students
    highlight: (vals) =>
      vals.reduce((best, c) => (c.feesMin < best.feesMin ? c : best)).id,
  },
  {
    label: "Annual Fees (Max)",
    key: "feesMax",
    render: (c) => formatINR(c.feesMax),
    highlight: (vals) =>
      vals.reduce((best, c) => (c.feesMax < best.feesMax ? c : best)).id,
  },
  {
    label: "Overall Rating",
    key: "rating",
    render: (c) => (
      <span className="flex items-center gap-1 justify-center">
        <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
        {c.avgRating.toFixed(1)} ({c.totalReviews})
      </span>
    ),
    highlight: (vals) =>
      vals.reduce((best, c) => (c.avgRating > best.avgRating ? c : best)).id,
  },
  {
    label: "Avg. Package",
    key: "avgPackage",
    render: (c) =>
      c.latestPlacement ? formatLPA(c.latestPlacement.avgPackageLpa) : "N/A",
    highlight: (vals) => {
      const withData = vals.filter((c) => c.latestPlacement);
      if (withData.length === 0) return null;
      return withData.reduce((best, c) =>
        (c.latestPlacement?.avgPackageLpa ?? 0) > (best.latestPlacement?.avgPackageLpa ?? 0)
          ? c
          : best
      ).id;
    },
  },
  {
    label: "Highest Package",
    key: "highestPackage",
    render: (c) =>
      c.latestPlacement ? formatLPA(c.latestPlacement.highestPackageLpa) : "N/A",
    highlight: (vals) => {
      const withData = vals.filter((c) => c.latestPlacement);
      if (withData.length === 0) return null;
      return withData.reduce((best, c) =>
        (c.latestPlacement?.highestPackageLpa ?? 0) > (best.latestPlacement?.highestPackageLpa ?? 0)
          ? c
          : best
      ).id;
    },
  },
  {
    label: "Placement Rate",
    key: "placementRate",
    render: (c) =>
      c.latestPlacement ? `${c.latestPlacement.placementPercentage.toFixed(0)}%` : "N/A",
    highlight: (vals) => {
      const withData = vals.filter((c) => c.latestPlacement);
      if (withData.length === 0) return null;
      return withData.reduce((best, c) =>
        (c.latestPlacement?.placementPercentage ?? 0) >
        (best.latestPlacement?.placementPercentage ?? 0)
          ? c
          : best
      ).id;
    },
  },
  {
    label: "Total Courses",
    key: "courses",
    render: (c) => c.courses.length,
  },
  {
    label: "Top Recruiters",
    key: "recruiters",
    render: (c) => {
      if (!c.latestPlacement) return "N/A";
      const recruiters = JSON.parse(c.latestPlacement.topRecruiters) as string[];
      return (
        <div className="flex flex-wrap gap-1 justify-center">
          {recruiters.slice(0, 3).map((r) => (
            <span key={r} className="text-xs bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">
              {r}
            </span>
          ))}
          {recruiters.length > 3 && (
            <span className="text-xs text-slate-400">+{recruiters.length - 3}</span>
          )}
        </div>
      );
    },
  },
];

export function CompareClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const ids = searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  const [saveName, setSaveName] = useState("");
  const [showSaveForm, setShowSaveForm] = useState(false);

  // EDGE CASE: < 2 or > 3 IDs in URL — show guidance instead of empty API call
  const validIds = ids.slice(0, 3);

  const { data, isLoading, isError } = useQuery<CompareResponse>({
    queryKey: ["compare", validIds],
    queryFn: async () => {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collegeIds: validIds }),
      });
      if (!res.ok) {
        const err = (await res.json()) as { error?: { message: string } };
        throw new Error(err.error?.message ?? "Failed to load comparison");
      }
      return res.json() as Promise<CompareResponse>;
    },
    enabled: validIds.length >= 2,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/saved/comparisons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: saveName, collegeIds: validIds }),
      });
      if (!res.ok) throw new Error("Failed to save comparison");
    },
    onSuccess: () => {
      toast.success("Comparison saved!");
      setShowSaveForm(false);
      setSaveName("");
    },
    onError: (err) => toast.error(err.message),
  });

  const colleges = data?.colleges ?? [];

  // Not enough IDs
  if (validIds.length < 2) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <GraduationCapIcon className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Compare Colleges</h1>
        <p className="text-slate-500 mb-6">
          Select 2–3 colleges from the listing page using the compare button (⇄) on each card.
          They&apos;ll appear in the tray at the bottom, then click &quot;Compare&quot;.
        </p>
        <Link
          href="/colleges"
          className="inline-flex items-center gap-2 bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Browse Colleges
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 mb-1"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-slate-900">College Comparison</h1>
        </div>

        {session?.user && colleges.length >= 2 && (
          <button
            onClick={() => setShowSaveForm((v) => !v)}
            className="flex items-center gap-2 text-sm bg-indigo-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <BookmarkIcon className="w-4 h-4" />
            Save Comparison
          </button>
        )}
      </div>

      {/* Save comparison form */}
      {showSaveForm && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex gap-3">
          <input
            type="text"
            value={saveName}
            onChange={(e) => setSaveName(e.target.value)}
            placeholder="Name this comparison (e.g. My Engineering Shortlist)"
            className="flex-1 text-sm border border-indigo-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
          />
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!saveName.trim() || saveMutation.isPending}
            className="flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-60"
          >
            {saveMutation.isPending ? <Spinner className="w-4 h-4" /> : <CheckIcon className="w-4 h-4" />}
            Save
          </button>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner className="text-indigo-600 w-8 h-8" />
        </div>
      )}

      {isError && (
        <div className="text-center py-16 text-red-600">Failed to load comparison. Please try again.</div>
      )}

      {!isLoading && !isError && colleges.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-separate border-spacing-0">
            <thead>
              <tr>
                {/* First column is sticky on desktop scroll */}
                <th className="sticky left-0 bg-slate-50 w-40 text-left p-3 text-sm font-semibold text-slate-500 border-b border-slate-200 z-10">
                  Criterion
                </th>
                {colleges.map((c) => (
                  <th key={c.id} className="text-center p-3 border-b border-slate-200 min-w-[200px]">
                    <Link
                      href={`/colleges/${c.slug}`}
                      className="block text-sm font-bold text-indigo-700 hover:underline"
                    >
                      {c.name}
                    </Link>
                    <p className="text-xs text-slate-500 font-normal mt-0.5">
                      {c.city}, {c.state}
                    </p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row, rowIdx) => {
                const bestId = row.highlight?.(colleges);
                return (
                  <tr key={row.key} className={rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                    {/* Sticky label column */}
                    <td
                      className={cn(
                        "sticky left-0 z-10 p-3 text-sm font-medium text-slate-600 border-b border-slate-100",
                        rowIdx % 2 === 0 ? "bg-white" : "bg-slate-50"
                      )}
                    >
                      {row.label}
                    </td>
                    {colleges.map((c) => (
                      <td
                        key={c.id}
                        className={cn(
                          "p-3 text-sm text-center border-b border-slate-100",
                          bestId === c.id && "bg-emerald-50 text-emerald-800 font-semibold"
                        )}
                      >
                        {bestId === c.id && (
                          <TrophyIcon className="w-3.5 h-3.5 text-emerald-500 inline mr-1" />
                        )}
                        {row.render(c)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Courses breakdown */}
      {!isLoading && colleges.length > 0 && (
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Courses Breakdown</h2>
          <div className={cn("grid gap-4", colleges.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3")}>
            {colleges.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-3 text-sm">{c.name}</h3>
                {c.courses.length === 0 ? (
                  <p className="text-slate-400 text-sm">No courses listed</p>
                ) : (
                  <ul className="space-y-2">
                    {c.courses.slice(0, 5).map((course) => (
                      <li key={course.id} className="text-sm border-b border-slate-50 pb-2">
                        <p className="font-medium text-slate-800">{course.name}</p>
                        <p className="text-slate-500 text-xs">
                          {course.degree} · {course.durationYears}yr · {formatINR(course.totalFees)} total
                        </p>
                      </li>
                    ))}
                    {c.courses.length > 5 && (
                      <p className="text-xs text-indigo-600">+{c.courses.length - 5} more</p>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
