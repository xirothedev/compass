import Link from "next/link";
import { notFound } from "next/navigation";
import { Section, TierBadge } from "@compass/ui";
import { classifyBucket } from "@compass/ui";
import { CURRENT_USER, REVIEWS, TRUONGS, getNganhsByTruong, getTruong } from "../../../mocks";
import { getCutoffsBySchool, getReviewsBySchool } from "../../../data";
import { DetailMajorFilter, FollowButton } from "../../../islands";

export function generateStaticParams() {
  return TRUONGS.map((t) => ({ code: t.ma.toLowerCase() }));
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const school = getTruong(code);
  if (!school) notFound();
  const majors = (await getCutoffsBySchool(school.ma)) ?? getNganhsByTruong(school.ma);
  const rows = majors.map((m) => ({
    code: m.maNganh,
    name: m.ten,
    combos: m.toHop.join(", "),
    method: m.phuongThuc[0],
    y2022: m.diemChuan.y2022,
    y2023: m.diemChuan.y2023,
    y2024: m.diemChuan.y2024,
    tier: classifyBucket(CURRENT_USER.diem - m.diemChuan.y2024),
  }));
  const combos = [...new Set(majors.flatMap((m) => m.toHop))];
  const cutoffs = majors.map((m) => m.diemChuan.y2024).filter((v) => v > 0);
  const lo = cutoffs.length ? Math.min(...cutoffs) : 0;
  const hi = cutoffs.length ? Math.max(...cutoffs) : 0;
  const reviews = (await getReviewsBySchool(school.ma)) ?? REVIEWS.filter((r) => r.truong === school.ma);
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <nav aria-label="Breadcrumb" className="text-[13px] text-muted">
        <Link href="/" className="hover:text-ink">Trang chủ</Link>
        <span aria-hidden> / </span>
        <Link href="/schools" className="hover:text-ink">Danh mục Trường &amp; Điểm chuẩn</Link>
        <span aria-hidden> / </span>
        <span aria-current="page" className="text-ink">{school.ten}</span>
      </nav>

      {/* Hero */}
      <div id="tong-quan" className="mt-4 grid gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="flex flex-wrap gap-1.5">
            {[`Mã xét tuyển: ${school.ma}`, school.loaiHinh, school.khuVuc].map((b) => (
              <span key={b} className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-accent">
                {b}
              </span>
            ))}
          </div>
          <h1 className="mt-3 text-[32px] font-bold leading-[40px] tracking-tight text-ink">{school.ten}</h1>
          <p className="mt-2 text-sm text-muted">
            {school.tenTiengAnh} • {school.diaChi}
          </p>
          <dl className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ["Chương trình đào tạo", `${majors.length} ngành`],
              ["Biên độ điểm 2024", cutoffs.length ? `${lo.toFixed(2)} – ${hi.toFixed(2)}` : "—"],
              ["Học phí chuẩn", school.hocPhi],
              ["Tổ hợp chủ lực", school.toHopChuLuc.join(" · ")],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-line bg-surface p-3">
                <dt className="text-[11px] text-muted">{l}</dt>
                <dd className="mt-1 text-sm font-bold tabular-nums text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-surface p-5 lg:col-span-4">
          <p className="text-sm leading-relaxed text-body">
            Khám phá cơ hội trúng tuyển theo mức điểm dự kiến của bạn ({CURRENT_USER.diem.toFixed(2)} · {CURRENT_USER.toHop}).
          </p>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href={`/suggestions?score=${CURRENT_USER.diem.toFixed(2)}&combo=${CURRENT_USER.toHop}`}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-on-accent hover:bg-accent-hover"
            >
              Tạo gợi ý nguyện vọng
            </Link>
            <FollowButton code={school.ma} />
          </div>
          <p className="mt-3 text-[13px] text-muted">
            Ngoài THPTQG, trường còn xét tuyển bằng Kỳ thi Đánh giá tư duy (TSA).
          </p>
        </aside>
      </div>

      {/* Sticky tabs */}
      <nav aria-label="Mục trong trang" className="sticky top-[104px] z-30 mt-6 flex gap-1 overflow-x-auto border-y border-line bg-canvas/95 py-2 backdrop-blur lg:top-16">
        {[
          ["#tong-quan", "Tổng quan"],
          ["#diem-chuan", `Bảng Điểm chuẩn (${majors.length})`],
          ["#danh-gia", `Đánh giá (${reviews.length})`],
        ].map(([href, label]) => (
          <a key={href} href={href} className="shrink-0 rounded-lg px-4 py-2.5 text-sm font-semibold text-muted hover:bg-surface-2 hover:text-ink">
            {label}
          </a>
        ))}
      </nav>

      <Section
        eyebrow="Điểm chuẩn"
        title="Bảng tra cứu Điểm chuẩn & Ngành đào tạo (2022 - 2024)"
        sub="Đối sánh điểm trúng tuyển theo phương thức Thi THPT Quốc gia."
      >
        <div id="diem-chuan" className="scroll-mt-32">
          <div className="mb-3 flex gap-2">
            <TierBadge tier="safe" />
            <TierBadge tier="match" />
            <TierBadge tier="reach" />
          </div>
          <DetailMajorFilter rows={rows} combos={combos} />
        </div>
      </Section>

      <div id="danh-gia" className="scroll-mt-32 border-t border-line">
        <Section
          eyebrow="Review"
          title="Đánh giá & Review từ thí sinh trúng tuyển & sinh viên"
          sub={reviews.length > 0 ? `Tổng hợp ${reviews.length} phản hồi.` : undefined}
        >
          <div className="mb-5">
            <button
              type="button"
              disabled
              title="Gửi chia sẻ - cần tài khoản, sẽ có ở bước sau"
              className="inline-flex h-11 cursor-not-allowed items-center rounded-lg border border-line bg-surface px-5 text-sm font-semibold text-ink opacity-60"
            >
              Gửi chia sẻ kinh nghiệm ôn thi
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {reviews.length > 0 ? (
              reviews.map((r) => (
                <figure key={r.tacGia} className="rounded-2xl border border-line bg-surface p-5">
                  <blockquote className="text-sm leading-relaxed text-body">“{r.noiDung}”</blockquote>
                  <figcaption className="mt-3 text-[13px] font-semibold text-ink">
                    {r.tacGia} <span className="font-normal text-muted">• {r.vaiTro}</span>
                  </figcaption>
                </figure>
              ))
            ) : (
              <p className="text-sm text-muted">Chưa có review cho trường này. Hãy là người đầu tiên chia sẻ.</p>
            )}
          </div>
        </Section>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-[#001736] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
        <h2 className="max-w-xl text-xl font-semibold">
          Điểm của bạn có cơ hội trúng tuyển ngành nào tại {school.ten}?
        </h2>
        <Link
          href={`/suggestions?score=${CURRENT_USER.diem.toFixed(2)}&combo=${CURRENT_USER.toHop}`}
          className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-[#00838f] px-6 text-sm font-semibold text-white hover:bg-[#006972]"
        >
          Mô phỏng cơ hội trúng tuyển
        </Link>
      </div>
      <p className="mt-4 text-[13px] text-muted">
        Bảo mật theo chuẩn ADR-0004: Compass không yêu cầu số báo danh hay thông tin định danh.
      </p>

    </div>
  );
}
