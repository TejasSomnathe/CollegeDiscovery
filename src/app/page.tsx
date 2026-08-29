import Link from "next/link";
import { ArrowRightIcon, SearchIcon, GitCompareArrowsIcon, BookmarkIcon, StarIcon } from "lucide-react";
import { db } from "@/db";
import { colleges } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { HeroSearch } from "@/components/home/hero-search";

// Fetch a few stats for the hero section at build/request time (ISR-friendly)
async function getStats() {
  const [countResult, streamsResult] = await Promise.all([
    db.select({ count: sql<number>`COUNT(*)::int` }).from(colleges),
    db.selectDistinct({ state: colleges.state }).from(colleges),
  ]);
  return {
    totalColleges: countResult[0]?.count ?? 0,
    totalStates: streamsResult.length,
  };
}

const QUICK_FILTERS = [
  { label: "Engineering", stream: "Engineering", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
  { label: "Medical", stream: "Medical", color: "bg-red-100 text-red-700 hover:bg-red-200" },
  { label: "Management", stream: "Management", color: "bg-purple-100 text-purple-700 hover:bg-purple-200" },
  { label: "Arts & Science", stream: "Arts", color: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200" },
  { label: "Law", stream: "Law", color: "bg-teal-100 text-teal-700 hover:bg-teal-200" },
];

const HOW_IT_WORKS = [
  {
    icon: SearchIcon,
    title: "Search & Filter",
    desc: "Find colleges by stream, city, fees, ratings, and more. Results are shareable via URL.",
  },
  {
    icon: GitCompareArrowsIcon,
    title: "Compare Side-by-Side",
    desc: "Select 2–3 colleges and compare placements, fees, courses, and accreditation.",
  },
  {
    icon: BookmarkIcon,
    title: "Save Your Shortlist",
    desc: "Bookmark colleges and save comparisons to revisit later after signing in.",
  },
];

export default async function HomePage() {
  const { totalColleges, totalStates } = await getStats();

  return (
    <div className="flex flex-col">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-indigo-400/10" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <span className="inline-block bg-white/10 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/20">
            🎓 India&apos;s College Discovery Platform
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
            Find Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Perfect College
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-indigo-200 max-w-2xl mx-auto">
            Search, compare, and shortlist from{" "}
            <strong className="text-white">{totalColleges}+ colleges</strong> across{" "}
            <strong className="text-white">{totalStates} states</strong>. Make your enrollment
            decision with confidence.
          </p>

          {/* Search bar */}
          <div className="mt-10 max-w-2xl mx-auto">
            <HeroSearch />
          </div>

          {/* Quick filter chips */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <span className="text-indigo-300 text-sm self-center">Browse by stream:</span>
            {QUICK_FILTERS.map((f) => (
              <Link
                key={f.stream}
                href={`/colleges?stream=${f.stream}`}
                className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${f.color}`}
              >
                {f.label}
              </Link>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 grid grid-cols-3 gap-4 max-w-lg mx-auto">
            {[
              { value: `${totalColleges}+`, label: "Colleges" },
              { value: `${totalStates}+`, label: "States" },
              { value: "5", label: "Streams" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-indigo-300 text-sm mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">How CampusPath Works</h2>
        <p className="text-slate-500 text-center mb-10">Three steps to find your ideal college</p>
        <div className="grid md:grid-cols-3 gap-6">
          {HOW_IT_WORKS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.title}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  Step {i + 1}
                </span>
                <h3 className="font-bold text-slate-900 mt-1 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Top Colleges Preview ──────────────────────────────────────────── */}
      <TopCollegesPreview />

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-2xl mx-auto text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Ready to find your college?
          </h2>
          <p className="text-indigo-200 mb-8">
            Join thousands of students making informed enrollment decisions.
          </p>
          <Link
            href="/colleges"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Explore All Colleges <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}

async function TopCollegesPreview() {
  const top = await db
    .select({
      id: colleges.id,
      slug: colleges.slug,
      name: colleges.name,
      city: colleges.city,
      state: colleges.state,
      stream: colleges.stream,
      avgRating: colleges.avgRating,
      feesMin: colleges.feesMin,
      feesMax: colleges.feesMax,
    })
    .from(colleges)
    .orderBy(desc(colleges.avgRating))
    .limit(6);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Top Rated Colleges</h2>
          <p className="text-slate-500 text-sm mt-1">Highest rated across all streams</p>
        </div>
        <Link
          href="/colleges?sort=rating_desc"
          className="text-indigo-600 text-sm font-semibold hover:underline flex items-center gap-1"
        >
          See all <ArrowRightIcon className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {top.map((c) => (
          <Link
            key={c.id}
            href={`/colleges/${c.slug}`}
            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-indigo-200 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {c.stream}
              </span>
              <span className="flex items-center gap-1 text-sm font-bold text-amber-600">
                <StarIcon className="w-4 h-4 fill-amber-400 text-amber-400" />
                {c.avgRating.toFixed(1)}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-indigo-700 transition-colors line-clamp-2">
              {c.name}
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {c.city}, {c.state}
            </p>
            <p className="text-slate-700 text-sm font-medium mt-2">
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(c.feesMin)}{" "}
              –{" "}
              {new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
              }).format(c.feesMax)}
              <span className="text-slate-400 font-normal"> /yr</span>
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
