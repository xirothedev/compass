import Link from "next/link";
import { TierBadge, interpRank, rankPercentile } from "@compass/ui";
import { NGANHS, TRUONGS } from "../mocks";

// ponytail: section order + copy mirror Stitch home.html; every number is computed
// from mocks (Stitch's 14.280/340k, 250+, Top 11.6% are invented placeholders).
const HERO_SCORE = 26.85;
const HERO_COMBO = "A00";

const FOCUS = [
  {
    no: "Tính năng trọng tâm 01",
    href: "/lookup",
    title: "Tra cứu Thứ hạng & Phổ điểm",
    body: "Dự đoán vị trí xếp hạng tổ hợp môn của bạn (A00, A01, B00, C00, D01) trên phổ điểm toàn quốc.",
    mini: "Báo cáo phân vị & độ lệch chuẩn chi tiết",
    link: "Tra cứu phổ điểm ngay",
  },
  {
    no: "Tính năng trọng tâm 02",
    href: "/schools",
    title: "Catalog Trường & Điểm chuẩn",
    body: "Khám phá đề án tuyển sinh, so sánh biến động điểm chuẩn 3 năm gần nhất của các trường.",
    mini: "Đối chiếu chênh lệch điểm trúng tuyển 3 năm",
    link: "Duyệt danh bạ các trường",
  },
  {
    no: "Tính năng trọng tâm 03",
    href: "/suggestions",
    title: "Gợi ý Nguyện vọng Thông minh",
    body: "Thuật toán ma trận xác suất phân bổ danh sách nguyện vọng theo chiến lược Safe / Match / Reach.",
    mini: "Chiến lược Safe / Match / Reach tối ưu",
    link: "Khởi tạo danh sách nguyện vọng",
  },
];

const TRANSPARENCY = [
  {
    title: "Tương thích kép GDPT 2018 & 2006",
    body: "Hỗ trợ đầy đủ bảng tổ hợp theo chương trình mới cùng các tiêu chí xét tuyển riêng cho thí sinh tự do.",
  },
  {
    title: "Bảo vệ quyền riêng tư tuyệt đối (ADR-0004)",
    body: "Không yêu cầu số báo danh (SBD), không lưu trữ CCCD hay số điện thoại. Dữ liệu chỉ nằm trên trình duyệt của bạn.",
  },
  {
    title: "Dữ liệu nguồn chính thống từ Bộ GD&ĐT",
    body: "Được kiểm tra chéo với cổng thông tin tuyển sinh quốc gia và đề án công bố của từng trường.",
  },
];

const BUCKETS = [
  {
    tier: "safe" as const,
    title: "Nhóm An Toàn (Safe)",
    rate: "Tỉ lệ > 85%",
    body: "Điểm của bạn cao hơn điểm chuẩn dự kiến từ 1.5 đến 3.0 điểm. Giúp chắc suất trúng tuyển đợt 1.",
  },
  {
    tier: "match" as const,
    title: "Nhóm Vừa Sức (Match)",
    rate: "Tỉ lệ 50% - 85%",
    body: "Điểm chênh lệch trong khoảng dao động ±0.75 điểm so với chuẩn các năm. Cân nhắc thứ tự ưu tiên.",
  },
  {
    tier: "reach" as const,
    title: "Nhóm Thử Thách (Reach)",
    rate: "Tỉ lệ 25% - 50%",
    body: "Các ngành mơ ước với điểm chuẩn cao hơn từ 0.5 đến 1.5 điểm. Tận dụng tối đa 2-3 nguyện vọng đầu.",
  },
];

export default function Home() {
  const rank = interpRank(HERO_SCORE);
  const top = rankPercentile(rank);
  const majorCount = NGANHS.length;
  const heroRows = [
    { name: "ĐH Bách khoa Hà Nội · Kỹ thuật Cơ điện tử (ME1)", tier: "match" as const, cutoff: "26.60" },
    { name: "ĐH Bách khoa Hà Nội · Khoa học Máy tính (IT1)", tier: "reach" as const, cutoff: "28.50" },
  ];
  return (
    <div>
      {/* S1 Hero */}
      <div className="bg-surface">
        <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-14 lg:grid-cols-12 lg:py-20">
          <div className="flex flex-col items-start justify-center lg:col-span-7">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1 text-xs font-semibold text-muted">
              Dữ liệu tuyển sinh THPTQG 2025
              <span className="text-faint">·</span>
              <span className="font-normal">Cập nhật liên tục theo Đề án mới</span>
            </p>
            <h1 className="mt-4 max-w-xl text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
              Định vị thứ hạng, chọn đúng ngành, vững bước tương lai.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-body">
              Tra cứu thứ hạng điểm thi theo tổ hợp, phân tích phổ điểm quốc gia và nhận gợi ý
              nguyện vọng theo 3 nhóm <strong className="font-semibold text-ink">An toàn</strong>,{" "}
              <strong className="font-semibold text-ink">Vừa sức</strong>,{" "}
              <strong className="font-semibold text-ink">Thử thách</strong>.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/lookup"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-cta px-6 text-sm font-semibold text-on-cta hover:bg-cta-hover"
              >
                Tra cứu Thứ hạng ngay
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-surface-2 px-6 text-sm font-semibold text-ink hover:bg-chip"
              >
                Làm bài Onboarding khảo sát
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-muted">
              <span>Theo chuẩn GDPT 2018 &amp; 2006</span>
              <span>Tuyệt đối bảo mật (Không cần SBD)</span>
            </div>
          </div>

          {/* Simulator card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-line bg-surface p-5 shadow-[0_4px_12px_rgba(13,44,84,0.08)]">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">Mô phỏng Phân vị Điểm</p>
                  <p className="text-[13px] text-muted">Toán - Vật lí - Hóa học</p>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded bg-chip px-2 py-1 text-[11px] font-semibold text-accent">Toàn quốc</span>
                  <span className="rounded bg-chip px-2 py-1 text-[11px] font-semibold text-accent">{HERO_COMBO}</span>
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-surface-2 p-4">
                <p className="text-[13px] text-muted">Tổng điểm dự kiến</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-ink">{HERO_SCORE.toFixed(2)}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-line-soft">
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${(HERO_SCORE / 30) * 100}%` }} />
                </div>
                <p className="mt-2 text-[13px] tabular-nums text-body">
                  Top {top.toFixed(1)}% Toàn quốc · Ước lượng hạng: ~
                  {rank.toLocaleString("vi-VN")} / 900.000
                </p>
              </div>
              <svg viewBox="0 0 300 80" role="img" aria-label="Mật độ điểm thi THPTQG A00" className="mt-3 w-full">
                <path
                  d="M5 72 C 60 70, 90 60, 120 40 S 180 8, 210 22 S 260 55, 295 68"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="2.5"
                />
                <line x1="238" y1="10" x2="238" y2="72" stroke="var(--color-faint)" strokeWidth="1" strokeDasharray="4 3" />
                <circle cx="238" cy="26" r="4" fill="var(--color-accent)" />
              </svg>
              <p className="text-xs text-muted">
                Mật độ điểm thi THPTQG {HERO_COMBO} · Đỉnh phổ: 21.50
              </p>
              <p className="mt-4 text-[13px] font-semibold text-ink">Gợi ý phân nhóm tự động:</p>
              <ul className="mt-2 flex flex-col gap-2">
                {heroRows.map((r) => (
                  <li
                    key={r.name}
                    className="flex items-center justify-between gap-2 rounded-lg border border-line-soft px-3 py-2 text-[13px]"
                  >
                    <span className="min-w-0 flex-1 truncate text-body">
                      {r.name} <span className="tabular-nums text-muted">· {r.cutoff}</span>
                    </span>
                    <TierBadge tier={r.tier} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* S2 Stats strip */}
      <div className="bg-surface-2">
        <dl className="mx-auto grid w-full max-w-[1280px] grid-cols-2 gap-6 px-6 py-10 lg:grid-cols-4">
          {[
            ["900.000+", "Thí sinh cả nước", "Phổ điểm mock bao phủ toàn dải điểm thang 30."],
            [`${TRUONGS.length}`, "Trường Đại học & Viện", "Đề án tuyển sinh chuẩn hóa 3 miền."],
            [`${majorCount}+`, "Ngành đào tạo chuẩn", "Mã ngành, tổ hợp xét tuyển và chỉ tiêu."],
            ["100%", "Bảo mật tuyệt đối", "Không cần số báo danh, không lưu danh tính."],
          ].map(([v, l, s]) => (
            <div key={l}>
              <dt className="order-2 mt-1 text-sm font-semibold text-ink">{l}</dt>
              <dd className="order-1 text-[32px] font-bold tabular-nums text-ink">{v}</dd>
              <dd className="order-3 mt-1 text-[13px] leading-relaxed text-muted">{s}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* S3 Focus cards */}
      <div className="bg-canvas">
        <section className="mx-auto w-full max-w-[1280px] px-6 py-12 text-center md:py-[72px]">
          <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">Hệ sinh thái công cụ hỗ trợ</p>
          <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink md:text-[30px] md:leading-[38px]">
            Bộ giải pháp khoa học dành riêng cho kỳ thi tuyển sinh 2025
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-body">
            Giảm bớt sự hoang mang trong giai đoạn nước rút nhờ các công cụ phân tích liên thông.
          </p>
          <div className="mt-8 grid gap-4 text-left md:grid-cols-3">
            {FOCUS.map((c) => (
              <div key={c.href} className="flex flex-col rounded-2xl border border-line bg-surface p-6">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-muted uppercase">{c.no}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-body">{c.body}</p>
                <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-[13px] text-muted">{c.mini}</p>
                <Link href={c.href} className="mt-4 text-sm font-semibold text-accent hover:underline">
                  {c.link} →
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* S4 Transparency */}
      <div className="bg-surface-2">
        <div className="mx-auto grid w-full max-w-[1280px] gap-10 px-6 py-12 lg:grid-cols-12 md:py-[72px]">
          <div className="lg:col-span-6">
            <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">Nguyên tắc Minh bạch &amp; Chuẩn học đường</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink md:text-[30px] md:leading-[38px]">
              Dữ liệu vì tương lai thí sinh — Cam kết không thu thập danh tính
            </h2>
            <p className="mt-3 text-base leading-relaxed text-body">
              Compass tuân thủ tinh thần kiến trúc dữ liệu mở, loại bỏ mọi rào cản định danh khỏi trải nghiệm tra cứu.
            </p>
            <ul className="mt-6 flex flex-col gap-4">
              {TRANSPARENCY.map((t) => (
                <li key={t.title} className="rounded-xl border border-line bg-surface p-4">
                  <p className="text-sm font-semibold text-ink">{t.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-body">{t.body}</p>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-line bg-surface p-5 md:p-6">
              <h3 className="text-lg font-semibold text-ink">Cấu trúc mô hình Safe / Match / Reach</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {BUCKETS.map((b) => (
                  <li key={b.tier} className="rounded-xl border border-line-soft p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-ink">{b.title}</p>
                      <span className="shrink-0 text-[13px] font-bold tabular-nums text-accent">{b.rate}</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-body">{b.body}</p>
                    <TierBadge tier={b.tier} className="mt-2" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* S5 CTA banner */}
      <div className="bg-[#001736] text-white">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col items-start gap-5 px-6 py-12 md:flex-row md:items-center md:justify-between md:py-16">
          <div>
            <p className="text-xs font-semibold tracking-[0.04em] text-[#8feefc] uppercase">Sẵn sàng cho Kỳ thi THPTQG 2025</p>
            <h2 className="mt-2 max-w-xl text-2xl font-semibold tracking-tight md:text-[30px] md:leading-[38px]">
              Bắt đầu định hướng nguyện vọng của bạn ngay hôm nay
            </h2>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/75">
              Chỉ mất 2 phút để nhập điểm dự kiến hoặc làm bài khảo sát định hướng.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:flex-col lg:flex-row">
            <Link
              href="/lookup"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#00838f] px-6 text-sm font-semibold text-white hover:bg-[#006972]"
            >
              Tra cứu điểm ngay
            </Link>
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center justify-center rounded-lg bg-[#0d2c54] px-6 text-sm font-semibold text-white hover:bg-[#164075]"
            >
              Bắt đầu khảo sát →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
