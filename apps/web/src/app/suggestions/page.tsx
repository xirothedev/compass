import Link from "next/link";
import { BUCKET_META, PortfolioBar } from "@compass/ui";
import { classifyBucket, interpRank, rankPercentile } from "@compass/ui";
import { CURRENT_USER, NGANHS, TRUONGS } from "../../mocks";
import { SuggestionList } from "../../islands";

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ school?: string }>;
}) {
  const ma = (await searchParams)?.school ?? "";
  const school = TRUONGS.find((t) => t.ma.toLowerCase() === ma.toLowerCase());
  return {
    title: school ? `Gợi ý Nguyện vọng tại ${school.ten} - Compass` : "Gợi ý Nguyện vọng Thông minh - Compass",
  };
}

export default async function SuggestionsPage({
  searchParams,
}: {
  searchParams?: Promise<{ score?: string; combo?: string; school?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const parsed = Number(params.score);
  const score = Number.isFinite(parsed) && parsed >= 0 && parsed <= 30 ? parsed : CURRENT_USER.diem;
  const combo = (params.combo ?? CURRENT_USER.toHop).toUpperCase();
  const schoolFilter = TRUONGS.find(
    (t) => t.ma.toLowerCase() === (params.school ?? "").toLowerCase(),
  );
  const top = rankPercentile(interpRank(score));
  const scored = NGANHS.filter(
    (n) => n.toHop.includes(combo) && (!schoolFilter || n.truong === schoolFilter.ma),
  ).map((n) => {
    const delta = score - n.diemChuan.y2024;
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
  const deltas: Record<string, number> = Object.fromEntries(scored.map((r) => [r.code, r.delta ?? 0]));

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Trang chủ</Link>
        <span aria-hidden>›</span>
        <span aria-current="page" className="text-ink">Gợi ý nguyện vọng thông minh</span>
        <span className="ml-auto hidden rounded-full border border-line bg-surface px-2.5 py-1 text-xs sm:block">
          Thuật toán phân tích Phổ điểm 2025
        </span>
      </nav>

      <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Hồ sơ Thí sinh</p>
            <p className="text-[13px] tabular-nums text-muted">Mã số: {CURRENT_USER.maSo}</p>
          </div>
          <dl className="flex flex-wrap gap-2 sm:ml-auto">
            {[
              ["Tổ hợp", combo],
              ["Điểm", score.toFixed(2)],
              ["Thứ hạng", `Top ${top.toFixed(1)}%`],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg bg-surface-2 px-3 py-2 text-center">
                <dt className="text-[11px] text-muted">{l}</dt>
                <dd className="text-sm font-bold tabular-nums text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          <Link
            href="/onboarding"
            className="inline-flex h-11 items-center rounded-lg border border-line px-4 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            Đổi tổ hợp / Điểm
          </Link>
        </div>
      </div>

      <p className="mt-6 text-xs font-semibold tracking-[0.04em] text-[var(--accent)] uppercase">Gợi ý nguyện vọng</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
        Danh mục Gợi ý Nguyện vọng Thông minh
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
        Thuật toán Compass đã đối sánh điểm số {score.toFixed(2)} (tổ hợp {combo}) của bạn với
        điểm chuẩn 2024, chia 3 giỏ <strong className="font-semibold text-ink">Thử thách</strong> ·{" "}
        <strong className="font-semibold text-ink">Vừa sức</strong> ·{" "}
        <strong className="font-semibold text-ink">An toàn</strong>.
      </p>

      {schoolFilter ? (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-[var(--surface-container-low)] p-4">
          <p className="text-sm text-body">
            Đang xem gợi ý tại <strong className="font-semibold text-ink">{schoolFilter.ten}</strong> ·{" "}
            {scored.length} nguyện vọng hợp tổ hợp {combo}
          </p>
          <Link
            href={`/suggestions?score=${score.toFixed(2)}&combo=${encodeURIComponent(combo)}`}
            className="ml-auto text-sm font-semibold text-[var(--accent)] hover:underline"
          >
            Xem tất cả trường →
          </Link>
        </div>
      ) : null}

      <section aria-label="Cấu trúc danh mục nguyện vọng" className="mt-8">
        <h2 className="text-[22px] font-semibold leading-[30px] tracking-tight text-ink">
          Cấu trúc Danh mục Nguyện vọng (Portfolio Health)
        </h2>
        <div className="mt-4 rounded-2xl border border-line bg-surface p-5">
          <PortfolioBar safe={safe} match={match} reach={reach} />
          <dl className="mt-4 grid grid-cols-1 gap-2 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-[var(--surface-container-low)] p-4">
              <dt className="text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Tổng nguyện vọng</dt>
              <dd className="mt-1 text-[30px] font-semibold leading-[38px] tabular-nums text-ink">{scored.length}</dd>
            </div>
            <div className="rounded-xl bg-[var(--surface-container-low)] p-4">
              <dt className="text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Tỉ lệ vàng</dt>
              <dd className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm font-semibold tabular-nums text-ink">
                {(["reach", "match", "safe"] as const).map((t) => (
                  <span key={t} className="inline-flex items-center gap-1.5">
                    <span aria-hidden className={`size-2 rounded-full ${BUCKET_META[t].dot}`} />
                    {counts[t]} {BUCKET_META[t].label}
                  </span>
                ))}
              </dd>
            </div>
            <div className="rounded-xl bg-[var(--surface-container-low)] p-4">
              <dt className="text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">Điểm của bạn</dt>
              <dd className="mt-1 text-[30px] font-semibold leading-[38px] tabular-nums text-ink">{score.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section aria-label="Tất cả nguyện vọng phù hợp" className="mt-8">
        <h2 className="text-[22px] font-semibold leading-[30px] tracking-tight text-ink">
          Tất cả nguyện vọng phù hợp
        </h2>
        <div className="mt-4">
          {scored.length > 0 ? (
            <SuggestionList rows={scored} deltas={deltas} score={score} />
          ) : (
            <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
              {schoolFilter ? (
                <>
                  {schoolFilter.ten} chưa có ngành nào xét tổ hợp {combo} trong dữ liệu mẫu.{" "}
                  <Link
                    href={`/suggestions?score=${score.toFixed(2)}&combo=${encodeURIComponent(combo)}`}
                    className="font-semibold text-[var(--accent)] hover:underline"
                  >
                    Xem tất cả trường
                  </Link>
                  {" "}hoặc quay lại khảo sát.
                </>
              ) : (
                <>Chưa có ngành nào xét tổ hợp {combo} trong dữ liệu mẫu. Thử tổ hợp A00, D01 hoặc quay lại khảo sát.</>
              )}
            </p>
          )}
        </div>
      </section>

      <aside className="mt-8 rounded-2xl bg-[var(--surface-container-low)] p-5">
        <h2 className="text-base font-semibold text-ink">Quy tắc vàng xếp thứ tự nguyện vọng</h2>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm leading-relaxed text-body">
          <li>Xếp ngành yêu thích nhất lên trước, không xếp theo khả năng đỗ.</li>
          <li>Rải đều 3 nhóm: Thử thách - Vừa sức - An toàn.</li>
          <li>Luôn có ít nhất 2 nguyện vọng An toàn để chắc suất đại học.</li>
        </ol>
      </aside>
    </div>
  );
}
