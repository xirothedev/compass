// ponytail: plain <a> keeps @compass/ui free of a next dependency
import type { ReactNode } from "react";
import { BUCKET_META, type Bucket } from "./buckets";

export function TierBadge({ tier, className = "" }: { tier: Bucket; className?: string }) {
  const m = BUCKET_META[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${m.text} ${m.bg} ${m.border} ${className}`}
    >
      <span className={`size-1.5 rounded-full ${m.dot}`} aria-hidden />
      {m.label}
    </span>
  );
}

export function FilterChip({
  label,
  active = false,
  onToggle,
}: {
  label: string;
  active?: boolean;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`h-8 shrink-0 rounded-full border px-3.5 text-[13px] font-medium transition-colors ${
        active
          ? "border-transparent bg-[#00838f] text-white"
          : "border-[#e2e5eb] bg-white text-[#0d2c54] hover:bg-[#f1f5f9]"
      }`}
    >
      {label}
    </button>
  );
}

export type SchoolCardData = {
  code: string;
  name: string;
  combos: string[];
  cutoff2024: number;
  trend: "up" | "flat" | "down";
  tuition: string;
};

const TREND = { up: "↗", flat: "→", down: "↘" } as const;

export function SchoolCard({ school }: { school: SchoolCardData }) {
  return (
    <a
      href={`/schools/${school.code.toLowerCase()}`}
      className="group flex flex-col gap-3 rounded-2xl border border-[#e2e5eb] bg-white p-5 shadow-[0_1px_3px_rgba(13,44,84,0.04)] transition-shadow hover:shadow-[0_4px_12px_rgba(13,44,84,0.08)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-lg bg-[#0d2c54] text-sm font-bold text-white">
            {school.code.slice(0, 2)}
          </span>
          <div>
            <p className="text-[11px] font-semibold tracking-[0.04em] text-[#5c6470]">{school.code}</p>
            <h3 className="text-base font-semibold leading-snug text-[#0d2c54]">{school.name}</h3>
          </div>
        </div>
        <span className="shrink-0 rounded-md bg-[#e7eefd] px-2 py-1 text-sm font-bold tabular-nums text-[#0d2c54]">
          {school.cutoff2024.toFixed(2)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {school.combos.map((c) => (
          <span
            key={c}
            className="rounded px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.02em] text-[#006972] bg-[#8feefc]/30"
          >
            {c}
          </span>
        ))}
        <span className="ml-auto text-[13px] tabular-nums text-[#5c6470]">
          Xu hướng 3 năm {TREND[school.trend]}
        </span>
      </div>
      <p className="border-t border-[#edf0f5] pt-3 text-[13px] text-[#5c6470]">Học phí: {school.tuition}</p>
    </a>
  );
}

export type CutoffRow = {
  code: string;
  name: string;
  combos: string;
  method: string;
  y2022: number;
  y2023: number;
  y2024: number;
  tier: Bucket;
};

export function CutoffTable({ rows }: { rows: CutoffRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[#e2e5eb]">
      <table className="w-full min-w-[880px] border-collapse bg-white text-sm">
        <thead>
          <tr className="bg-[#eff4ff] text-left text-xs font-semibold tracking-[0.02em] text-[#0d2c54]">
            {["Mã ngành", "Tên chương trình / Ngành đào tạo", "Tổ hợp môn", "Phương thức", "2022", "2023", "2024", "Đánh giá"].map(
              (h) => (
                <th key={h} scope="col" className="px-3 py-3 font-semibold">
                  {h}
                </th>
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.code} className="border-t border-[#edf0f5] align-middle hover:bg-[#f8f9ff]">
              <td className="px-3 py-3 font-semibold text-[#0d2c54]">{r.code}</td>
              <td className="px-3 py-3 font-medium text-[#141c26]">{r.name}</td>
              <td className="px-3 py-3 text-[#5c6470]">{r.combos}</td>
              <td className="px-3 py-3 text-[#5c6470]">{r.method}</td>
              {[r.y2022, r.y2023, r.y2024].map((y, i) => (
                <td key={i} className="px-3 py-3 font-semibold tabular-nums text-[#141c26]">
                  {y.toFixed(2)}
                </td>
              ))}
              <td className="px-3 py-3">
                <TierBadge tier={r.tier} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PortfolioBar({ safe, match, reach }: { safe: number; match: number; reach: number }) {
  const total = safe + match + reach || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={`An toàn ${safe}, Vừa sức ${match}, Thử thách ${reach}`}>
        <span className="bg-[#0e6245]" style={{ width: `${(safe / total) * 100}%` }} />
        <span className="bg-[#035388]" style={{ width: `${(match / total) * 100}%` }} />
        <span className="bg-[#a04700]" style={{ width: `${(reach / total) * 100}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#43474e]">
        <span>An toàn: {safe} nguyện vọng</span>
        <span>Vừa sức: {match} nguyện vọng</span>
        <span>Thử thách: {reach} nguyện vọng</span>
      </div>
    </div>
  );
}

export function Section({
  eyebrow,
  title,
  sub,
  children,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto w-full max-w-[1280px] px-6 py-12 md:py-[72px]">
      {eyebrow ? (
        <p className="text-xs font-semibold tracking-[0.04em] text-[#006972] uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-[#0d2c54] md:text-[30px] md:leading-[38px]">
        {title}
      </h2>
      {sub ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#43474e]">{sub}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
