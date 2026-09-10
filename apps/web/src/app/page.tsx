import Link from "next/link";
import { TierBadge, interpRank, rankPercentile } from "@compass/ui";
import { MAJORS, SCHOOLS } from "../mocks";

// ponytail: section order + copy mirror Stitch home.html; every number is computed
// from mocks (Stitch's 14.280/340k, 250+, Top 11.6% are invented placeholders).
const HERO_SCORE = 26.85;
const HERO_COMBO = "A00";

const FOCUS = [
  {
    no: "Tính năng trọng tâm 01",
    href: "/lookup",
    title: "Tra cứu Thứ hạng & Phổ điểm",
    body: "Tra cứu Thứ hạng tổ hợp môn của bạn (A00, A01, B00, C00, D01, D07) trên Phổ điểm toàn quốc.",
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
    body: "Quy tắc đối sánh Điểm chuẩn phân bổ danh sách Nguyện vọng theo chiến lược An toàn / Vừa sức / Thử thách.",
    mini: "Chiến lược An toàn / Vừa sức / Thử thách tối ưu",
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
  const majorCount = MAJORS.length;
  const heroRows = [
    { name: "ĐH Bách khoa Hà Nội · Kỹ thuật Cơ điện tử (ME1)", tier: "match" as const, cutoff: "26.60" },
    { name: "ĐH Bách khoa Hà Nội · Khoa học Máy tính (IT1)", tier: "reach" as const, cutoff: "28.50" },
  ];
  return (
    <div>
      {/* S1 Hero — mirrors Stitch home.html: orbs, pill, display headline, dual CTAs, micro highlights */}
      <div className="relative w-full overflow-hidden bg-surface pt-8 pb-16 lg:pt-14 lg:pb-24">
        <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-[360px] w-[720px] -translate-x-1/2 bg-gradient-to-b from-[#adc7f8]/35 via-[#8feefc]/20 to-transparent opacity-70 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute top-40 -right-20 h-96 w-96 rounded-full bg-[#75d5e2]/20 blur-3xl" />
        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 md:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12">
          <div className="flex flex-col items-start text-left lg:col-span-7">
            <p className="mb-6 inline-flex items-center gap-2 rounded-full bg-[var(--surface-container-high)] px-3.5 py-1.5 text-xs font-medium text-body shadow-sm">
              <span className="flex size-2 animate-pulse rounded-full bg-[var(--accent)]" aria-hidden />
              <span className="font-semibold text-ink">Dữ liệu tuyển sinh THPTQG 2025</span>
              <span className="text-faint">·</span>
              <span>Cập nhật liên tục theo Đề án mới</span>
            </p>
            <h1 className="mb-5 text-[32px] font-bold leading-[40px] tracking-tight text-ink md:text-[40px] md:leading-[48px]">
              Định vị thứ hạng, <span className="text-[var(--accent)]">chọn đúng ngành</span>, vững bước tương lai.
            </h1>
            <p className="mb-8 max-w-2xl text-base leading-relaxed text-body">
              Tra cứu thứ hạng điểm thi theo tổ hợp, phân tích phổ điểm quốc gia và nhận gợi ý
              phân bổ nguyện vọng thông minh theo 3 nhóm <strong className="font-semibold text-ink">An toàn</strong>,{" "}
              <strong className="font-semibold text-ink">Vừa sức</strong> và{" "}
              <strong className="font-semibold text-ink">Thử thách</strong> cho Thí sinh &amp; Phụ huynh.
            </p>
            <div className="flex w-full flex-wrap items-center gap-4 sm:w-auto">
              <Link
                href="/lookup"
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-lg bg-[#001736] px-6 py-3.5 text-sm font-medium text-white shadow-md transition-all hover:bg-[#0d2c54] active:scale-95 sm:w-auto dark:bg-white dark:text-black"
              >
                <span aria-hidden>🧭</span>
                <span>Tra cứu Thứ hạng ngay</span>
              </Link>
              <Link
                href="/onboarding"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--surface-container-low)] px-6 py-3.5 text-sm font-medium text-ink transition-all hover:bg-[var(--surface-container)] sm:w-auto"
              >
                <span aria-hidden className="text-[var(--accent)]">◉</span>
                <span>Bắt đầu Onboarding</span>
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-xs font-medium text-body">
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="text-[var(--accent)]">✓</span>
                <span>Theo chuẩn GDPT 2018 &amp; 2006</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden className="text-[var(--accent)]">🔒</span>
                <span>Tuyệt đối bảo mật (Không cần SBD)</span>
              </span>
            </div>
          </div>

          {/* Simulator card — Stitch: p-6 shadow-xl, A00 badge, divider, metric score */}
          <div className="lg:col-span-5">
            <div className="relative overflow-hidden rounded-2xl bg-surface p-6 shadow-xl">
              <div className="mb-5 flex items-center justify-between gap-2 border-b border-[var(--surface-container)] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--primary-fixed)] text-sm font-bold text-ink">{HERO_COMBO}</span>
                  <div>
                    <p className="text-base font-semibold leading-snug text-ink">Mô phỏng Phân vị Điểm</p>
                    <p className="text-[11px] font-semibold tracking-[0.04em] text-faint">Toán - Vật lí - Hóa học</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <span className="rounded-full bg-[var(--secondary-container)] px-2.5 py-1 text-[11px] font-semibold text-[var(--on-secondary-container)] dark:text-white">Toàn quốc</span>
                  <span className="rounded-full bg-[var(--secondary-container)] px-2.5 py-1 text-[11px] font-semibold text-[var(--on-secondary-container)] dark:text-white">{HERO_COMBO}</span>
                </div>
              </div>
              <div className="mb-4 rounded-xl bg-[var(--surface-container-low)] p-4">
                <div className="flex items-baseline justify-between">
                  <p className="text-[13px] text-muted">Tổng điểm dự kiến</p>
                  <p className="text-[13px] tabular-nums text-body">Top {top.toFixed(1)}% Toàn quốc</p>
                </div>
                <p className="mt-1 text-[36px] font-bold leading-[40px] tracking-tight tabular-nums text-ink">{HERO_SCORE.toFixed(2)}</p>
                <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-[var(--surface-container-highest)]">
                  <span className="block h-full rounded-full bg-[var(--accent)]" style={{ width: `${(HERO_SCORE / 30) * 100}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-[13px] tabular-nums text-body">
                  <span>Ước lượng hạng: ~{rank.toLocaleString("vi-VN")} / 900.000</span>
                </div>
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
              <p className="mt-4 text-[11px] font-semibold tracking-[0.04em] text-faint uppercase">Gợi ý phân nhóm tự động:</p>
              <ul className="mt-2 flex flex-col gap-2 border-t border-[var(--surface-container)] pt-3">
                {heroRows.map((r) => (
                  <li
                    key={r.name}
                    className="flex items-center justify-between gap-2 rounded-lg p-2.5 shadow-sm"
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2 truncate text-[13px] text-body">
                      <span aria-hidden className="size-2.5 shrink-0 rounded-full bg-[var(--accent)]" />
                      <span className="truncate">
                        {r.name} <span className="tabular-nums text-muted">· {r.cutoff}</span>
                      </span>
                    </span>
                    <TierBadge tier={r.tier} />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* S2 Stats strip — Stitch: surface-container-high section, lowest cards, metric-counter */}
      <div className="bg-[var(--surface-container-high)]">
        <dl className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:px-8 lg:grid-cols-4 lg:gap-8 lg:px-12">
          {[
            ["900.000+", "Thí sinh cả nước", "Phổ điểm mock bao phủ toàn dải điểm thang 30."],
            [`${SCHOOLS.length}`, "Trường Đại học & Viện", "Đề án tuyển sinh chuẩn hóa 3 miền."],
            [`${majorCount}+`, "Ngành đào tạo chuẩn", "Mã ngành, tổ hợp xét tuyển và chỉ tiêu."],
            ["100%", "Bảo mật tuyệt đối", "Không cần số báo danh, không lưu danh tính."],
          ].map(([v, l, s]) => (
            <div key={l} className="rounded-xl bg-surface p-5 shadow-sm">
              <dd className="text-[36px] font-bold leading-[40px] tracking-tight tabular-nums text-ink">{v}</dd>
              <dt className="mt-1 text-base font-semibold text-ink">{l}</dt>
              <dd className="mt-0.5 text-[13px] leading-[18px] text-muted">{s}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* S3 Focus cards — Stitch: surface section, pill kicker, p-7 shadow cards */}
      <div className="bg-surface">
        <section className="mx-auto w-full max-w-7xl px-4 py-16 text-center md:px-8 lg:px-12 lg:py-24">
          <p className="inline-block rounded-full bg-[var(--primary-fixed)] px-3 py-1 text-xs font-semibold tracking-[0.02em] text-ink uppercase">Hệ sinh thái công cụ hỗ trợ</p>
          <h2 className="mx-auto mt-3 mb-4 max-w-3xl text-[30px] font-semibold leading-[38px] tracking-tight text-ink">
            Bộ giải pháp khoa học dành riêng cho kỳ thi tuyển sinh 2025
          </h2>
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-body">
            Giảm bớt sự hoang mang trong giai đoạn nước rút nhờ các công cụ phân tích liên thông.
          </p>
          <div className="mt-8 grid gap-8 text-left md:grid-cols-3 lg:mt-14">
            {FOCUS.map((c) => (
              <div key={c.href} className="flex flex-col rounded-2xl border border-line bg-surface p-7 shadow-md transition-shadow hover:shadow-xl">
                <p className="text-[11px] font-semibold tracking-[0.04em] text-[var(--accent)] uppercase">{c.no}</p>
                <h3 className="mt-1.5 mb-3 text-lg font-semibold leading-[26px] text-ink">{c.title}</h3>
                <p className="mb-6 flex-1 text-sm leading-[22px] text-body">{c.body}</p>
                <p className="mb-6 rounded-xl bg-[var(--surface-container-low)] p-4 text-[13px] text-muted">{c.mini}</p>
                <Link href={c.href} className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-[var(--accent)] hover:underline">
                  {c.link} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* S4 Transparency — Stitch: container-low section, lowest rounded-3xl card */}
      <div className="bg-[var(--surface-container-low)] py-16 lg:py-20">
        <div className="mx-auto grid w-full max-w-7xl items-center gap-8 px-4 md:px-8 lg:grid-cols-12 lg:gap-12 lg:px-12">
          <div className="rounded-3xl bg-surface p-8 shadow-sm lg:col-span-6 lg:p-12">
            <p className="mb-4 w-fit rounded-md bg-[var(--secondary-container)] px-3 py-1 text-xs font-semibold tracking-[0.02em] text-[var(--on-secondary-container)] uppercase dark:text-white">Nguyên tắc Minh bạch &amp; Chuẩn học đường</p>
            <h2 className="mb-4 text-[30px] font-semibold leading-[38px] tracking-tight text-ink">
              Dữ liệu vì tương lai thí sinh — Cam kết không thu thập danh tính
            </h2>
            <p className="mb-6 text-base leading-relaxed text-body">
              Compass tuân thủ tinh thần kiến trúc dữ liệu mở, loại bỏ mọi rào cản định danh khỏi trải nghiệm tra cứu.
            </p>
            <ul className="flex flex-col gap-4">
              {TRANSPARENCY.map((t) => (
                <li key={t.title} className="flex gap-3.5">
                  <span aria-hidden className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--primary-fixed)] text-sm text-ink">✓</span>
                  <div>
                    <p className="text-base font-semibold text-ink">{t.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-body">{t.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-[var(--surface-container)] p-6 lg:p-8">
              <h3 className="mb-4 text-lg font-semibold leading-[26px] text-ink">Cấu trúc mô hình Safe / Match / Reach</h3>
              <ul className="flex flex-col gap-3">
                {BUCKETS.map((b) => (
                  <li key={b.tier} className="flex gap-3 rounded-xl bg-surface p-4 shadow-sm">
                    <span aria-hidden className="mt-1 size-3.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold text-ink">{b.title}</p>
                        <span className="rounded-full bg-[var(--surface-container-low)] px-2.5 py-0.5 text-xs font-bold tabular-nums text-[var(--accent)]">{b.rate}</span>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-body">{b.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* S5 CTA banner — Stitch: inner rounded-3xl primary card with orbs */}
      <div className="bg-surface py-12 lg:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="relative flex flex-col items-start gap-8 overflow-hidden rounded-3xl bg-[#001736] p-8 text-white shadow-xl md:p-12 lg:p-16">
            <div aria-hidden className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-[#00838f]/20 blur-3xl" />
            <div className="relative flex w-full flex-col items-start gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="mb-3 w-fit rounded-full bg-[#0d2c54] px-3 py-1 text-xs font-semibold tracking-[0.02em] text-[#adc7f8] uppercase">Sẵn sàng cho Kỳ thi THPTQG 2025</p>
                <h2 className="max-w-xl text-[30px] font-semibold leading-[38px] tracking-tight">
                  Bắt đầu định hướng nguyện vọng của bạn ngay hôm nay
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-[22px] text-[#adc7f8]">
                  Chỉ mất 2 phút để nhập điểm dự kiến hoặc hoàn thiện Onboarding định hướng.
                </p>
              </div>
              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                <Link
                  href="/lookup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#006972] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#00838f] active:scale-95"
                >
                  <span aria-hidden>⌕</span> Tra cứu điểm ngay
                </Link>
                <Link
                  href="/onboarding"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0d2c54] px-6 py-3.5 text-sm font-medium text-white transition-all hover:bg-[#164075]"
                >
                  Bắt đầu Onboarding <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
