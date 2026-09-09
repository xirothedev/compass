"use client";

import { useActionState, useDeferredValue, useMemo, useState, useTransition } from "react";
import { CutoffTable, FilterChip, SchoolCard, TierBadge, type CutoffRow, type SchoolCardData } from "@compass/ui";
import { calcRank } from "./actions";

/* ---------- Schools: search + filter chips (deferred query, transitioned toggles) ---------- */
export function SchoolFilters({
  schools,
  regions,
  groups,
  initialQuery = "",
}: {
  schools: (SchoolCardData & { region: string; groups: string[] })[];
  regions: string[];
  groups: string[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [region, setRegion] = useState<string | null>(null);
  const [group, setGroup] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const deferredQuery = useDeferredValue(query);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    return schools.filter(
      (s) =>
        (!q || s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)) &&
        (!region || s.region === region) &&
        (!group || s.groups.includes(group)),
    );
  }, [schools, deferredQuery, region, group]);

  const toggle = (fn: (v: string | null) => void, cur: string | null, v: string) =>
    startTransition(() => fn(cur === v ? null : v));

  return (
    <div>
      <label className="block">
        <span className="sr-only">Tìm kiếm trường</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm kiếm theo tên trường, mã trường (BKA, NEU, FTU...)"
          className="h-12 w-full rounded-lg border border-[#e2e5eb] bg-white px-4 text-sm text-[#141c26] placeholder:text-[#74777f] focus:border-[#00838f] focus:ring-2 focus:ring-[#00838f]/30 focus:outline-none"
        />
      </label>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Khu vực">
        {regions.map((r) => (
          <FilterChip key={r} label={r} active={region === r} onToggle={() => toggle(setRegion, region, r)} />
        ))}
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Nhóm ngành">
        {groups.map((g) => (
          <FilterChip key={g} label={g} active={group === g} onToggle={() => toggle(setGroup, group, g)} />
        ))}
      </div>
      <p className="mt-4 text-sm text-[#5c6470]" aria-live="polite">
        {filtered.length} trường{isPending ? " (đang lọc...)" : ""}
      </p>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((s) => (
          <SchoolCard key={s.code} school={s} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 rounded-lg border border-dashed border-[#c4c6d0] p-8 text-center text-sm text-[#5c6470]">
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
  const sorted = useMemo(() => {
    const arr = [...rows];
    if (sort === "cutoff-desc") arr.sort((a, b) => b.y2024 - a.y2024);
    if (sort === "delta-desc") arr.sort((a, b) => (deltas[b.code] ?? 0) - (deltas[a.code] ?? 0));
    return arr;
  }, [rows, deltas, sort]);
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="sort" className="text-sm font-medium text-[#0d2c54]">
          Sắp xếp:
        </label>
        <select
          id="sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="h-11 rounded-lg border border-[#e2e5eb] bg-white px-3 text-sm text-[#141c26] focus:border-[#00838f] focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <CutoffTable rows={sorted} />
      <p className="mt-3 text-[13px] tabular-nums text-[#5c6470]">
        Độ dư = điểm của bạn ({score.toFixed(2)}) trừ điểm chuẩn 2024.
      </p>
    </div>
  );
}

/* ---------- Lookup: score + combo -> rank via server action ---------- */
const COMBOS = ["A00", "A01", "B00", "D01", "C00", "K01"];

export function LookupForm({ defaultScore = 26.85 }: { defaultScore?: number }) {
  const [state, action, isPending] = useActionState(calcRank, null);
  return (
    <div className="grid gap-6 lg:grid-cols-[400px_1fr]">
      <form action={action} className="h-fit rounded-2xl border border-[#e2e5eb] bg-white p-6">
        <label htmlFor="score" className="text-sm font-semibold text-[#0d2c54]">
          Điểm của bạn (thang 30)
        </label>
        <input
          id="score"
          name="score"
          type="number"
          min={0}
          max={30}
          step={0.01}
          required
          defaultValue={defaultScore}
          className="mt-2 h-12 w-full rounded-lg border border-[#e2e5eb] px-4 text-lg font-bold tabular-nums focus:border-[#00838f] focus:ring-2 focus:ring-[#00838f]/30 focus:outline-none"
        />
        <label htmlFor="combo" className="mt-4 block text-sm font-semibold text-[#0d2c54]">
          Tổ hợp xét tuyển
        </label>
        <select id="combo" name="combo" defaultValue="A00" className="mt-2 h-12 w-full rounded-lg border border-[#e2e5eb] bg-white px-3 text-sm focus:border-[#00838f] focus:outline-none">
          {COMBOS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          type="submit"
          disabled={isPending}
          className="mt-5 h-11 w-full rounded-lg bg-[#0d2c54] text-sm font-semibold text-white transition-transform hover:bg-[#164075] active:scale-[0.98] disabled:opacity-60"
        >
          {isPending ? "Đang tra cứu..." : "Tra cứu thứ hạng"}
        </button>
      </form>
      <div className="h-fit rounded-2xl border border-[#e2e5eb] bg-white p-6" aria-live="polite">
        {state ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-[#5c6470]">
              Tổ hợp {state.combo} - Điểm {state.score.toFixed(2)}
            </p>
            <p className="text-4xl font-bold tracking-tight tabular-nums text-[#0d2c54]">
              #{state.rank.toLocaleString("vi-VN")}
            </p>
            <p className="text-sm text-[#43474e]">
              Top {state.percentile.toFixed(1)}% toàn quốc (ước tính từ phổ điểm mock).
            </p>
            <TierBadge tier={state.percentile <= 5 ? "reach" : state.percentile <= 20 ? "match" : "safe"} className="mt-1 self-start" />
          </div>
        ) : (
          <p className="text-sm text-[#5c6470]">Nhập điểm và tổ hợp để xem thứ hạng ước tính của bạn.</p>
        )}
      </div>
    </div>
  );
}

/* ---------- Onboarding: 4-step wizard ---------- */
const STEPS = ["Điểm số & Tổ hợp", "Nhóm ngành yêu thích", "Khu vực & Ngân sách", "Chiến lược"] as const;
const STRATEGIES = [
  { value: "balanced", title: "Chiến lược Cân bằng", desc: "Phân bố an toàn và mở rộng cơ hội ở các nhóm trường." },
  { value: "careful", title: "Chiến lược Thận trọng", desc: "Tối đa hóa xác suất đỗ đại học công lập." },
  { value: "bold", title: "Chiến lược Đột phá", desc: "Đặt mục tiêu cao vào nhóm trường top đầu." },
] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [score, setScore] = useState("26.85");
  const [strategy, setStrategy] = useState<string>("balanced");
  const [saved, setSaved] = useState(false);
  const progress = useMemo(() => ((step + 1) / STEPS.length) * 100, [step]);
  return (
    <div className="mx-auto w-full max-w-3xl">
      <ol className="flex gap-2" aria-label="Tiến trình khảo sát">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <span className={`block h-2 rounded-full ${i <= step ? "bg-[#00838f]" : "bg-[#e2e5eb]"}`} />
            <span className={`mt-2 block text-xs font-medium ${i === step ? "text-[#0d2c54]" : "text-[#5c6470]"}`}>{s}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 rounded-2xl border border-[#e2e5eb] bg-white p-6 md:p-8" aria-live="polite">
        {step < 3 ? (
          <div>
            <h2 className="text-xl font-semibold text-[#0d2c54]">Bước {step + 1}: {STEPS[step]}</h2>
            <p className="mt-2 text-sm text-[#43474e]">
              {step === 0 && "Nhập điểm dự kiến và chọn tổ hợp xét tuyển của bạn (ví dụ A00: Toán, Lý, Hóa)."}
              {step === 1 && "Chọn nhóm ngành bạn yêu thích nhất. Có thể chọn nhiều nhóm."}
              {step === 2 && "Chọn khu vực và mức học phí phù hợp với gia đình."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(step === 0 ? ["A00", "A01", "B00", "D01", "C00", "K01"] : step === 1 ? ["Kỹ thuật - Công nghệ", "Kinh tế - Quản trị", "Sức khỏe", "Xã hội - Nhân văn", "Ngoại ngữ"] : ["Hà Nội", "TP.HCM", "Học phí dưới 25 triệu/năm"]).map((o) => (
                <FilterChip key={o} label={o} />
              ))}
            </div>
            {step === 0 ? (
              <label className="mt-4 block max-w-xs">
                <span className="text-sm font-semibold text-[#0d2c54]">Điểm dự kiến (thang 30)</span>
                <input
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  type="number"
                  min={0}
                  max={30}
                  step={0.01}
                  className="mt-2 h-12 w-full rounded-lg border border-[#e2e5eb] px-4 text-lg font-bold tabular-nums focus:border-[#00838f] focus:ring-2 focus:ring-[#00838f]/30 focus:outline-none"
                />
              </label>
            ) : null}
          </div>
        ) : (
          <fieldset>
            <legend className="text-xl font-semibold text-[#0d2c54]">Bước 4: Chọn chiến lược nguyện vọng</legend>
            <div className="mt-4 flex flex-col gap-3">
              {STRATEGIES.map((s) => (
                <label key={s.value} className={`cursor-pointer rounded-xl border p-4 ${strategy === s.value ? "border-[#00838f] bg-[#eff4ff]" : "border-[#e2e5eb]"}`}>
                  <span className="flex items-center gap-3">
                    <input type="radio" name="strategy" value={s.value} checked={strategy === s.value} onChange={() => setStrategy(s.value)} className="size-4 accent-[#00838f]" />
                    <span className="font-semibold text-[#0d2c54]">{s.title}</span>
                  </span>
                  <span className="mt-1 block pl-7 text-sm text-[#43474e]">{s.desc}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <div className="mt-6 flex items-center gap-3">
          {step > 0 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="h-11 rounded-lg border border-[#e2e5eb] px-5 text-sm font-semibold text-[#0d2c54] hover:bg-[#f1f5f9]">
              ← Quay lại
            </button>
          ) : null}
          <button type="button" onClick={() => setSaved(true)} className="h-11 rounded-lg border border-[#e2e5eb] px-5 text-sm font-semibold text-[#0d2c54] hover:bg-[#f1f5f9]">
            {saved ? "Đã lưu tạm ✓" : "Lưu tạm"}
          </button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={() => setStep(step + 1)} className="ml-auto h-11 rounded-lg bg-[#0d2c54] px-5 text-sm font-semibold text-white hover:bg-[#164075]">
              Tiếp tục →
            </button>
          ) : (
            <a href="/suggestions" className="ml-auto inline-flex h-11 items-center rounded-lg bg-[#00838f] px-5 text-sm font-semibold text-white hover:bg-[#006972]">
              Xem gợi ý nguyện vọng
            </a>
          )}
        </div>
        <span className="sr-only">{Math.round(progress)}% hoàn thành</span>
      </div>
    </div>
  );
}
