import { getSupabase } from "@compass/db";
import { AVAILABLE_YEARS, DEFAULT_YEAR, parseYear, type YearCutoffs } from "@compass/ui";
import type { Major, Review } from "./mocks";

export { AVAILABLE_YEARS, DEFAULT_YEAR, parseYear };
export type { YearCutoffs };
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
    const [{ data: majors }, { data: cuts }] = await Promise.all([
      sb.from("majors").select("major_code,major_name,combos,quota,tuition_per_year").eq("school_code", upper).eq("year", selectedYear),
      sb.from("cutoffs").select("major_code,combo,year,score").eq("school_code", upper).in("year", [2022, 2023, 2024, 2025]).eq("method", "THPTQG"),
    ]);
    // ponytail: no cross-year fallback; empty majors = empty state for that year
    if (!majors?.length) return [];
    const byYear = new Map<string, { y2022: number; y2023: number; y2024: number; y2025: number }>();
    for (const c of cuts ?? []) {
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

// ponytail: bulk overlay for suggestions (mock catalog + live cutoffs).
// Key SCHOOL|MAJOR; exact-combo rows win over combo-null rows per year. Null = no Supabase.
export async function getCutoffMap(combo: string): Promise<Map<string, YearCutoffs> | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const c = combo.toUpperCase();
    const { data, error } = await sb
      .from("cutoffs")
      .select("school_code,major_code,combo,year,score")
      .in("year", [2022, 2023, 2024, 2025])
      .eq("method", "THPTQG")
      .or(`combo.eq.${c},combo.is.null`);
    const map = new Map<string, YearCutoffs>();
    if (error || !data) return map;
    const exactYear = new Set<string>();
    for (const r of data) {
      const key = `${String(r.school_code).toUpperCase()}|${String(r.major_code)}`;
      const y = Number(r.year);
      if (y !== 2022 && y !== 2023 && y !== 2024 && y !== 2025) continue;
      const isExact = String(r.combo ?? "").toUpperCase() === c;
      const ek = `${key}|${y}`;
      if (!isExact && exactYear.has(ek)) continue;
      const e = map.get(key) ?? { y2022: 0, y2023: 0, y2024: 0, y2025: 0 };
      const v = Number(r.score) || 0;
      if (y === 2022) e.y2022 = v;
      else if (y === 2023) e.y2023 = v;
      else if (y === 2024) e.y2024 = v;
      else e.y2025 = v;
      map.set(key, e);
      if (isExact) exactYear.add(ek);
    }
    return map;
  } catch {
    return new Map();
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
