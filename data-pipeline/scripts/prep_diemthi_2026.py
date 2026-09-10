"""Prep 2026 THPT exam scores: CSV -> anonymize -> compute combos -> parquet + distribution.
Pipeline: raw CSV (keeps reg_no) -> DROP reg_no -> compute combos -> save parquet.
Based on prep_diemthi_2026.py from TruongThuHa/diem_thi_thptqg-2026-.
"""
import argparse
import pandas as pd

SUBJECTS = [
    "math", "literature", "foreign_lang", "physics", "chemistry", "biology",
    "history", "geography", "civic_education", "informatics", "cong_nghe",
]

TO_HOP = {
    "A00": ["math", "physics", "chemistry"],
    "A01": ["math", "physics", "foreign_lang"],
    "A02": ["math", "physics", "biology"],
    "B00": ["math", "chemistry", "biology"],
    "C00": ["literature", "history", "geography"],
    "C01": ["literature", "math", "physics"],
    "D01": ["literature", "math", "foreign_lang"],
    "D07": ["math", "chemistry", "foreign_lang"],
    # New CT2018 subjects (2025+ format)
    "A0T": ["math", "physics", "informatics"],
    "K01": ["math", "literature", "informatics"],
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", default="data/diem_thi_thptqg_2026_all.csv")
    ap.add_argument("--out", dest="out", default="diemthi_2026.parquet")
    ap.add_argument("--dist-out", dest="dist_out", default="score_distribution_2026.csv")
    ap.add_argument("--keep-reg_no", action="store_true", help="Keep reg_no (default drops it to anonymize)")
    args = ap.parse_args()

    df = pd.read_csv(args.inp, dtype={"reg_no": str, "province_code": str})
    print(f"[load] {len(df):,} rows, {df.shape[1]} columns")

    # 1) Validate reg_no: 8 chars, first 2 = province_code
    if "reg_no" in df.columns:
        bad = df[~df["reg_no"].str.match(r"^\d{8}$", na=False)]
        if len(bad):
            print(f"[warn] {len(bad)} reg_no with invalid format, dropped")
            df = df.drop(index=bad.index)
        mismatch = df[df["reg_no"].str[:2] != df["province_code"]]
        if len(mismatch):
            print(f"[warn] {len(mismatch)} reg_no/province_code mismatches, dropped")
            df = df.drop(index=mismatch.index)

    # 2) ANONYMIZE: drop reg_no unless --keep-reg_no
    if "reg_no" in df.columns and not args.keep_sbd:
        df = df.drop(columns=["reg_no"])
        print("[anonym] Dropped the reg_no column")

    # 3) Coerce scores to numeric ('' -> NaN = subject not taken)
    for col in SUBJECTS:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    # 4) Enrich: compute combo totals (missing subject -> excluded)
    for name, cols in TO_HOP.items():
        cols = [c for c in cols if c in df.columns]
        if len(cols) == 3:
            block = df[cols]
            total = block.sum(axis=1)
            total[block.isna().any(axis=1)] = pd.NA
            df[f"th_{name}"] = total

    # 5) Number of subjects each candidate sat
    df["so_mon"] = df[[c for c in SUBJECTS if c in df.columns]].notna().sum(axis=1)

    # 6) Save parquet
    df.to_parquet(args.out, index=False)
    print(f"[save] {args.out} ({len(df):,} rows, {df.shape[1]} columns)")

    # 7) Build the distribution table for the rank API (score -> count per combo)
    dist_rows = []
    for name in TO_HOP:
        col = f"th_{name}"
        if col in df.columns:
            vc = df[col].dropna().value_counts().sort_index()
            for score, count in vc.items():
                dist_rows.append({"exam": "THPTQG", "year": 2026, "combo": name, "score": round(float(score), 2), "count": int(count)})
    dist = pd.DataFrame(dist_rows)
    dist.to_csv(args.dist_out, index=False)
    print(f"[save] {args.dist_out} ({len(dist):,} rows)")

    # Quick sanity check
    print("\n[check] Avg math by province (top 5):")
    print(df.groupby("province_name")["math"].mean().sort_values(ascending=False).head())
    print("\n[check] Candidates with combo scores:")
    for name in TO_HOP:
        col = f"th_{name}"
        if col in df.columns:
            print(f"  {name}: {df[col].notna().sum():,}")


if __name__ == "__main__":
    main()
