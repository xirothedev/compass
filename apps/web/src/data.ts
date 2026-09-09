import { getSupabase } from "@compass/db";
import type { Nganh, Review } from "./mocks";

// ponytail: live Supabase for volatile data (cutoffs, reviews, rank distribution).
// Curated catalog fields (nhóm ngành, học phí chữ, khu vực) have no DB columns yet,
// so schools list stays on mocks until the schema grows them. Null = use mocks.
export async function getCutoffsBySchool(ma: string): Promise<Nganh[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const upper = ma.toUpperCase();
    const [{ data: majors }, { data: cuts }] = await Promise.all([
      sb.from("majors").select("ma_nganh,ten_nganh,to_hop,chi_tieu,hoc_phi_nam").eq("ma_truong", upper).eq("nam", 2024),
      sb.from("cutoffs").select("ma_nganh,to_hop,nam,diem").eq("ma_truong", upper).in("nam", [2022, 2023, 2024]).eq("phuong_thuc", "THPTQG"),
    ]);
    if (!majors?.length) return null;
    const byYear = new Map<string, { y2022: number; y2023: number; y2024: number }>();
    for (const c of cuts ?? []) {
      const k = `${c.ma_nganh}|${c.to_hop ?? ""}`;
      const e = byYear.get(k) ?? { y2022: NaN, y2023: NaN, y2024: NaN };
      if (c.nam === 2022) e.y2022 = Number(c.diem);
      if (c.nam === 2023) e.y2023 = Number(c.diem);
      if (c.nam === 2024) e.y2024 = Number(c.diem);
      byYear.set(k, e);
    }
    const fmtTrieu = (v: number | null) => (v ? `~${Math.round(v / 1_000_000)} triệu/năm` : "Liên hệ trường");
    return majors.map((m) => {
      const combos: string[] = Array.isArray(m.to_hop) && m.to_hop.length > 0 ? m.to_hop : ["A00"];
      const y = byYear.get(`${m.ma_nganh}|${combos[0]}`) ?? { y2022: NaN, y2023: NaN, y2024: NaN };
      return {
        maNganh: m.ma_nganh,
        ten: m.ten_nganh,
        truong: upper,
        toHop: combos,
        phuongThuc: ["Thi tốt nghiệp THPTQG"],
        diemChuan: {
          y2022: Number.isFinite(y.y2022) ? y.y2022 : 0,
          y2023: Number.isFinite(y.y2023) ? y.y2023 : 0,
          y2024: Number.isFinite(y.y2024) ? y.y2024 : 0,
        },
        chiTieu: m.chi_tieu ? `Chỉ tiêu: ~${m.chi_tieu} sinh viên` : "Chỉ tiêu: đang cập nhật",
        hocPhi: fmtTrieu(m.hoc_phi_nam),
      };
    });
  } catch {
    return null;
  }
}

export async function getReviewsBySchool(ma: string): Promise<Review[] | null> {
  const sb = getSupabase();
  if (!sb) return null;
  try {
    const { data, error } = await sb
      .from("reviews")
      .select("comment")
      .eq("ma_truong", ma.toUpperCase())
      .eq("status", "published")
      .limit(6);
    if (error || !data?.length) return null;
    return data
      .filter((r) => r.comment)
      .map((r, i) => ({
        tacGia: `Người dùng ${i + 1}`,
        vaiTro: "Đã xác thực",
        noiDung: r.comment as string,
        truong: ma.toUpperCase(),
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
    .select("diem,cnt")
    .eq("to_hop", combo.toUpperCase())
    .is("tinh", null)
    .order("nam", { ascending: false })
    .limit(2000);
  if (error || !data?.length) return null;
  let total = 0;
  let above = 0;
  for (const r of data) {
    const cnt = Number(r.cnt) || 0;
    total += cnt;
    if (Number(r.diem) > score) above += cnt;
  }
  if (total === 0) return null;
  const rank = above + 1;
  return { rank, percentile: (rank / total) * 100 };
}
