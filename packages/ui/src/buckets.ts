// ponytail: single source for Safe/Match/Reach; thresholds agreed in grill (delta vs cutoff 2024)
export type Bucket = "safe" | "match" | "reach";

export const BUCKET_META: Record<
  Bucket,
  { label: string; short: string; text: string; bg: string; border: string; dot: string }
> = {
  safe: {
    label: "An toàn",
    short: "Safe",
    text: "text-[var(--safe-text)]",
    bg: "bg-[var(--safe-bg)]",
    border: "border-[var(--safe-border)]",
    dot: "bg-[var(--safe-text)]",
  },
  match: {
    label: "Vừa sức",
    short: "Match",
    text: "text-[var(--match-text)]",
    bg: "bg-[var(--match-bg)]",
    border: "border-[var(--match-border)]",
    dot: "bg-[var(--match-text)]",
  },
  reach: {
    label: "Thử thách",
    short: "Reach",
    text: "text-[var(--reach-text)]",
    bg: "bg-[var(--reach-bg)]",
    border: "border-[var(--reach-border)]",
    dot: "bg-[var(--reach-text)]",
  },
};

/** delta = userScore - cutoff2024. Du da (>=1) -> safe, can bang (>=-0.5) -> match, else reach. */
export function classifyBucket(delta: number): Bucket {
  if (delta >= 1) return "safe";
  if (delta >= -0.5) return "match";
  return "reach";
}
