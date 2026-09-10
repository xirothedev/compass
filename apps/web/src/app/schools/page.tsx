import Link from "next/link";
import { Suspense } from "react";
import { SCHOOLS, MAJORS, toCard } from "../../mocks";
import { parseYear } from "../../data";
import { SchoolFilters, YearSelect } from "../../islands";

export const metadata = { title: "Danh mục Trường & Điểm chuẩn - Compass" };

export default async function SchoolsPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string; year?: string }>;
}) {
  const query = (await searchParams) ?? {};
  const q = query.q ?? "";
  const year = parseYear(query.year);
  const schools = SCHOOLS.map((t) => ({
    ...toCard(t, year),
    kind: t.kind,
    region: t.region,
    groups: t.groups,
    majors: MAJORS.filter((n) => n.school_code === t.code).length,
  }));
  const regions = [...new Set(SCHOOLS.map((t) => t.region))];
  const groups = [...new Set(SCHOOLS.flatMap((t) => t.groups))];
  const kinds = [...new Set(SCHOOLS.map((t) => t.kind))];
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8 lg:px-12">
      <nav aria-label="Điều hướng" className="text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Trang chủ</Link>
        <span aria-hidden> / </span>
        <span aria-current="page" className="text-ink">Danh mục Trường &amp; Điểm chuẩn</span>
      </nav>
      <div className="mt-2 flex flex-wrap gap-2">
        <span className="rounded-full bg-[var(--secondary-container)] px-2.5 py-1 text-xs font-semibold text-[var(--on-secondary-container)] dark:text-white">
          Tuyển sinh THPTQG 2025
        </span>
        <span className="rounded-full bg-[var(--secondary-container)] px-2.5 py-1 text-xs font-semibold text-[var(--on-secondary-container)] dark:text-white">
          Cập nhật Đề án mới nhất
        </span>
      </div>
      <h1 className="mt-3 text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
        Danh mục Trường &amp; Điểm chuẩn
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">
        Tra cứu toàn diện đề án tuyển sinh, biến động điểm chuẩn 3 năm và tổ hợp chủ lực của từng trường.
      </p>
      <div className="mt-4">
        <Suspense>
          <YearSelect year={year} />
        </Suspense>
      </div>
      <dl className="mt-4 flex gap-8">
        <div>
          <dt className="sr-only">Số trường</dt>
          <dd className="text-2xl font-bold tabular-nums text-ink">
            {SCHOOLS.length} <span className="text-sm font-medium text-muted">/ Trường</span>
          </dd>
        </div>
        <div>
          <dt className="sr-only">Số mã ngành</dt>
          <dd className="text-2xl font-bold tabular-nums text-ink">
            {MAJORS.length} <span className="text-sm font-medium text-muted">/ Mã ngành tuyển sinh</span>
          </dd>
        </div>
      </dl>
      <div className="mt-8">
        <SchoolFilters schools={schools} regions={regions} groups={groups} kinds={kinds} initialQuery={q} year={year} />
      </div>
      <div className="mt-10 flex flex-col gap-4 rounded-3xl bg-[#001736] p-8 text-white shadow-xl md:flex-row md:items-center md:justify-between md:p-12">
        <div>
          <h2 className="text-xl font-semibold">Chưa rõ điểm thi của bạn phù hợp với Trường nào?</h2>
          <p className="mt-1 text-sm text-white/75">
            Sử dụng công cụ phân tích tự động theo thuật toán phân phối phổ điểm.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/lookup"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[#006972] px-5 text-sm font-semibold text-white hover:bg-[#00838f]"
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
