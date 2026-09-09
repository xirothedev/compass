"use client";

import { startTransition, useActionState, useDeferredValue, useEffect, useMemo, useOptimistic, useRef, useState, useSyncExternalStore, useTransition } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { BUCKET_META, BucketHeader, CutoffTable, FilterChip, SchoolCard, TierBadge, RANK_TOTAL, interpRank, rankPercentile, type Bucket, type CutoffRow, type SchoolCardData } from "@compass/ui";
import { calcRank, saveOrder } from "./actions";
import { NGANHS } from "./mocks";
import { useProfile } from "./profile";

/* ---------- Theme toggle (header) ---------- */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  // ponytail: external-store mount flag, no setState-in-effect (react-compiler lint)
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const dark = mounted && resolvedTheme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={dark ? "Chế độ sáng" : "Chế độ tối"}
      className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
    >
      {dark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      )}
    </button>
  );
}

/* ---------- Schools: search + filter chips (deferred query, transitioned toggles) ---------- */
/* ---------- Schools: search + quick pills + 4 selects + sort (Stitch catalog) ---------- */
const SCORE_RANGES = [
  { value: "", label: "Mọi mức điểm" },
  { value: "27+", label: "Trên 27.00 điểm" },
  { value: "24-27", label: "24.00 - 27.00" },
  { value: "20-24", label: "20.00 - 24.00" },
  { value: "19-", label: "Dưới 20.00 điểm" },
] as const;

const SCHOOL_SORTS = [
  { value: "cutoff-desc", label: "Điểm chuẩn TB (Cao → Thấp)" },
  { value: "cutoff-asc", label: "Điểm chuẩn TB (Thấp → Cao)" },
  { value: "az", label: "Theo A-Z" },
] as const;

export function SchoolFilters({
  schools,
  regions,
  groups,
  kinds,
  initialQuery = "",
}: {
  schools: (SchoolCardData & { region: string; groups: string[]; kind: string })[];
  regions: string[];
  groups: string[];
  kinds: string[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [kind, setKind] = useState("");
  const [score, setScore] = useState("");
  const [sort, setSort] = useState<(typeof SCHOOL_SORTS)[number]["value"]>("cutoff-desc");
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const arr = schools.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) &&
        (!region || s.region === region) &&
        (!group || s.groups.includes(group)) &&
        (!kind || s.kind === kind) &&
        (!score ||
          (score === "27+" ? s.cutoff2024 >= 27 : score === "24-27" ? s.cutoff2024 >= 24 && s.cutoff2024 < 27 : score === "20-24" ? s.cutoff2024 >= 20 && s.cutoff2024 < 24 : s.cutoff2024 < 20)),
    );
    if (sort === "cutoff-asc") arr.sort((a, b) => a.cutoff2024 - b.cutoff2024);
    else if (sort === "az") arr.sort((a, b) => a.name.localeCompare(b.name, "vi"));
    else arr.sort((a, b) => b.cutoff2024 - a.cutoff2024);
    return arr;
  }, [schools, deferredQuery, region, group, kind, score, sort]);

  const toggle = (fn: (v: string | null) => void, cur: string | null, v: string) =>
    startTransition(() => fn(cur === v ? null : v));
  const reset = () =>
    startTransition(() => {
      setQuery("");
      setRegion(null);
      setGroup(null);
      setKind("");
      setScore("");
    });
  const hasFilter = query !== "" || region !== null || group !== null || kind !== "" || score !== "";

  return (
    <div>
      <form
        role="search"
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2 pl-4"
      >
        <label htmlFor="school-search" className="sr-only">
          Tìm kiếm trường
        </label>
        <input
          id="school-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm theo tên trường, mã trường (BKA, NEU, FTU...)"
          className="h-11 min-w-0 flex-1 bg-transparent text-sm text-ink placeholder:text-faint focus:outline-none"
        />
        <kbd className="hidden shrink-0 rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted sm:block">
          ⌘K
        </kbd>
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-cta text-sm font-bold text-on-cta hover:bg-cta-hover"
        >
          →
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center gap-2" aria-label="Bộ lọc nhanh">
        <span className="text-xs font-semibold tracking-[0.04em] text-muted uppercase">Bộ lọc nhanh:</span>
        {[...regions, ...groups].map((f) => {
          const active = region === f || group === f;
          const isRegion = regions.includes(f);
          return (
            <FilterChip
              key={f}
              label={active ? `${f} ×` : f}
              active={active}
              onToggle={() =>
                toggle(isRegion ? setRegion : setGroup, isRegion ? region : group, f)
              }
            />
          );
        })}
        {hasFilter ? (
          <button type="button" onClick={reset} className="text-[13px] font-semibold text-accent hover:underline">
            Đặt lại bộ lọc
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Khu vực &amp; Tỉnh thành</span>
          <select value={region ?? ""} onChange={(e) => setRegion(e.target.value || null)} className="h-11 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none">
            <option value="">Tất cả khu vực</option>
            {regions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Nhóm ngành đào tạo</span>
          <select value={group ?? ""} onChange={(e) => setGroup(e.target.value || null)} className="h-11 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none">
            <option value="">Tất cả nhóm ngành</option>
            {groups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Loại hình trường</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none">
            <option value="">Tất cả loại hình</option>
            {kinds.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink">Khoảng điểm chuẩn 2024</span>
          <select value={score} onChange={(e) => setScore(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none">
            {SCORE_RANGES.map((r) => (
              <option key={r.value} value={r.value}>{r.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          Tìm thấy <strong className="tabular-nums text-ink">{filtered.length}</strong> Trường phù hợp
          {isPending ? " (đang lọc...)" : ""}
        </p>
        <label className="flex items-center gap-2 text-sm text-muted">
          Sắp xếp:
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-11 rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none">
            {SCHOOL_SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {filtered.map((s) => (
          <SchoolCard key={s.code} school={s} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
          Không tìm thấy trường phù hợp. Thử đổi từ khóa hoặc bộ lọc.
        </p>
      ) : null}
    </div>
  );
}

/* ---------- Suggestions: client-side sort over server-computed rows ---------- */
const SORTS = [
  { value: "recommended", label: "Thứ tự ưu tiên đề xuất (Bộ GD&ĐT)" },
  { value: "cutoff-desc", label: "Điểm chuẩn 2024 giảm dần" },
  { value: "delta-desc", label: "Độ dư điểm giảm dần" },
] as const;

export function SuggestionList({
  rows,
  deltas,
  score,
}: {
  rows: CutoffRow[];
  deltas: Record<string, number>;
  score: number;
}) {
  const [sort, setSort] = useState<(typeof SORTS)[number]["value"]>("recommended");
  const [bucket, setBucket] = useState<"all" | Bucket>("all");
  const sorted = useMemo(() => {
    const arr = [...rows];
    if (sort === "cutoff-desc") arr.sort((a, b) => b.y2024 - a.y2024);
    if (sort === "delta-desc") arr.sort((a, b) => (deltas[b.code] ?? 0) - (deltas[a.code] ?? 0));
    return arr;
  }, [rows, deltas, sort]);
  const counts = useMemo(() => {
    const c: Record<Bucket, number> = { reach: 0, match: 0, safe: 0 };
    for (const r of sorted) c[r.tier] += 1;
    return c;
  }, [sorted]);
  const groups: { tier: Bucket; rows: CutoffRow[]; offset: number }[] = useMemo(() => {
    const order: Bucket[] = ["reach", "match", "safe"];
    let offset = 0;
    const out: { tier: Bucket; rows: CutoffRow[]; offset: number }[] = [];
    for (const tier of order) {
      if (bucket !== "all" && bucket !== tier) continue;
      const gr = sorted.filter((r) => r.tier === tier);
      if (gr.length === 0) continue;
      out.push({ tier, rows: gr, offset });
      offset += gr.length;
    }
    return out;
  }, [sorted, bucket]);
  return (
    <div>
      <div className="sticky top-16 z-30 -mx-1 bg-canvas/95 px-1 py-2 shadow-[0_1px_8px_rgba(13,44,84,0.06)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="sort" className="text-sm font-medium text-ink">
            Sắp xếp:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="h-11 rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <VirtualFilterTip />
          <ReorderModal items={sorted} />
          <ExportCsv rows={sorted} />
        </div>
        <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Lọc theo giỏ">
          <FilterChip label={`Tất cả 3 giỏ (${sorted.length})`} active={bucket === "all"} onToggle={() => setBucket("all")} />
          {(["reach", "match", "safe"] as Bucket[]).map((t) => (
            <FilterChip
              key={t}
              label={`${BUCKET_META[t].label} (${counts[t]})`}
              dotClassName={BUCKET_META[t].dot}
              active={bucket === t}
              onToggle={() => setBucket(bucket === t ? "all" : t)}
            />
          ))}
        </div>
      </div>
      {groups.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
          Không tìm thấy nguyện vọng nào phù hợp với bộ lọc.{" "}
          <button type="button" onClick={() => setBucket("all")} className="font-semibold text-accent hover:underline">
            Đặt lại bộ lọc
          </button>
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((g) => (
            <section key={g.tier} aria-label={BUCKET_META[g.tier].label}>
              <BucketHeader tier={g.tier} count={g.rows.length} />
              <div className="mt-3">
                <CutoffTable rows={g.rows} rankOffset={g.offset} />
              </div>
            </section>
          ))}
        </div>
      )}
      <p className="mt-3 text-[13px] tabular-nums text-muted">
        Độ dư = điểm của bạn ({score.toFixed(2)}) trừ điểm chuẩn 2024.
      </p>
    </div>
  );
}

/* ---------- Lookup: subject-sum form + rank via server action (Stitch lookup) ---------- */
const COMBOS = ["A00", "A01", "B00", "D01", "C00", "K01"];

const COMBO_SUBJECTS: Record<string, [string, string, string]> = {
  A00: ["Toán học", "Vật lí", "Hóa học"],
  A01: ["Toán học", "Vật lí", "Tiếng Anh"],
  B00: ["Toán học", "Hóa học", "Sinh học"],
  C00: ["Ngữ văn", "Lịch sử", "Địa lí"],
  D01: ["Toán học", "Ngữ văn", "Tiếng Anh"],
  K01: ["Toán học", "Ngữ văn", "Đánh giá tư duy"],
};

const EXAMS = [
  "Kỳ thi tốt nghiệp THPT 2025 (Chính thức)",
  "Kỳ thi thử THPTQG Đợt 2 (Toàn quốc)",
  "Kỳ thi tốt nghiệp THPT 2024",
];

function splitScore(score: number): [string, string, string] {
  if (Math.abs(score - 26.85) < 0.001) return ["9.20", "8.75", "8.90"];
  const each = (Math.max(0, Math.min(30, score)) / 3).toFixed(2);
  return [each, each, each];
}

function num(v: string): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(10, Math.max(0, n)) : 0;
}

export function LookupForm({ defaultScore = 26.85, defaultCombo = "A00" }: { defaultScore?: number; defaultCombo?: string }) {
  const [state, action, isPending] = useActionState(calcRank, null);
  const [combo, setCombo] = useState(COMBOS.includes(defaultCombo) ? defaultCombo : "A00");
  const [subjects, setSubjects] = useState<[string, string, string]>(() => splitScore(defaultScore));
  const [priority, setPriority] = useState("0.00");
  const total = useMemo(
    () => Math.min(30, num(subjects[0]) + num(subjects[1]) + num(subjects[2]) + num(priority)),
    [subjects, priority],
  );
  const setSubject = (i: number, v: string) =>
    setSubjects((cur) => (i === 0 ? [v, cur[1], cur[2]] : i === 1 ? [cur[0], v, cur[2]] : [cur[0], cur[1], v]));
  const reset = () => {
    setCombo("A00");
    setSubjects(["9.20", "8.75", "8.90"]);
    setPriority("0.00");
  };
  const names = COMBO_SUBJECTS[combo];
  // ponytail: live preview from client total mirrors Stitch (always-filled right column);
  // server state wins when live distribution answers.
  const liveRank = interpRank(total);
  const display = state ?? { score: total, combo, rank: liveRank, percentile: rankPercentile(liveRank) };
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="flex flex-col gap-4 lg:col-span-5">
        <form action={action} className="rounded-2xl border border-line bg-surface p-6">
          <p className="text-xs font-semibold tracking-[0.04em] text-accent uppercase">Bước 1/2</p>
          <h2 className="mt-1 text-xl font-semibold text-ink">Thông tin điểm thi của Thí sinh</h2>
          <p className="mt-1 text-sm text-muted">Nhập chuẩn xác để có kết quả đối sánh chuẩn.</p>

          <label htmlFor="exam" className="mt-5 block text-sm font-semibold text-ink">
            Kỳ thi đánh giá
          </label>
          <select id="exam" name="exam" className="mt-2 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink focus:border-accent focus:outline-none">
            {EXAMS.map((e) => (
              <option key={e}>{e}</option>
            ))}
          </select>

          <span id="program-label" className="mt-4 block text-sm font-semibold text-ink">
            Khung chương trình phổ thông
          </span>
          <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup" aria-labelledby="program-label">
            {[
              ["GDPT 2018", "Sách giáo khoa mới"],
              ["GDPT 2006", "Thí sinh tự do"],
            ].map(([v, s], i) => (
              <label key={v} className={`cursor-pointer rounded-xl border p-3 text-center ${i === 0 ? "border-accent bg-surface-2" : "border-line"}`}>
                <input type="radio" name="program" value={v} defaultChecked={i === 0} className="sr-only" />
                <span className="block text-sm font-semibold text-ink">{v}</span>
                <span className="block text-xs text-muted">{s}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span id="combo-label" className="text-sm font-semibold text-ink">
              Tổ hợp môn xét tuyển
            </span>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2" role="radiogroup" aria-labelledby="combo-label">
            {COMBOS.map((c) => (
              <label
                key={c}
                className={`cursor-pointer rounded-xl border p-2 text-center ${combo === c ? "border-accent bg-surface-2" : "border-line hover:bg-surface-2"}`}
              >
                <input
                  type="radio"
                  name="combo"
                  value={c}
                  checked={combo === c}
                  onChange={() => setCombo(c)}
                  className="sr-only"
                />
                <span className="block text-sm font-bold text-ink">{c}</span>
                <span className="block truncate text-[11px] text-muted">{COMBO_SUBJECTS[c].join(" · ")}</span>
              </label>
            ))}
          </div>

          <div className="mt-4 rounded-xl bg-surface-2 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink">Điểm thành phần (Thang 0 - 10)</p>
              <span className="text-xs text-muted">Bước điểm 0.05</span>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {names.map((label, i) => (
                <label key={label} className="grid grid-cols-12 items-center gap-2">
                  <span className="col-span-5 text-[13px] text-body">{label}</span>
                  <input
                    value={subjects[i]}
                    onChange={(e) => setSubject(i, e.target.value)}
                    type="number"
                    min={0}
                    max={10}
                    step={0.05}
                    aria-label={`Điểm ${label}`}
                    className="col-span-7 h-11 rounded-lg border border-line bg-surface px-3 text-right text-sm font-bold tabular-nums text-ink focus:border-accent focus:outline-none"
                  />
                </label>
              ))}
              <label className="grid grid-cols-12 items-center gap-2">
                <span className="col-span-5 text-[13px] text-body">Điểm ưu tiên</span>
                <input
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  type="number"
                  min={0}
                  max={10}
                  step={0.05}
                  aria-label="Điểm ưu tiên"
                  className="col-span-7 h-11 rounded-lg border border-line bg-surface px-3 text-right text-sm font-bold tabular-nums text-ink focus:border-accent focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-accent/40 bg-surface-2 p-4 text-center">
            <p className="text-[13px] text-muted">Tổng điểm xét tuyển {combo} · Đã cộng ưu tiên</p>
            <p className="mt-1 text-3xl font-bold tabular-nums text-ink">
              {total.toFixed(2)} <span className="text-base font-medium text-muted">/ 30.00</span>
            </p>
          </div>
          <input type="hidden" name="score" value={total.toFixed(2)} />

          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={isPending}
              className="h-11 flex-1 rounded-lg bg-cta text-sm font-semibold text-on-cta hover:bg-cta-hover disabled:opacity-60"
            >
              {isPending ? "Đang phân tích..." : "Phân tích Thứ hạng & Phổ điểm"}
            </button>
            <button
              type="button"
              onClick={reset}
              aria-label="Nhập lại"
              title="Nhập lại"
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line text-lg text-muted hover:bg-surface-2"
            >
              ↺
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-surface-2 p-4">
            <p className="text-sm font-semibold text-ink">Lưu ý về quy chế tính điểm 2025</p>
            <p className="mt-1 text-[13px] leading-relaxed text-body">
              Với mức tổng điểm từ 22.50 trở lên, điểm ưu tiên được tính giảm dần theo công thức{" "}
              <code className="rounded bg-surface px-1 font-mono">[(30 - Tổng điểm)/7.5] × Mức ưu tiên</code>.
              Nhập điểm ưu tiên thực tế của bạn để tổng điểm chính xác.
            </p>
          </div>
        </form>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-7">
        <p className="rounded-full border border-line bg-surface px-3 py-1.5 text-center text-xs text-muted">
          Ước tính vị trí phân vị tổ hợp {combo} toàn quốc
        </p>
        <div className="overflow-hidden rounded-2xl bg-[#0d2c54] p-6 text-white" aria-live="polite">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-5">
              <Dial value={100 - display.percentile} />
              <div>
                <p className="text-sm text-white/70">
                  Điểm {display.score.toFixed(2)} · Tổ hợp {display.combo}
                </p>
                <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
                  Hạng ~{display.rank.toLocaleString("vi-VN")}
                </p>
                <p className="mt-1 text-sm text-white/85">
                  / 900.000 thí sinh · Top {display.percentile.toFixed(1)}% toàn quốc
                </p>
              </div>
            </div>
            <TierBadge
              tier={display.percentile <= 5 ? "safe" : display.percentile <= 20 ? "match" : "reach"}
              className="self-start border-white/20"
            />
            <div className="flex flex-col gap-2 border-t border-white/15 pt-4 sm:flex-row">
              <Link
                href={`/suggestions?score=${display.score.toFixed(2)}&combo=${encodeURIComponent(display.combo)}`}
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-[#00838f] px-5 text-sm font-semibold text-white hover:bg-[#006972]"
              >
                Xem gợi ý nguyện vọng
              </Link>
              <Link
                href="/schools"
                className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-white/60 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                So sánh điểm chuẩn
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-base font-semibold text-ink">Biểu đồ phân bố Phổ điểm Tổ hợp {combo}</h3>
          <p className="mt-1 text-[13px] text-muted">Mô hình đường cong chuẩn hóa · trục điểm 0 - 30 · ghim vị trí của bạn.</p>
          <svg viewBox="0 0 320 120" role="img" aria-label={`Vị trí ${total.toFixed(2)} điểm trên phổ`} className="mt-3 w-full">
            {[20, 45, 70, 95].map((y) => (
              <line key={y} x1="20" y1={y} x2="300" y2={y} stroke="var(--color-line)" strokeWidth="1" strokeDasharray="3 4" />
            ))}
            <path
              d="M20 105 C 80 103, 110 95, 140 70 S 190 25, 215 30 S 260 75, 300 100"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
            />
            {(() => {
              const x = 20 + (Math.min(30, Math.max(0, total)) / 30) * 280;
              return (
                <g>
                  <line x1={x} y1="12" x2={x} y2="105" stroke="#dc2626" strokeWidth="1.5" strokeDasharray="4 3" />
                  <circle cx={x} cy="34" r="5" fill="#dc2626" />
                </g>
              );
            })()}
            <text x="20" y="118" fontSize="9" fill="var(--color-faint)">0</text>
            <text x="155" y="118" fontSize="9" fill="var(--color-faint)">15</text>
            <text x="292" y="118" fontSize="9" fill="var(--color-faint)">30</text>
          </svg>
          <p className="mt-1 text-center text-[13px] font-semibold tabular-nums text-ink">
            Bạn đang ở đây: {total.toFixed(2)} điểm
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">Vùng điểm an toàn (19.0 - 24.5)</span>
            <span className="rounded-full bg-surface-2 px-3 py-1 text-xs text-muted">Vùng trường Top đầu (&gt; 25.5)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-base font-semibold text-ink">Phân tích chi tiết mức độ cạnh tranh</h3>
          <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
            {[
              ["Bằng hoặc cao hơn bạn", `~${display.rank.toLocaleString("vi-VN")}`, `Top ${display.percentile.toFixed(1)}%`],
              ["Thấp hơn điểm của bạn", `~${(RANK_TOTAL - display.rank).toLocaleString("vi-VN")}`, "thí sinh đã vượt qua"],
              ["Tổng mẫu phân tích", "900.000", "thí sinh cả nước"],
            ].map(([l, v, s]) => (
              <div key={l} className="rounded-lg bg-surface-2 p-3">
                <dt className="text-[11px] text-muted">{l}</dt>
                <dd className="mt-1 text-base font-bold tabular-nums text-ink">{v}</dd>
                <dd className="text-[11px] text-muted">{s}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Thứ hạng càng nhỏ càng tốt. Đối chiếu thứ hạng với chỉ tiêu và điểm chuẩn 3 năm của ngành
            mục tiêu; phổ điểm mỗi năm dao động theo độ khó đề thi và chương trình (CT2018 / CT2006).
          </p>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            Phương pháp luận: mô phỏng nội suy từ điểm mốc phổ điểm. Compass không thu thập hay lưu trữ Số báo
            danh (SBD).
          </p>
        </div>
      </div>
    </div>
  );
}

/* ---------- Detail: major search + combo filter over CutoffTable ---------- */
export function DetailMajorFilter({ rows, combos }: { rows: CutoffRow[]; combos: string[] }) {
  const [query, setQuery] = useState("");
  const [combo, setCombo] = useState("");
  const deferredQuery = useDeferredValue(query);
  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return rows.filter(
      (r) =>
        (!q || r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)) &&
        (!combo || r.combos.split(",").map((c) => c.trim()).includes(combo)),
    );
  }, [rows, deferredQuery, combo]);
  const hasFilter = query !== "" || combo !== "";
  return (
    <div>
      <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface p-3 md:flex-row">
        <label className="flex-1">
          <span className="sr-only">Tìm ngành</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo mã ngành (IT1, EE2...) hoặc tên chuyên ngành..."
            className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-faint focus:border-accent focus:outline-none"
          />
        </label>
        <label className="md:w-48">
          <span className="sr-only">Tổ hợp</span>
          <select value={combo} onChange={(e) => setCombo(e.target.value)} className="h-11 w-full rounded-lg border border-line bg-surface px-2 text-sm text-ink focus:border-accent focus:outline-none">
            <option value="">Tất cả tổ hợp</option>
            {combos.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        {hasFilter ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setCombo("");
            }}
            className="h-11 shrink-0 rounded-lg border border-line px-4 text-sm font-semibold text-ink hover:bg-surface-2"
          >
            Đặt lại
          </button>
        ) : null}
      </div>
      <p className="mt-3 text-sm text-muted" aria-live="polite">
        Hiển thị <strong className="tabular-nums text-ink">{filtered.length}</strong> / {rows.length} chương trình đào tạo
      </p>
      <div className="mt-3">
        {filtered.length > 0 ? (
          <CutoffTable rows={filtered} />
        ) : (
          <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
            Không tìm thấy ngành phù hợp. Thử đổi từ khóa hoặc tổ hợp.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------- Onboarding: 5-step wizard (ends with Xác nhận hồ sơ) ---------- */
const STEPS = ["Điểm số & Tổ hợp", "Nhóm ngành yêu thích", "Khu vực & Ngân sách", "Chiến lược", "Xác nhận hồ sơ"] as const;
const COMBO_OPTIONS = ["A00", "A01", "B00", "D01", "C00", "K01"];
const GROUP_OPTIONS = ["Kỹ thuật - Công nghệ", "Kinh tế - Quản trị", "Sức khỏe", "Xã hội - Nhân văn", "Ngoại ngữ"];
const REGION_OPTIONS = ["Hà Nội", "TP.HCM", "Học phí dưới 25 triệu/năm"];
const STRATEGIES = [
  { value: "balanced", title: "Chiến lược Cân bằng", desc: "Phân bố an toàn và mở rộng cơ hội ở các nhóm trường." },
  { value: "careful", title: "Chiến lược Thận trọng", desc: "Tối đa hóa xác suất đỗ đại học công lập." },
  { value: "bold", title: "Chiến lược Đột phá", desc: "Đặt mục tiêu cao vào nhóm trường top đầu." },
] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const { profile, setProfile } = useProfile();
  const { score, combo, group, region, strategy } = profile;
  const [saved, setSaved] = useState(false);
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  const matchCount = useMemo(
    () => NGANHS.filter((n) => n.toHop.includes(combo)).length,
    [combo],
  );
  const strategyTitle = STRATEGIES.find((s) => s.value === strategy)?.title ?? strategy;
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">
          Tiến trình khảo sát [Bước {step + 1}/{STEPS.length}]
        </p>
        <p className="text-sm tabular-nums text-muted">Hoàn thành {Math.round(progress)}%</p>
      </div>
      <ol className="mt-3 flex gap-2" aria-label="Các bước khảo sát">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <span className={`block h-2 rounded-full ${i <= step ? "bg-accent" : "bg-line"}`} />
            <span className={`mt-2 block text-xs font-medium ${i === step ? "text-ink" : "text-muted"}`}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="rounded-2xl border border-line bg-surface p-6 md:p-8 lg:col-span-8" aria-live="polite">
        {step < 3 ? (
          <div>
            <h2 className="text-xl font-semibold text-ink">Bước {step + 1}: {STEPS[step]}</h2>
            <p className="mt-2 text-sm text-body">
              {step === 0 && "Nhập điểm dự kiến và chọn tổ hợp xét tuyển của bạn (ví dụ A00: Toán, Lý, Hóa)."}
              {step === 1 && "Chọn nhóm ngành bạn yêu thích nhất."}
              {step === 2 && "Chọn khu vực và mức học phí phù hợp với gia đình."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(step === 0 ? COMBO_OPTIONS : step === 1 ? GROUP_OPTIONS : REGION_OPTIONS).map((o) => {
                const key = step === 0 ? "combo" : step === 1 ? "group" : "region";
                const active = profile[key] === o;
                return <FilterChip key={o} label={o} active={active} onToggle={() => setProfile({ [key]: o })} />;
              })}
            </div>
            {step === 0 ? (
              <label className="mt-4 block max-w-xs">
                <span className="text-sm font-semibold text-ink">Điểm dự kiến (thang 30)</span>
                <input
                  value={score}
                  onChange={(e) => setProfile({ score: e.target.value })}
                  type="number"
                  min={0}
                  max={30}
                  step={0.01}
                  className="mt-2 h-12 w-full rounded-lg border border-line px-4 text-lg font-bold tabular-nums focus:border-accent focus:ring-2 focus:ring-accent/30 focus:outline-none"
                />
              </label>
            ) : null}
          </div>
        ) : step === 3 ? (
          <fieldset>
            <legend className="text-xl font-semibold text-ink">Bước 4: Chọn chiến lược nguyện vọng</legend>
            <div className="mt-4 flex flex-col gap-3">
              {STRATEGIES.map((s) => (
                <label key={s.value} className={`cursor-pointer rounded-xl border p-4 ${strategy === s.value ? "border-accent bg-surface-2" : "border-line"}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="strategy" value={s.value} checked={strategy === s.value} onChange={() => setProfile({ strategy: s.value })} className="size-4 accent-accent" />
                    <span className="font-semibold text-ink">{s.title}</span>
                  </span>
                  <span className="mt-1 block pl-7 text-sm text-body">{s.desc}</span>
                </label>
              ))}
            </div>
          </fieldset>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-ink">Bước 5: Xác nhận hồ sơ xét tuyển</h2>
            <p className="mt-2 text-sm text-body">
              Kiểm tra lại thông số trước khi xem gợi ý nguyện vọng.
            </p>
            <dl className="mt-4 flex flex-col gap-2">
              {[
                { label: "Điểm dự kiến", chip: `${score || "—"} / 30`, edit: 0 },
                { label: "Tổ hợp môn", chip: combo, edit: 0 },
                { label: "Nhóm ngành", chip: group, edit: 1 },
                { label: "Khu vực", chip: region, edit: 2 },
                {
                  label: "Chiến lược",
                  chip: STRATEGIES.find((s) => s.value === strategy)?.title ?? strategy,
                  edit: 3,
                },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <dt className="w-28 shrink-0 text-[13px] text-muted">{r.label}</dt>
                  <dd className="min-w-0 flex-1 truncate text-sm font-semibold text-ink">{r.chip}</dd>
                  <button
                    type="button"
                    onClick={() => setStep(r.edit)}
                    className="shrink-0 rounded-md px-2 py-2 text-[13px] font-semibold text-accent hover:bg-surface-2"
                  >
                    Sửa
                  </button>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[13px] text-muted">
              Dữ liệu chỉ nằm trên trình duyệt của bạn, Compass không thu thập danh tính.
            </p>
          </div>
        )}
        <div className="mt-6 flex items-center gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="h-11 rounded-lg border border-line px-5 text-sm font-semibold text-ink hover:bg-surface-2">
              ← Quay lại
            </button>
          ) : null}
          <button type="button" onClick={() => setSaved(true)} className="h-11 rounded-lg border border-line px-5 text-sm font-semibold text-ink hover:bg-surface-2">
            {saved ? "Đã lưu tạm ✓" : "Lưu tạm"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="ml-auto h-11 rounded-lg bg-cta px-5 text-sm font-semibold text-on-cta hover:bg-cta-hover">
              Tiếp tục →
            </button>
          ) : (
            <Link
              href={`/suggestions?score=${encodeURIComponent(score)}&combo=${encodeURIComponent(combo)}`}
              className="ml-auto inline-flex h-11 items-center rounded-lg bg-accent px-5 text-sm font-semibold text-on-cta hover:bg-accent-hover"
            >
              Xem gợi ý nguyện vọng
            </Link>
          )}
        </div>
        <span className="sr-only">{Math.round(progress)}% hoàn thành</span>
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-surface p-5 lg:col-span-4 lg:sticky lg:top-32" aria-label="Tóm tắt hồ sơ thí sinh">
          <h2 className="text-base font-semibold text-ink">Tóm tắt hồ sơ Thí sinh</h2>
          <dl className="mt-3 flex flex-col gap-2 text-sm">
            <div className="flex justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-muted">Tổ hợp môn</dt>
              <dd className="font-bold text-ink">{combo}</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-muted">Điểm dự kiến</dt>
              <dd className="font-bold tabular-nums text-ink">{score || "—"}/30.00</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-muted">Nhóm ngành</dt>
              <dd className="text-right font-semibold text-ink">{group}</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-muted">Khu vực</dt>
              <dd className="text-right font-semibold text-ink">{region}</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-muted">Chiến lược</dt>
              <dd className="text-right font-semibold text-ink">{strategyTitle}</dd>
            </div>
            <div className="flex justify-between gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <dt className="text-muted">Ngành hợp tổ hợp</dt>
              <dd className="font-bold tabular-nums text-ink">~{matchCount}</dd>
            </div>
          </dl>
          <p className="mt-3 text-[13px] leading-relaxed text-muted">
            Hồ sơ cập nhật theo từng lựa chọn của bạn ở khung bên trái.
          </p>
        </aside>
      </div>
    </div>
  );
}

/* ---------- Probability dial (SVG ring, tabular-nums label) ---------- */
export function Dial({ value, label }: { value: number; label?: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <span className="relative inline-flex size-[72px] shrink-0 items-center justify-center" role="img" aria-label={label ?? `${pct.toFixed(1)}%`}>
      <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden className="-rotate-90">
        <circle cx="36" cy="36" r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="7" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * c} ${c}`}
        />
      </svg>
      <span className="absolute text-[13px] font-bold tabular-nums text-white">{pct.toFixed(0)}%</span>
    </span>
  );
}

/* ---------- CSV export (Excel opens CSV; BOM keeps Vietnamese intact) ---------- */
export function ExportCsv({ rows }: { rows: CutoffRow[] }) {
  const download = () => {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const head = ["Thứ tự", "Mã ngành", "Tên chương trình", "Tổ hợp", "Phương thức", "2022", "2023", "2024", "Đánh giá"];
    const lines = rows.map((r, i) =>
      [i + 1, r.code, r.name, r.combos, r.method, r.y2022.toFixed(2), r.y2023.toFixed(2), r.y2024.toFixed(2), BUCKET_META[r.tier].label]
        .map(esc)
        .join(","),
    );
    const blob = new Blob(["﻿" + head.map(esc).join(",") + "\n" + lines.join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "goi-y-nguyen-vong.csv";
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex h-11 items-center rounded-lg border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
    >
      Xuất Excel (CSV)
    </button>
  );
}

/* ---------- Follow button + following list (profile-backed) ---------- */
export function FollowButton({ code }: { code: string }) {
  const { profile, setProfile } = useProfile();
  const following = profile.followed.some((c) => c.toLowerCase() === code.toLowerCase());
  const toggle = () =>
    setProfile({
      followed: following
        ? profile.followed.filter((c) => c.toLowerCase() !== code.toLowerCase())
        : [...profile.followed, code.toUpperCase()],
    });
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={following}
      className="inline-flex h-11 items-center justify-center rounded-lg border border-line bg-surface px-6 text-sm font-semibold text-ink hover:bg-surface-2"
    >
      {following ? "✓ Đang theo dõi" : "+ Thêm vào danh sách theo dõi"}
    </button>
  );
}

export function FollowingList({ schools }: { schools: (SchoolCardData & { region: string; groups: string[] })[] }) {
  const { profile, setProfile } = useProfile();
  const followed = schools.filter((s) =>
    profile.followed.some((c) => c.toLowerCase() === s.code.toLowerCase()),
  );
  if (followed.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
        Bạn chưa theo dõi trường nào. Mở trang trường và bấm “Thêm vào danh sách theo dõi”.
      </p>
    );
  }
  return (
    <div>
      <p className="text-sm text-muted" aria-live="polite">
        {followed.length} trường đang theo dõi
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {followed.map((s) => (
          <div key={s.code} className="relative">
            <SchoolCard school={s} />
            <button
              type="button"
              onClick={() =>
                setProfile({ followed: profile.followed.filter((c) => c.toLowerCase() !== s.code.toLowerCase()) })
              }
              aria-label={`Bỏ theo dõi ${s.code}`}
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-lg bg-surface text-muted shadow hover:bg-surface-2"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Lọc ảo tooltip (CSS-only, hover + keyboard focus) ---------- */
export function VirtualFilterTip() {
  return (
    <span className="group/tip relative inline-flex items-center">
      <button
        type="button"
        aria-describedby="loc-ao-tip"
        aria-label="Lọc ảo là gì?"
        className="flex size-11 items-center justify-center rounded-full border border-line text-sm font-bold text-muted hover:bg-surface-2"
      >
        ?
      </button>
      <span
        role="tooltip"
        id="loc-ao-tip"
        className="absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-lg border border-line bg-surface p-3 text-[13px] leading-relaxed text-body shadow-lg group-hover/tip:block group-focus-within/tip:block"
      >
        <strong className="text-ink">Lọc ảo</strong> ẩn các nguyện vọng có điểm chuẩn 2024 cao hơn
        điểm của bạn quá 1,5 điểm, giúp danh sách gọn và thực tế hơn.
      </span>
    </span>
  );
}

/* ---------- Reorder modal: drag + keyboard, optimistic preview, server save ---------- */
function moveInList<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [picked] = next.splice(from, 1);
  next.splice(to, 0, picked);
  return next;
}

function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden className="shrink-0 text-faint">
      {[3, 8, 13].map((y) =>
        [3, 8, 13].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.4" />),
      )}
    </svg>
  );
}

export function ReorderModal({ items }: { items: CutoffRow[] }) {
  const [open, setOpen] = useState(false);
  const codes = useMemo(() => items.map((i) => i.code), [items]);
  const byCode = useMemo(() => new Map(items.map((i) => [i.code, i])), [items]);
  const [order, setOrder] = useState(codes);
  const [view, moveView] = useOptimistic(order, (cur: string[], m: { from: number; to: number }) =>
    moveInList(cur, m.from, m.to),
  );
  const [saved, saveAction, isSaving] = useActionState(saveOrder, null);
  const dragFrom = useRef<number | null>(null);
  const viewRef = useRef(view);
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    viewRef.current = view;
  });
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open ]);

  const shown = open ? view : order;
  const commit = (from: number, to: number) =>
    startTransition(() => {
      moveView({ from, to });
      setOrder(moveInList(viewRef.current, from, to));
    });

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOrder(codes);
          setOpen(true);
        }}
        className="inline-flex h-11 items-center rounded-lg border border-line bg-surface px-5 text-sm font-semibold text-ink hover:bg-surface-2"
      >
        Sắp xếp thứ tự
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Sắp xếp thứ tự nguyện vọng"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              // ponytail: tiny focus trap; upgrade to native <dialog> if modal grows
              if (e.key !== "Tab" || !panelRef.current) return;
              const els = Array.from(
                panelRef.current.querySelectorAll<HTMLElement>(
                  'button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])',
                ),
              ).filter((el) => el.offsetParent !== null);
              if (els.length === 0) return;
              const first = els[0];
              const last = els[els.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
              }
            }}
            className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-2xl bg-surface p-5 outline-none sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Sắp xếp thứ tự nguyện vọng</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="flex size-11 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-[13px] text-muted">Kéo thả hoặc dùng nút ↑ ↓. Nguyện vọng 1 là ưu tiên cao nhất.</p>
            <ol className="mt-4 flex flex-col gap-2 overflow-y-auto pr-1">
              {shown.map((code, i) => {
                const item = byCode.get(code);
                if (!item) return null;
                return (
                  <li
                    key={code}
                    draggable
                    onDragStart={() => {
                      dragFrom.current = i;
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      if (dragFrom.current !== null && dragFrom.current !== i) {
                        const from = dragFrom.current;
                        dragFrom.current = i;
                        startTransition(() => moveView({ from, to: i }));
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (dragFrom.current !== null) {
                        setOrder(viewRef.current);
                        dragFrom.current = null;
                      }
                    }}
                    onDragEnd={() => {
                      if (dragFrom.current !== null) {
                        setOrder(viewRef.current);
                        dragFrom.current = null;
                      }
                    }}
                    className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2.5"
                  >
                    <GripIcon />
                    <span className="w-7 shrink-0 text-center text-sm font-bold tabular-nums text-ink">{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-ink">{item.name}</span>
                      <span className="text-xs tabular-nums text-muted">
                        {item.code} • {item.y2024.toFixed(2)}
                      </span>
                    </span>
                    <TierBadge tier={item.tier} />
                    <span className="flex shrink-0 flex-col">
                      <button type="button" aria-label={`Đưa ${item.code} lên trên`} disabled={i === 0} onClick={() => commit(i, i - 1)} className="flex size-11 items-center justify-center rounded text-muted hover:bg-surface-2 disabled:opacity-30">
                        ↑
                      </button>
                      <button type="button" aria-label={`Đưa ${item.code} xuống dưới`} disabled={i === shown.length - 1} onClick={() => commit(i, i + 1)} className="flex size-11 items-center justify-center rounded text-muted hover:bg-surface-2 disabled:opacity-30">
                        ↓
                      </button>
                    </span>
                  </li>
                );
              })}
            </ol>
            <form action={saveAction} className="mt-4 flex items-center gap-3 border-t border-line-soft pt-4">
              <input type="hidden" name="order" value={JSON.stringify(order)} />
              <button
                type="submit"
                disabled={isSaving}
                className="h-11 flex-1 rounded-lg bg-cta text-sm font-semibold text-on-cta hover:bg-cta-hover disabled:opacity-60"
              >
                {isSaving ? "Đang lưu..." : saved?.ok ? `Đã lưu ${saved.count} nguyện vọng ✓` : "Lưu thứ tự"}
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
