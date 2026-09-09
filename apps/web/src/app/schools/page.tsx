import Link from "next/link";
import { TRUONGS, NGANHS } from "../../mocks";
import { SchoolFilters } from "../../islands";

export const metadata = { title: "Danh mục Trường & Điểm chuẩn - Compass" };

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const q = (await searchParams)?.q ?? "";
  const schools = TRUONGS.map((t) => ({
    code: t.ma,
    name: t.ten,
    combos: t.toHopChuLuc,
    cutoff2024: t.diemChuan2024,
    trend: t.xuHuong,
    tuition: t.hocPhi,
    kind: t.loaiHinh,
    region: t.khuVuc,
    groups: t.nhomNganh,
    majors: NGANHS.filter((n) => n.truong === t.ma).length,
  }));
  const regions = [...new Set(TRUONGS.map((t) => t.khuVuc))];
  const groups = [...new Set(TRUONGS.flatMap((t) => t.nhomNganh))];
  const kinds = [...new Set(TRUONGS.map((t) => t.loaiHinh))];
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Trang chủ</Link>
        <span aria-hidden> / </span>
        <span aria-current="page" className="text-ink">Danh mục Trường &amp; Điểm chuẩn</span>
      </nav>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-accent">
          Tuyển sinh Đại học 2025
        </span>
        <span className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-accent">
          Cập nhật Đề án mới nhất
        </span>
      </div>
      <h1 className="mt-3 text-[32px] font-bold leading-[40px] tracking-tight text-ink">
        Danh mục Trường &amp; Điểm chuẩn Đại học
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
        Tra cứu toàn diện đề án tuyển sinh, biến động điểm chuẩn 3 năm và tổ hợp chủ lực của từng trường.
      </p>
      <dl className="mt-4 flex gap-8">
        <div>
          <dt className="sr-only">Số trường</dt>
          <dd className="text-2xl font-bold tabular-nums text-ink">
            {TRUONGS.length} <span className="text-sm font-medium text-muted">/ Trường Đại học</span>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Số mã ngành</dt>
          <dd className="text-2xl font-bold tabular-nums text-ink">
            {NGANHS.length} <span className="text-sm font-medium text-muted">/ Mã ngành tuyển sinh</span>
          </dd>
        </div>
      </dl>
      <div className="mt-8">
        <SchoolFilters schools={schools} regions={regions} groups={groups} kinds={kinds} initialQuery={q} />
      </div>
      <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-[#001736] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <h2 className="text-xl font-semibold">Chưa rõ điểm thi của bạn phù hợp với Trường nào?</h2>
          <p className="mt-1 text-sm text-white/75">
            Sử dụng công cụ phân tích tự động theo thuật toán phân phối phổ điểm.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/lookup"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#00838f] px-5 text-sm font-semibold text-white hover:bg-[#006972]"
          >
            Tra cứu Thứ hạng điểm
          </Link>
          <Link
            href="/suggestions"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-white/60 px-5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Gợi ý Nguyện vọng →
          </Link>
        </div>
      </div>
    </div>
  );
}
