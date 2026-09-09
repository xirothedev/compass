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
      <p className="text-xs font-semibold tracking-[0.04em] text-[#006972] uppercase">{school.ma}</p>
      <h1 className="mt-2 text-[32px] font-bold leading-[40px] tracking-tight text-[#0d2c54]">{school.ten}</h1>
      <p className="mt-2 text-sm text-[#5c6470]">
        {school.tenTiengAnh} • {school.diaChi} • {school.loaiHinh}
      </p>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <a href="/suggestions" className="inline-flex h-11 items-center justify-center rounded-lg bg-[#00838f] px-6 text-sm font-semibold text-white hover:bg-[#006972]">
          Tạo gợi ý nguyện vọng
        </a>
        <button type="button" disabled title="Theo dõi trường - sẽ có ở bước sau" className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-lg border border-[#e2e5eb] bg-white px-6 text-sm font-semibold text-[#0d2c54] opacity-60">
          + Thêm vào danh sách theo dõi
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {school.toHopChuLuc.map((c) => (
          <span key={c} className="rounded bg-[#e7eefd] px-2 py-1 text-xs font-semibold text-[#0d2c54]">
            {c}
          </span>
        ))}
        <span className="rounded bg-[#eff4ff] px-2 py-1 text-xs text-[#43474e]">Học phí: {school.hocPhi}</span>
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
              <figure key={r.tacGia} className="rounded-2xl border border-[#e2e5eb] bg-white p-5">
                <blockquote className="text-sm leading-relaxed text-[#43474e]">“{r.noiDung}”</blockquote>
                <figcaption className="mt-3 text-[13px] font-semibold text-[#0d2c54]">
                  {r.tacGia} <span className="font-normal text-[#5c6470]">• {r.vaiTro}</span>
                </figcaption>
              </figure>
            ))
          ) : (
            <p className="text-sm text-[#5c6470]">Chưa có review cho trường này. Hãy là người đầu tiên chia sẻ.</p>
          )}
        </div>
      </Section>
    </div>
  );
}
