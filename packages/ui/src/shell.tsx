import type { ReactNode } from "react";

const NAV = [
  { href: "/lookup", label: "Tra cứu" },
  { href: "/schools", label: "Trường" },
  { href: "/following", label: "Theo dõi" },
  { href: "/onboarding", label: "Onboarding" },
  { href: "/suggestions", label: "Gợi ý nguyện vọng" },
];

// ponytail: plain <a> keeps @compass/ui free of a next dependency; header/footer need no client nav
// ponytail: navy header in both modes (brand anchor + logo is charcoal-on-black, needs dark chrome)
export function SiteHeader({ actions }: { actions?: ReactNode }) {
  return (
    <header className="sticky top-0 z-40 bg-[#0d2c54] text-white">
      <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-6 px-6">
        <a href="/" className="flex items-center gap-2.5" aria-label="Compass - Trang chủ">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo/compass-mark.webp" alt="" width={32} height={32} className="size-8" />
          <span className="text-lg font-bold tracking-tight">Compass</span>
        </a>
        <nav className="ml-2 hidden items-center gap-1 md:flex" aria-label="Chính">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="rounded-md px-3 py-2 text-sm font-medium text-white/85 hover:bg-white/10 hover:text-white">
              {n.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {actions}
          <a
            href="/lookup"
            className="hidden h-11 items-center rounded-lg bg-[#00838f] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#006972] sm:inline-flex"
          >
            Tra cứu thứ hạng
          </a>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-t border-white/10 px-4 py-1 md:hidden" aria-label="Chính">
        {[{ href: "/", label: "Trang chủ" }, ...NAV].map((n) => (
          <a key={n.href} href={n.href} className="shrink-0 rounded-md px-3 py-3 text-sm font-medium text-white/85">
            {n.label}
          </a>
        ))}
      </nav>
    </header>
  );
}

const FOOT_LINKS = ["Quy chế thi THPTQG", "Phương pháp tính điểm chuẩn", "Cơ sở dữ liệu các trường"];

export function SiteFooter() {
  return (
    <footer className="bg-[#001736] text-white">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-6 py-10 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <p className="text-base font-bold">Compass</p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            Compass là nền tảng hỗ trợ tham khảo định hướng nguyện vọng cho thí sinh kỳ thi THPTQG.
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-sm">
          {FOOT_LINKS.map((l) => (
            <li key={l}>
              <a href="/schools" className="text-white/70 hover:text-white">
                {l}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
