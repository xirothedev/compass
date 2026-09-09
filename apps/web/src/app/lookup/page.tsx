import { Section } from "@compass/ui";
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
  const score = Number.isFinite(parsed) && parsed >= 0 && parsed <= 30 ? parsed : CURRENT_USER.diem;
  const combo = (params.combo ?? CURRENT_USER.toHop).toUpperCase();
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <p className="mx-auto w-fit rounded-full border border-line bg-surface px-3 py-1.5 text-center text-xs text-muted">
        Dữ liệu kỳ thi 2025 · Chuẩn hóa GDPT 2018 &amp; 2006 · Bảo mật không cần SBD
      </p>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">Tra cứu</p>
          <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-ink">
            Tra cứu Thứ hạng &amp; Phổ điểm THPTQG
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
            Nhập điểm số dự kiến hoặc kết quả thi tốt nghiệp để xác định tọa độ phân vị của bạn trên phổ điểm toàn quốc.
          </p>
        </div>
        <dl className="flex shrink-0 gap-2">
          <div className="rounded-xl border border-line bg-surface px-4 py-2 text-center">
            <dt className="text-[11px] text-muted">Mẫu chuẩn hóa</dt>
            <dd className="text-base font-bold tabular-nums text-ink">900.000</dd>
          </div>
          <div className="rounded-xl border border-line bg-surface px-4 py-2 text-center">
            <dt className="text-[11px] text-muted">Thang điểm</dt>
            <dd className="text-base font-bold tabular-nums text-ink">30.00</dd>
          </div>
        </dl>
      </div>
      <div className="mt-8">
        <LookupForm defaultScore={score} defaultCombo={combo} />
      </div>
      <Section title="Cách đọc kết quả" sub="Thứ hạng càng nhỏ càng tốt. Top 5% nghĩa là điểm của bạn cao hơn 95% thí sinh cùng tổ hợp.">
        <ul className="max-w-2xl list-disc space-y-2 pl-5 text-sm leading-relaxed text-body">
          <li>Đối chiếu thứ hạng với chỉ tiêu và điểm chuẩn 3 năm của ngành mục tiêu.</li>
          <li>Phổ điểm mỗi năm dao động theo độ khó đề thi và chương trình (CT2018 / CT2006).</li>
        </ul>
      </Section>
    </div>
  );
}
