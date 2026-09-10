import { getSupabase } from "@compass/db";
import { AVAILABLE_YEARS, DEFAULT_YEAR, parseYear } from "@compass/ui";
import type { Major, Review } from "./mocks";

export { AVAILABLE_YEARS, DEFAULT_YEAR, parseYear };
// ponytail: live Supabase for volatile data (cutoffs, reviews, rank distribution).
// Curated catalog fields (groups, display tuition, region) have no DB columns yet,
// so schools list stays on mocks until the schema grows them.
// Null = no Supabase (use mocks in dev). [] = live but no rows (show empty state).

export async function getCutoffsBySchool(code: string, year = DEFAULT_YEAR): Promise<Major[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const upper = code.toUpperCase();
    const selectedYear = parseYear(year);
    const [majorsRes, cutsRes] = await Promise.all([
      sb.from("majors").select("major_code,major_name,combos,quota,tuition_per_year").eq("school_code", upper).eq("year", selectedYear),
      sb.from("cutoffs").select("major_code,combo,year,score").eq("school_code", upper).in("year", [2022, 2023, 2024, 2025]).eq("method", "THPTQG"),
    ]);
    let majors = majorsRes.data;
    if (!majors?.length) {
      // ponytail: majors are versioned per year; fall back to 2024 list so old rows still show
      const fb = await sb.from("majors").select("major_code,major_name,combos,quota,tuition_per_year").eq("school_code", upper).eq("year", 2024);
      majors = fb.data;
    }
    if (!majors?.length) return [];
    const byYear = new Map<string, { y2022: number; y2023: number; y2024: number; y2025: number }>();
    for (const c of cutsRes.data ?? []) {
      const k = `${c.major_code}|${c.combo ?? ""}`;
      const e = byYear.get(k) ?? { y2022: NaN, y2023: NaN, y2024: NaN, y2025: NaN };
      if (c.year === 2022) e.y2022 = Number(c.score);
      if (c.year === 2023) e.y2023 = Number(c.score);
      if (c.year === 2024) e.y2024 = Number(c.score);
      if (c.year === 2025) e.y2025 = Number(c.score);
      byYear.set(k, e);
    }
    const fmtTrieu = (v: number | null) => (v ? `~${Math.round(v / 1_000_000)} triệu/năm` : "Liên hệ trường");
    return majors.map((m) => {
      const combos: string[] = Array.isArray(m.combos) && m.combos.length > 0 ? m.combos : ["A00"];
      const y = byYear.get(`${m.major_code}|${combos[0]}`) ?? { y2022: NaN, y2023: NaN, y2024: NaN, y2025: NaN };
      return {
        code: m.major_code,
        name: m.major_name,
        school_code: upper,
        combos,
        methods: ["THPTQG"],
        cutoffs: {
          y2022: Number.isFinite(y.y2022) ? y.y2022 : 0,
          y2023: Number.isFinite(y.y2023) ? y.y2023 : 0,
          y2024: Number.isFinite(y.y2024) ? y.y2024 : 0,
          y2025: Number.isFinite(y.y2025) ? y.y2025 : 0,
        },
        quota: m.quota ? `Chỉ tiêu: ~${m.quota} sinh viên` : "Chỉ tiêu: đang cập nhật",
        tuition: fmtTrieu(m.tuition_per_year),
      };
    });
  } catch {
    return [];
  }
}

export async function getReviewsBySchool(code: string): Promise<Review[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("reviews")
      .select("comment,criteria")
      .eq("school_code", code.toUpperCase())
      .eq("status", "published")
      .limit(6);
    if (error) return [];
    if (!data?.length) return [];
    return data
      .filter((r) => r.comment || (r.criteria as Record<string, number> | null))
      .map((r, i) => {
        const criteria = (r.criteria as Record<string, number> | null) ?? undefined;
        const vals = criteria ? Object.values(criteria).filter((v) => Number.isFinite(v)) : [];
        const rating = vals.length ? vals.reduce((a, b) => a + Number(b), 0) / vals.length : undefined;
        return {
          author: `Người dùng ${i + 1}`,
          role: "Đã xác thực",
          content: (r.comment as string) || "Đánh giá theo tiêu chí.",
          school_code: code.toUpperCase(),
          rating,
          criteria,
        };
      });
  } catch {
    return [];
  }
}

export async function rankFromDistribution(
  score: number,
  combo: string,
  opts?: { exam?: string; year?: number; curriculum?: string },
): Promise<{ rank: number; percentile: number } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  // ponytail: nationwide = province_code null OR "" (pipeline writes "", seeds omit col)
  let q = sb
    .from("score_distribution")
    .select("score,count,year,ky_thi,chuong_trinh")
    .eq("combo", combo.toUpperCase())
    .or("province_code.is.null,province_code.eq.")
    .order("year", { ascending: false })
    .limit(2000);
  if (opts?.year) q = q.eq("year", opts.year);
  // exam values are "THPTQG 2025..." -> ky_thi THPTQG
  const examKey = opts?.exam ? String(opts.exam).split(" ")[0].toUpperCase() : "";
  if (examKey) q = q.eq("ky_thi", examKey);
  if (opts?.curriculum) q = q.eq("chuong_trinh", opts.curriculum.toUpperCase());
  const { data, error } = await q;
  if (error || !data?.length) return null;
  let total = 0;
  let above = 0;
  for (const r of data) {
    const count = Number(r.count) || 0;
    total += count;
    if (Number(r.score) > score) above += count;
  }
  if (total === 0) return null;
  const rank = above + 1;
  return { rank, percentile: (rank / total) * 100 };
}
