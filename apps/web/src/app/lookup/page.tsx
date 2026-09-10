import { CURRENT_USER } from "../../mocks";
import { LookupForm } from "../../islands";

export const metadata = { title: "Tra cứu Thứ hạng & Phổ điểm - Compass" };

export default async function LookupPage({
  searchParams,
}: {
  searchParams?: Promise<{ score?: string; combo?: string }>;
}) {
  const params = (await searchParams) ?? {};
  const parsed = Number(params.score);
  const score = Number.isFinite(parsed) && parsed >= 0 && parsed <= 30 ? parsed : CURRENT_USER.score;
  const combo = (params.combo ?? CURRENT_USER.combo).toUpperCase();
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <p className="mx-auto w-fit rounded-full bg-[var(--secondary-container)] px-3 py-1.5 text-center text-xs font-semibold text-[var(--on-secondary-container)] dark:text-white">
        Dữ liệu Kỳ thi THPTQG 2025 · CT2018 &amp; CT2006 · Bảo mật không cần SBD
      </p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.04em] text-[var(--accent)] uppercase">Tra cứu</p>
          <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
            Tra cứu Thứ hạng &amp; Phổ điểm THPTQG
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
            Nhập điểm số dự kiến hoặc kết quả thi tốt nghiệp để xác định tọa độ phân vị của bạn trên phổ điểm toàn quốc.
          </p>
        </div>
        <dl className="flex shrink-0 gap-2">
          <div className="rounded-xl bg-surface px-4 py-2 text-center shadow-sm">
            <dt className="text-[11px] text-muted">Mẫu chuẩn hóa</dt>
            <dd className="text-base font-bold tabular-nums text-ink">900.000</dd>
          </div>
          <div className="rounded-xl bg-surface px-4 py-2 text-center shadow-sm">
            <dt className="text-[11px] text-muted">Thang điểm</dt>
            <dd className="text-base font-bold tabular-nums text-ink">30.00</dd>
          </div>
        </dl>
      </div>
      <div className="mt-8">
        <LookupForm defaultScore={score} defaultCombo={combo} />
      </div>
    </div>
  );
}
