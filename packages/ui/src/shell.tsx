import type { ReactNode } from "react";

const NAV = [
  { href: "/lookup", label: "Tra cứu" },
  { href: "/schools", label: "Trường" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/suggestions", label: "Gợi ý nguyện vọng" },
  { href: "/following", label: "Theo dõi" },
];

// ponytail: plain <a> keeps @compass/ui free of a next dependency; header/footer need no client nav.
// ponytail: light blur header mirrors Stitch (white/95); logo swaps navy/white via .dark.
export function SiteHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-4 px-6">
        <a href="/" className="flex shrink-0 items-center gap-2" aria-label="Compass - Trang chủ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/compass-mark-navy.webp" alt="" width={32} height={32} className="size-8 dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/compass-mark-white.webp" alt="" width={32} height={32} className="hidden size-8 dark:block" />
          <span className="text-lg font-bold tracking-tight text-ink">Compass</span>
          <span className="rounded border border-line px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-muted">
            THPT
          </span>
        </a>
        <nav className="ml-2 hidden items-center gap-1 lg:flex" aria-label="Chính">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <a
            href="/schools"
            className="hidden h-10 w-60 items-center gap-2 rounded-lg border border-line bg-surface px-3 text-sm text-faint hover:bg-surface-2 md:flex"
          >
            <span className="flex-1 truncate">Tìm ngành, trường...</span>
            <kbd className="rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">
              ⌘K
            </kbd>
          </a>
          <span className="hidden rounded-full bg-chip px-2.5 py-1 text-xs font-semibold text-accent xl:block">
            Kỳ thi 2025
          </span>
          {actions}
          <a
            href="/onboarding"
            title="Hồ sơ của bạn"
            aria-label="Hồ sơ của bạn"
            className="flex size-10 items-center justify-center rounded-full bg-cta text-sm font-bold text-on-cta"
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
