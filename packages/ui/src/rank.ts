// ponytail: mock distribution lives here so lookup math is unit-testable without Next.
// Replaced by score_distribution rows when Supabase is configured (see @compass/db).
const ANCHORS: [number, number][] = [
  [30, 1],
  [28.5, 4500],
  [27, 18000],
  [26, 35000],
  [25, 60000],
  [24, 95000],
  [22.5, 170000],
  [21, 260000],
  [19.5, 380000],
  [18, 500000],
  [15, 680000],
  [0, 900000],
];

export const RANK_TOTAL = 900000;

/** Linear interpolation of rank from anchor points. Higher score -> smaller rank. */
export function interpRank(score: number): number {
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [sHi, rHi] = ANCHORS[i];
    const [sLo, rLo] = ANCHORS[i + 1];
    if (score <= sHi && score >= sLo) {
      const t = (sHi - score) / (sHi - sLo || 1);
      return Math.round(rHi + t * (rLo - rHi));
    }
  }
  return RANK_TOTAL;
}

/** Top% from rank: rank 1 -> ~0%, rank TOTAL -> 100%. */
export function rankPercentile(rank: number): number {
  return (rank / RANK_TOTAL) * 100;
}
