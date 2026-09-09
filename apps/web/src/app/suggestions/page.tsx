import { PortfolioBar, Section } from "@compass/ui";
import { classifyBucket } from "@compass/ui";
import { CURRENT_USER, NGANHS, TRUONGS } from "../../mocks";
import { SuggestionList } from "../../islands";

export const metadata = { title: "Gợi ý Nguyện vọng Thông minh - Compass" };

export default function SuggestionsPage() {
  const scored = NGANHS.filter((n) => n.toHop.includes(CURRENT_USER.toHop)).map((n) => {
    const delta = CURRENT_USER.diem - n.diemChuan.y2024;
    const school = TRUONGS.find((t) => t.ma === n.truong);
    return {
      code: n.maNganh,
      name: `${n.ten} - ${school?.ten ?? n.truong}`,
      combos: n.toHop.join(", "),
      method: n.phuongThuc[0],
      y2022: n.diemChuan.y2022,
      y2023: n.diemChuan.y2023,
      y2024: n.diemChuan.y2024,
      tier: classifyBucket(delta),
      delta,
    };
  });
  const counts = scored.reduce(
    (acc, r) => ({ ...acc, [r.tier]: acc[r.tier] + 1 }),
    { safe: 0, match: 0, reach: 0 } as Record<"safe" | "match" | "reach", number>,
  );
  const { safe, match, reach } = counts;
  const deltas: Record<string, number> = Object.fromEntries(scored.map((r) => [r.code, r.delta]));

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.04em] text-[#006972] uppercase">Gợi ý nguyện vọng</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-[#0d2c54]">
        Danh mục Gợi ý Nguyện vọng Thông minh
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#43474e]">
        Thuật toán Compass đã đối sánh điểm số {CURRENT_USER.diem.toFixed(2)} (tổ hợp {CURRENT_USER.toHop}) của
        bạn với điểm chuẩn 2024. Mã số xét tuyển: {CURRENT_USER.maSo}.
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a href="/onboarding" className="inline-flex h-11 items-center justify-center rounded-lg border border-[#e2e5eb] bg-white px-5 text-sm font-semibold text-[#0d2c54] hover:bg-[#f1f5f9]">
          Đổi tổ hợp / Điểm
        </a>
        <button type="button" disabled title="Xuất file - sẽ có ở bước sau" className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-lg border border-[#e2e5eb] bg-white px-5 text-sm font-semibold text-[#0d2c54] opacity-60">
          Xuất PDF / Excel
        </button>
      </div>

      <Section title="Cấu trúc Danh mục Nguyện vọng (Portfolio Health)">
        <div className="max-w-2xl rounded-2xl border border-[#e2e5eb] bg-white p-5">
          <PortfolioBar safe={safe} match={match} reach={reach} />
        </div>
      </Section>

      <Section title="Tất cả nguyện vọng phù hợp">
        <SuggestionList rows={scored} deltas={deltas} score={CURRENT_USER.diem} />
      </Section>

      <Section title="Quy tắc vàng xếp thứ tự nguyện vọng">
        <ol className="max-w-2xl list-decimal space-y-2 pl-5 text-sm leading-relaxed text-[#43474e]">
          <li>Xếp ngành yêu thích nhất lên trước, không xếp theo khả năng đỗ.</li>
          <li>Rải đều 3 nhóm: Thử thách - Vừa sức - An toàn.</li>
          <li>Luôn có ít nhất 2 nguyện vọng An toàn để chắc suất đại học.</li>
        </ol>
      </Section>
    </div>
  );
}
