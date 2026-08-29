"use client";

import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import type { CollegeListItem } from "@/features/colleges/college.service";

interface SavedEntry {
  saved: { id: string; userId: string; collegeId: string; createdAt: string };
  college: CollegeListItem;
}

export function useSavedColleges() {
  const { data: session } = useSession();

  const query = useQuery<{ saved: SavedEntry[] }>({
    queryKey: ["saved-colleges"],
    queryFn: async () => {
      const res = await fetch("/api/saved/colleges");
      if (!res.ok) throw new Error("Failed to fetch saved colleges");
      return res.json() as Promise<{ saved: SavedEntry[] }>;
    },
    enabled: !!session?.user, // only fetch when logged in
  });

  const savedIds = new Set(query.data?.saved.map((s) => s.saved.collegeId) ?? []);

  return { ...query, savedIds };
}
