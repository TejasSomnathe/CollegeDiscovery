"use client";

/**
 * Compare context — ephemeral UI state for "selected colleges to compare".
 *
 * WHY Context (not URL state): The selection tray is session-ephemeral;
 * we don't want 3 college IDs cluttering the URL on every listing page.
 * The compare *result* page does use URL params (collegeIds) for shareability.
 *
 * WHY Context over Zustand: Simple enough case (2-3 items, 3 actions)
 * that the boilerplate of Zustand isn't worth it.
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";

interface CompareItem {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface CompareContextValue {
  selectedColleges: CompareItem[];
  addToCompare: (college: CompareItem) => boolean; // returns false if at capacity
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isSelected: (id: string) => boolean;
  canAdd: boolean;
}

const CompareContext = createContext<CompareContextValue | null>(null);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [selectedColleges, setSelectedColleges] = useState<CompareItem[]>([]);

  const addToCompare = useCallback((college: CompareItem): boolean => {
    // EDGE CASE: max 3 colleges — signal the UI to show a warning instead of silently failing
    if (selectedColleges.length >= 3) return false;
    // EDGE CASE: prevent duplicates in the tray
    if (selectedColleges.some((c) => c.id === college.id)) return true;
    setSelectedColleges((prev) => [...prev, college]);
    return true;
  }, [selectedColleges]);

  const removeFromCompare = useCallback((id: string) => {
    setSelectedColleges((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearCompare = useCallback(() => setSelectedColleges([]), []);

  const isSelected = useCallback(
    (id: string) => selectedColleges.some((c) => c.id === id),
    [selectedColleges]
  );

  return (
    <CompareContext.Provider
      value={{
        selectedColleges,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isSelected,
        canAdd: selectedColleges.length < 3,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare(): CompareContextValue {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used within CompareProvider");
  return ctx;
}
