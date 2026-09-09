// ponytail: single source for Safe/Match/Reach; thresholds agreed in grill (delta vs cutoff 2024)
export type Bucket = "safe" | "match" | "reach";

export const BUCKET_META: Record<
  Bucket,
  { label: string; short: string; text: string; bg: string; border: string; dot: string }
> = {
  safe: {
    label: "An toàn",
    short: "Safe",
    text: "text-[#0e6245]",
    bg: "bg-[#ebf7f0]",
    border: "border-[#a6e2c3]",
    dot: "bg-[#0e6245]",
  },
  match: {
    label: "Vừa sức",
    short: "Match",
    text: "text-[#035388]",
    bg: "bg-[#ebf5fa]",
    border: "border-[#89c2e8]",
    dot: "bg-[#035388]",
  },
  reach: {
    label: "Thử thách",
    short: "Reach",
    text: "text-[#a04700]",
    bg: "bg-[#fff4eb]",
    border: "border-[#f8c899]",
    dot: "bg-[#a04700]",
  },
};

/** delta = userScore - cutoff2024. Du da (>=1) -> safe, can bang (>=-0.5) -> match, else reach. */
export function classifyBucket(delta: number): Bucket {
  if (delta >= 1) return "safe";
  if (delta >= -0.5) return "match";
  return "reach";
}
