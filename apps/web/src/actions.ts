"use server";

import { getUserSupabase } from "@compass/db";
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

export type SaveOrderResult = { ok: boolean; count: number; persisted: boolean } | null;

// ponytail: order always applies locally; live insert is best-effort (needs 0003 policies)
export async function saveOrder(_prev: SaveOrderResult, formData: FormData): Promise<SaveOrderResult> {
  try {
    const order = JSON.parse(String(formData.get("order") ?? "[]")) as unknown;
    if (!Array.isArray(order) || !order.every((c) => typeof c === "string")) return { ok: false, count: 0, persisted: false };
    let onboarding: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(String(formData.get("onboarding") ?? "{}")) as unknown;
      if (parsed && typeof parsed === "object") onboarding = parsed as Record<string, unknown>;
    } catch {
      /* keep {} */
    }
    const token = String(formData.get("token") ?? "");
    const sb = token ? getUserSupabase(token) : null;
    if (sb) {
      const { data } = await sb.auth.getUser().catch(() => ({ data: { user: null } }));
      if (data?.user) {
        const { error } = await sb
          .from("wishlists")
          .insert({ user_id: data.user.id, onboarding, suggestions: order });
        if (!error) return { ok: true, count: order.length, persisted: true };
      }
    }
    return { ok: true, count: order.length, persisted: false };
  } catch {
    return { ok: false, count: 0, persisted: false };
  }
}
