import { notFound } from "next/navigation";
import { CutoffTable, Section, TierBadge } from "@compass/ui";
import { classifyBucket } from "@compass/ui";
import { CURRENT_USER, REVIEWS, TRUONGS, getNganhsByTruong, getTruong } from "../../../mocks";

export function generateStaticParams() {
  return TRUONGS.map((t) => ({ code: t.ma.toLowerCase() }));
}

export default async function SchoolDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const school = getTruong(code);
  if (!school) notFound();
  const majors = getNganhsByTruong(school.ma);
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
  const reviews = REVIEWS.filter((r) => r.truong === school.ma);
  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-10">
      <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">{school.ma}</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-ink">{school.ten}</h1>
      <p className="mt-2 text-sm text-muted">
        {school.tenTiengAnh} • {school.diaChi} • {school.loaiHinh}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a href="/suggestions" className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-6 text-sm font-semibold text-on-cta hover:bg-accent-hover">
          Tạo gợi ý nguyện vọng
        </a>
        <button type="button" disabled title="Theo dõi trường - sẽ có ở bước sau" className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-lg border border-line bg-surface px-6 text-sm font-semibold text-ink opacity-60">
          + Thêm vào danh sách theo dõi
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {school.toHopChuLuc.map((c) => (
          <span key={c} className="rounded bg-chip px-2 py-1 text-xs font-semibold text-ink">
            {c}
          </span>
        ))}
        <span className="rounded bg-surface-2 px-2 py-1 text-xs text-body">Học phí: {school.hocPhi}</span>
      </div>

      <Section
        eyebrow="Điểm chuẩn"
        title="Bảng tra cứu Điểm chuẩn & Ngành đào tạo (2022 - 2024)"
        sub={`Điểm của bạn (${CURRENT_USER.diem.toFixed(2)} - ${CURRENT_USER.toHop}) được đối chiếu với từng ngành bên dưới.`}
      >
        <CutoffTable rows={rows} />
        <div className="mt-3 flex gap-2">
          <TierBadge tier="safe" />
          <TierBadge tier="match" />
          <TierBadge tier="reach" />
        </div>
      </Section>

      <Section eyebrow="Review" title="Đánh giá & Review từ thí sinh trúng tuyển & sinh viên">
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
  );
}
