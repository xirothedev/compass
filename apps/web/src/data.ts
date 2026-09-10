import { getSupabase } from "@compass/db";
import type { Major, Review } from "./mocks";

// ponytail: live Supabase for volatile data (cutoffs, reviews, rank distribution).
// Curated catalog fields (groups, display tuition, region) have no DB columns yet,
// so schools list stays on mocks until the schema grows them. Null = use mocks.
export async function getCutoffsBySchool(code: string): Promise<Major[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const upper = code.toUpperCase();
    const [{ data: majors }, { data: cuts }] = await Promise.all([
      sb.from("majors").select("major_code,major_name,combos,quota,tuition_per_year").eq("school_code", upper).eq("year", 2024),
      sb.from("cutoffs").select("major_code,combo,year,score").eq("school_code", upper).in("year", [2022, 2023, 2024]).eq("method", "THPTQG"),
    ]);
    if (!majors?.length) return null;
    const byYear = new Map<string, { y2022: number; y2023: number; y2024: number }>();
    for (const c of cuts ?? []) {
      const k = `${c.major_code}|${c.combo ?? ""}`;
      const e = byYear.get(k) ?? { y2022: NaN, y2023: NaN, y2024: NaN };
      if (c.year === 2022) e.y2022 = Number(c.score);
      if (c.year === 2023) e.y2023 = Number(c.score);
      if (c.year === 2024) e.y2024 = Number(c.score);
      byYear.set(k, e);
    }
    const fmtTrieu = (v: number | null) => (v ? `~${Math.round(v / 1_000_000)} triệu/năm` : "Liên hệ trường");
    return majors.map((m) => {
      const combos: string[] = Array.isArray(m.combos) && m.combos.length > 0 ? m.combos : ["A00"];
      const y = byYear.get(`${m.major_code}|${combos[0]}`) ?? { y2022: NaN, y2023: NaN, y2024: NaN };
      return {
        code: m.major_code,
        name: m.major_name,
        school_code: upper,
        combos,
        methods: ["Thi tốt nghiệp THPTQG"],
        cutoffs: {
          y2022: Number.isFinite(y.y2022) ? y.y2022 : 0,
          y2023: Number.isFinite(y.y2023) ? y.y2023 : 0,
          y2024: Number.isFinite(y.y2024) ? y.y2024 : 0,
        },
        quota: m.quota ? `Chỉ tiêu: ~${m.quota} sinh viên` : "Chỉ tiêu: đang cập nhật",
        tuition: fmtTrieu(m.tuition_per_year),
      };
    });
  } catch {
    return null;
  }
}

export async function getReviewsBySchool(code: string): Promise<Review[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("reviews")
      .select("comment")
      .eq("school_code", code.toUpperCase())
      .eq("status", "published")
      .limit(6);
    if (error || !data?.length) return null;
    return data
      .filter((r) => r.comment)
      .map((r, i) => ({
        author: `Người dùng ${i + 1}`,
        role: "Đã xác thực",
        content: r.comment as string,
        school_code: code.toUpperCase(),
      }));
  } catch {
    return null;
  }
}

export async function rankFromDistribution(
  score: number,
  combo: string,
): Promise<{ rank: number; percentile: number } | null> {
  const sb = getSupabase();
  if (!sb) return null;
  const { data, error } = await sb
    .from("score_distribution")
    .select("score,count")
    .eq("combo", combo.toUpperCase())
    .is("province_code", null)
    .order("year", { ascending: false })
    .limit(2000);
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
