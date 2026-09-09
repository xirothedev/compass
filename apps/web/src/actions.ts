"use server";

// Mock phổ điểm: anchor points (score -> rank) for ~900.000 thí sinh.
// Replaced by real distribution data in a later step (lookup domain).
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

const TOTAL = 900000;

export type RankResult = { score: number; combo: string; rank: number; percentile: number };

function interpRank(score: number): number {
  for (let i = 0; i < ANCHORS.length - 1; i++) {
    const [sHi, rHi] = ANCHORS[i];
    const [sLo, rLo] = ANCHORS[i + 1];
    if (score <= sHi && score >= sLo) {
      const t = (sHi - score) / (sHi - sLo || 1);
      return Math.round(rHi + t * (rLo - rHi));
    }
  }
  return TOTAL;
}

export async function calcRank(
  _prev: RankResult | null,
  formData: FormData,
): Promise<RankResult | null> {
  const score = Number(formData.get("score"));
  const combo = String(formData.get("combo") ?? "A00").toUpperCase();
  if (!Number.isFinite(score) || score < 0 || score > 30) return null;
  const rank = interpRank(score);
  return { score, combo, rank, percentile: (rank / TOTAL) * 100 };
}

export type SaveOrderResult = { ok: boolean; count: number } | null;

// ponytail: mock persist; real impl writes Nguyện vọng order to Supabase (guidance domain)
export async function saveOrder(_prev: SaveOrderResult, formData: FormData): Promise<SaveOrderResult> {
  try {
    const order = JSON.parse(String(formData.get("order") ?? "[]")) as unknown;
    if (!Array.isArray(order) || !order.every((c) => typeof c === "string")) return { ok: false, count: 0 };
    return { ok: true, count: order.length };
  } catch {
    return { ok: false, count: 0 };
  }
}
