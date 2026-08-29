"use client";

import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";
import { useState } from "react";

export function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`/colleges?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <SearchIcon className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search colleges by name, city, or stream..."
        className="w-full pl-12 pr-32 py-4 text-slate-900 bg-white rounded-xl shadow-xl text-base placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
      <button
        type="submit"
        className="absolute right-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-colors"
      >
        Search
      </button>
    </form>
  );
}
