// ponytail: plain <a> keeps @compass/ui free of a next dependency
// ponytail: colors via semantic vars (--surface, --ink...) so .dark flips with zero per-mode code
import type { ReactNode } from "react";
import { BUCKET_META, type Bucket } from "./buckets";
import { formatScore } from "./years";

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
  dotClassName,
}: {
  label: string;
  active?: boolean;
  onToggle?: () => void;
  dotClassName?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={active}
      className={`inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full border px-4 text-[13px] font-medium transition-colors md:min-h-0 md:h-8 md:px-3.5 ${
        active
          ? "border-transparent bg-accent text-on-accent"
          : "border-line bg-surface text-ink hover:bg-surface-2"
      }`}
    >
      {dotClassName ? <span aria-hidden className={`size-2 shrink-0 rounded-full ${dotClassName}`} /> : null}
      {label}
    </button>
  );
}

export type SchoolCardData = {
  code: string;
  name: string;
  combos: string[];
  cutoff: number;
  year: number;
  trend: "up" | "flat" | "down";
  tuition: string;
  kind?: string;
  region?: string;
  majors?: number;
};

// ponytail: dumb select, router lives in web islands so ui stays next-free
export function YearSwitcher({
  year,
  years,
  onChange,
}: {
  year: number;
  years: readonly number[];
  onChange?: (year: number) => void;
}) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-muted">
      Năm Điểm chuẩn:
      <select
        value={year}
        onChange={(e) => onChange?.(Number(e.target.value))}
        aria-label="Năm Điểm chuẩn"
        className="h-11 rounded-lg border border-line bg-surface px-3 text-sm font-semibold text-ink focus:border-accent focus:outline-none"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}

const TREND = { up: "↗ tăng", flat: "→ ổn định", down: "↘ giảm" } as const;

// ponytail: card mirrors Stitch catalog (emblem + badges + metric box + footer links);
// compare button omitted (no compare feature yet) rather than shipped dead.
export function SchoolCard({ school }: { school: SchoolCardData }) {
  const detail = `/schools/${school.code.toLowerCase()}`;
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 shadow-sm transition-shadow hover:shadow-[0_4px_12px_rgba(13,44,84,0.08)]">
      <div className="flex items-start gap-3">
        <span className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#001736] text-white shadow-sm dark:bg-white dark:text-black">
          <span className="text-sm font-bold">{school.code.slice(0, 3)}</span>
          <span className="text-[10px] opacity-80">{school.region ?? ""}</span>
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap gap-1.5">
            {[school.kind, school.region].filter(Boolean).map((b) => (
              <span key={b} className="rounded bg-[var(--secondary-container)] px-1.5 py-0.5 text-[11px] font-semibold text-[var(--on-secondary-container)] dark:text-white">
                {b}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[11px] font-semibold tracking-[0.04em] text-muted">Mã: {school.code}</p>
          <h3 className="text-base font-semibold leading-snug text-ink">{school.name}</h3>
        </div>
      </div>
      <dl className="grid grid-cols-3 gap-2 rounded-xl bg-surface-2 p-3 text-center">
        <div>
          <dt className="text-[11px] text-muted">Điểm chuẩn {school.year}</dt>
          <dd className="mt-0.5 text-base font-bold tabular-nums text-ink">{formatScore(school.cutoff)}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">Xu hướng 3 năm</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular-nums text-ink">{TREND[school.trend]}</dd>
        </div>
        <div>
          <dt className="text-[11px] text-muted">Học phí / năm</dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">{school.tuition}</dd>
        </div>
      </dl>
      <div className="flex flex-col gap-1 text-[13px] text-muted">
        <p>
          Tổ hợp chủ lực: <span className="font-semibold text-ink">{school.combos.join(", ")}</span>
        </p>
        {typeof school.majors === "number" ? (
          <p>
            Ngành tuyển sinh: <span className="font-semibold tabular-nums text-ink">{school.majors} mã ngành</span>
          </p>
        ) : null}
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-soft pt-3">
        <a href={`/suggestions?school=${school.code}`} className="text-sm font-semibold text-accent hover:underline">
          Gợi ý nguyện vọng tại trường
        </a>
        <a
          href={detail}
          className="inline-flex h-11 items-center rounded-lg bg-[#001736] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0d2c54] dark:bg-white dark:text-black"
        >
          Chi tiết &amp; Điểm chuẩn →
        </a>
      </div>
    </article>
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
  y2025: number;
  tier: Bucket;
  delta?: number;
  quota?: string;
  tuition?: string;
};

export const BUCKET_RANGE: Record<Bucket, string> = {
  reach: "Xác suất 25% - 50%",
  match: "Xác suất 50% - 85%",
  safe: "Xác suất > 85%",
};

export function BucketHeader({ tier, count }: { tier: Bucket; count: number }) {
  const m = BUCKET_META[tier];
  return (
    <div className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border p-4 ${m.bg} ${m.border}`}>
      <TierBadge tier={tier} className="border-transparent bg-white/60" />
      <h3 className={`text-base font-semibold ${m.text}`}>
        {tier === "reach"
          ? "Nhóm Nguyện vọng Thử thách"
          : tier === "match"
            ? "Nhóm Nguyện vọng Vừa sức"
            : "Nhóm Nguyện vọng An toàn"}
      </h3>
      <span className={`text-[13px] font-semibold tabular-nums ${m.text}`}>{BUCKET_RANGE[tier]}</span>
      <span className={`w-full text-[13px] tabular-nums ${m.text}`}>{count} nguyện vọng</span>
    </div>
  );
}

// ponytail: mobile-first cards + md table share one rows array; no JS breakpoint needed.
// Delta column appears only when rows carry it (suggestions, not detail).
export function CutoffTable({ rows, rankOffset = 0 }: { rows: CutoffRow[]; rankOffset?: number }) {
  const showDelta = rows.some((r) => typeof r.delta === "number");
  const showMeta = rows.some((r) => r.quota || r.tuition);
  const head = ["Mã ngành", "Ngành đào tạo", "Tổ hợp môn", "Phương thức", "2022", "2023", "2024", "2025"];
  if (showMeta) head.push("Chỉ tiêu · Học phí");
  if (showDelta) head.push("Chênh lệch");
  head.push("Đánh giá");
  return (
    <>
      <div className="flex flex-col gap-3 md:hidden">
        {rows.map((r, i) => (
          <article key={r.code} className="rounded-xl border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-sm font-bold tabular-nums text-ink">
                  {String(rankOffset + i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.04em] text-muted">{r.code}</p>
                  <h3 className="mt-0.5 text-[15px] font-semibold leading-snug text-ink">{r.name}</h3>
                </div>
              </div>
              <TierBadge tier={r.tier} className="shrink-0" />
            </div>
            <p className="mt-2 text-[13px] text-muted">
              {r.combos} • {r.method}
            </p>
            <dl className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                ["2022", r.y2022, false],
                ["2023", r.y2023, false],
                ["2024", r.y2024, false],
                ["2025", r.y2025, true],
              ].map(([label, value, hot]) => (
                <div
                  key={label as string}
                  className={`rounded-lg border px-2 py-2 ${hot ? "border-line bg-surface-2" : "border-line-soft"}`}
                >
                  <dt className="text-[11px] font-medium text-muted">{label}</dt>
                  <dd className="mt-0.5 text-base font-bold tabular-nums text-ink">
                    {formatScore(value as number)}
                  </dd>
                </div>
              ))}
            </dl>
            {typeof r.delta === "number" ? (
              <p className="mt-2 text-[13px] tabular-nums text-body">
                Chênh lệch:{" "}
                <strong className="text-ink">
                  {r.delta >= 0 ? `+${r.delta.toFixed(2)}` : r.delta.toFixed(2)}
                </strong>
              </p>
            ) : null}
            {r.quota || r.tuition ? (
              <p className="mt-2 text-[13px] text-muted">
                {[r.quota, r.tuition].filter(Boolean).join(" · ")}
              </p>
            ) : null}
          </article>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-lg border border-line md:block">
      <table className="w-full min-w-[880px] border-collapse bg-surface text-sm">
        <thead>
          <tr className="bg-surface-2 text-left text-xs font-semibold tracking-[0.02em] text-ink">
            {head.map((h) => (
              <th key={h} scope="col" className="px-3 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.code} className="border-t border-line-soft align-middle hover:bg-surface-2/60">
              <td className="px-3 py-3 font-semibold tabular-nums text-ink">
                {String(rankOffset + i + 1).padStart(2, "0")} · {r.code}
              </td>
              <td className="px-3 py-3 font-medium text-ink">{r.name}</td>
              <td className="px-3 py-3 text-muted">{r.combos}</td>
              <td className="px-3 py-3 text-muted">{r.method}</td>
              {[r.y2022, r.y2023, r.y2024, r.y2025].map((y, j) => (
                <td key={j} className="px-3 py-3 font-semibold tabular-nums text-ink">
                  {formatScore(y)}
                </td>
              ))}
              {showMeta ? (
                <td className="px-3 py-3 text-[13px] text-muted">
                  {[r.quota, r.tuition].filter(Boolean).join(" · ") || "—"}
                </td>
              ) : null}
              {showDelta ? (
                <td className="px-3 py-3 font-semibold tabular-nums text-ink">
                  {typeof r.delta === "number"
                    ? r.delta >= 0
                      ? `+${r.delta.toFixed(2)}`
                      : r.delta.toFixed(2)
                    : "—"}
                </td>
              ) : null}
              <td className="px-3 py-3">
                <TierBadge tier={r.tier} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </>
  );
}

export function PortfolioBar({ safe, match, reach }: { safe: number; match: number; reach: number }) {
  const total = safe + match + reach || 1;
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full" role="img" aria-label={`An toàn ${safe}, Vừa sức ${match}, Thử thách ${reach}`}>
        <span className="bg-[var(--safe-text)]" style={{ width: `${(safe / total) * 100}%` }} />
        <span className="bg-[var(--match-text)]" style={{ width: `${(match / total) * 100}%` }} />
        <span className="bg-[var(--reach-text)]" style={{ width: `${(reach / total) * 100}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-body">
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
        <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink md:text-[30px] md:leading-[38px]">
        {title}
      </h2>
      {sub ? <p className="mt-3 max-w-2xl text-base leading-relaxed text-body">{sub}</p> : null}
      <div className="mt-8">{children}</div>
    </section>
  );
}
