import type { ReactNode } from "react";

const NAV = [
  { href: "/lookup", label: "Tra cứu" },
  { href: "/schools", label: "Trường" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/suggestions", label: "Gợi ý nguyện vọng" },
  { href: "/following", label: "Theo dõi" },
];

// ponytail: plain <a> keeps @compass/ui free of a next dependency; header/footer need no client nav.
// ponytail: header mirrors Stitch home.html (bg-surface/90, surface-container search, secondary-container badge, primary avatar).
export function SiteHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="fixed top-0 right-0 left-0 z-50 bg-surface/90 shadow-[0_1px_8px_rgba(13,44,84,0.06)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-8 lg:px-12">
        <a href="/" className="flex shrink-0 items-center gap-3" aria-label="Compass - Trang chủ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/compass-mark-navy.webp" alt="" width={32} height={32} className="h-8 w-auto object-contain dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/compass-mark-white.webp" alt="" width={32} height={32} className="hidden h-8 w-auto object-contain dark:block" />
          <span className="flex items-center gap-2">
            <span className="text-lg font-semibold tracking-tight text-ink">Compass</span>
            <span className="rounded-full bg-[var(--primary-fixed)] px-2 py-0.5 text-[11px] font-semibold tracking-wide text-[#001b3d] uppercase dark:text-white">
              THPT
            </span>
          </span>
        </a>
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Chính">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-body hover:bg-[var(--surface-container)] hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="flex shrink-0 items-center gap-2.5">
          <a
            href="/schools"
            className="hidden items-center gap-2 rounded-lg bg-[var(--surface-container)] px-2.5 py-1 text-sm text-body sm:flex"
          >
            <span aria-hidden>⌕</span>
            <span className="text-faint">Tìm ngành, trường...</span>
            <kbd className="rounded bg-surface px-1.5 py-0.5 text-[11px] text-body shadow-[0_1px_2px_rgba(0,0,0,0.08)]">
              ⌘K
            </kbd>
          </a>
          <span className="hidden items-center gap-1.5 rounded-full bg-[var(--secondary-container)] px-3 py-1 text-xs font-semibold text-[var(--on-secondary-container)] xl:inline-flex dark:text-white">
            <span className="size-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
            Kỳ thi 2025
          </span>
          {actions}
          <a
            href="/onboarding"
            title="Hồ sơ của bạn"
            aria-label="Hồ sơ của bạn"
            className="flex size-8 items-center justify-center rounded-full bg-[#001736] text-sm font-bold text-white dark:bg-white dark:text-black"
          >
            TS
          </a>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-line-soft px-4 py-1 lg:hidden" aria-label="Chính">
        {[{ href: "/", label: "Trang chủ" }, ...NAV].map((n) => (
          <a key={n.href} href={n.href} className="shrink-0 rounded-md px-3 py-3 text-sm font-medium text-muted hover:text-ink">
            {n.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

const FOOT_LINKS = [
  "Quy chế thi THPTQG",
  "Phương pháp tính điểm chuẩn",
  "Cơ sở dữ liệu các trường",
  "Hỗ trợ sĩ tử & Phụ huynh",
];

export function SiteFooter() {
  return (
    <footer className="bg-surface-2">
      <div className="mx-auto w-full max-w-[1280px] px-6 pt-10">
        <p className="rounded-xl border border-line bg-surface p-4 text-sm leading-relaxed text-body">
          Compass là nền tảng hỗ trợ tham khảo định hướng nguyện vọng THPTQG phi lợi nhuận.
          Điểm số và thứ hạng chỉ mang tính tham khảo — thí sinh đối chiếu quy chế tuyển sinh chính thức của Bộ GD&ĐT.
        </p>
      </div>
      <div className="mt-6 bg-[#001736] text-white">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-white/70">© 2025 Compass THPT. Học viện Công nghệ Giáo dục.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {FOOT_LINKS.map((l) => (
              <li key={l}>
                <a href="/schools" className="text-white/70 hover:text-white">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
