"use server";

import { interpRank, rankPercentile } from "@compass/ui";
import { rankFromDistribution } from "./data";

export type RankResult = { score: number; combo: string; rank: number; percentile: number };

export async function calcRank(
  _prev: RankResult | null,
  formData: FormData,
): Promise<RankResult | null> {
  const score = Number(formData.get("score"));
  const combo = String(formData.get("combo") ?? "A00").toUpperCase();
  if (!Number.isFinite(score) || score < 0 || score > 30) return null;
  const exam = String(formData.get("exam") ?? "THPTQG 2025 (Chính thức)");
  const program = String(formData.get("program") ?? "CT2018");
  const year = /2024/.test(exam) ? 2024 : 2025;
  // ponytail: live distribution when Supabase is configured, mock anchors otherwise
  const live = await rankFromDistribution(score, combo, { exam, year, curriculum: program }).catch(() => null);
  if (live) return { score, combo, ...live };
  const rank = interpRank(score);
  return { score, combo, rank, percentile: rankPercentile(rank) };
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
