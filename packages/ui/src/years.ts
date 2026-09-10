// ponytail: single source for Diem chuan year range
export const AVAILABLE_YEARS = [2022, 2023, 2024, 2025] as const;
export type AvailableYear = (typeof AVAILABLE_YEARS)[number];
export const DEFAULT_YEAR: AvailableYear = 2024;

export function parseYear(value: unknown): AvailableYear {
  const n = typeof value === "string" ? Number(value) : typeof value === "number" ? value : NaN;
  return (AVAILABLE_YEARS as readonly number[]).includes(n) ? (n as AvailableYear) : DEFAULT_YEAR;
}

// ponytail: dynamic key access without rewriting every call site
export type YearCutoffs = { y2022: number; y2023: number; y2024: number; y2025: number };

export function cutoffForYear(cutoffs: YearCutoffs, year: number): number {
  if (year === 2025) return cutoffs.y2025;
  if (year === 2023) return cutoffs.y2023;
  if (year === 2022) return cutoffs.y2022;
  return cutoffs.y2024;
}
