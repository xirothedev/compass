import Link from "next/link";

export const metadata = { title: "Không tìm thấy trang - Compass" };

const QUICK_LINKS = [
  { href: "/schools", label: "Catalog trường đại học" },
  { href: "/lookup", label: "Phổ điểm các tổ hợp" },
  { href: "/suggestions", label: "Chiến lược nguyện vọng" },
];

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col items-center justify-center px-6 py-16 text-center md:py-24">
      <p className="text-[80px] font-bold leading-none tracking-tight tabular-nums text-ink md:text-[120px]">
        404
      </p>
      <h1 className="mt-4 text-2xl font-semibold text-ink md:text-[30px]">Không tìm thấy trang</h1>
      <p className="mt-3 max-w-md text-base leading-relaxed text-body">
        Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-cta px-6 text-sm font-semibold text-on-cta hover:bg-cta-hover"
        >
          Về trang chủ
        </Link>
        <Link
          href="/lookup"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
        >
          Tra cứu thứ hạng
        </Link>
      </div>
      <nav aria-label="Liên kết hữu ích" className="mt-10 flex flex-wrap justify-center gap-2">
        {QUICK_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border border-line px-4 py-2 text-[13px] font-medium text-muted hover:bg-surface-2 hover:text-ink"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
