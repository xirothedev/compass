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

// ponytail: 0 = no data for that year; newest non-zero wins
export function latestCutoff(cutoffs: YearCutoffs): number {
  if (cutoffs.y2025 > 0) return cutoffs.y2025;
  if (cutoffs.y2024 > 0) return cutoffs.y2024;
  if (cutoffs.y2023 > 0) return cutoffs.y2023;
  if (cutoffs.y2022 > 0) return cutoffs.y2022;
  return 0;
}

// ponytail: bucket uses selected year; latest fallback so missing never fakes safe
export function bucketCutoff(cutoffs: YearCutoffs, year: number): number {
  const selected = cutoffForYear(cutoffs, year);
  return selected > 0 ? selected : latestCutoff(cutoffs);
}

// ponytail: one missing-score display for cards, tables, reorder list
export function formatScore(value: number): string {
  return value > 0 ? value.toFixed(2) : "—";
}
