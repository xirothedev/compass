"""Prep 2026 THPT exam scores: CSV -> anonymize -> compute combos -> parquet + distribution.
Pipeline: raw CSV (keeps SBD) -> DROP SBD -> compute combos -> save parquet.
Based on prep_diemthi_2026.py from TruongThuHa/diem_thi_thptqg-2026-.
"""
import argparse
import pandas as pd

SUBJECTS = [
    "toan", "ngu_van", "ngoai_ngu", "vat_li", "hoa_hoc", "sinh_hoc",
    "lich_su", "dia_li", "gdcd", "tin_hoc", "cong_nghe",
]

TO_HOP = {
    "A00": ["toan", "vat_li", "hoa_hoc"],
    "A01": ["toan", "vat_li", "ngoai_ngu"],
    "A02": ["toan", "vat_li", "sinh_hoc"],
    "B00": ["toan", "hoa_hoc", "sinh_hoc"],
    "C00": ["ngu_van", "lich_su", "dia_li"],
    "C01": ["ngu_van", "toan", "vat_li"],
    "D01": ["ngu_van", "toan", "ngoai_ngu"],
    "D07": ["toan", "hoa_hoc", "ngoai_ngu"],
    # New CT2018 subjects (2025+ format)
    "A0T": ["toan", "vat_li", "tin_hoc"],
    "K01": ["toan", "ngu_van", "tin_hoc"],
}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="inp", default="data/diem_thi_thptqg_2026_all.csv")
    ap.add_argument("--out", dest="out", default="diemthi_2026.parquet")
    ap.add_argument("--dist-out", dest="dist_out", default="score_distribution_2026.csv")
    ap.add_argument("--keep-sbd", action="store_true", help="Keep SBD (default drops it to anonymize)")
    args = ap.parse_args()

    df = pd.read_csv(args.inp, dtype={"sbd": str, "province_code": str})
    print(f"[load] {len(df):,} rows, {df.shape[1]} columns")

    # 1) Validate SBD: 8 chars, first 2 = province_code
    if "sbd" in df.columns:
        bad = df[~df["sbd"].str.match(r"^\d{8}$", na=False)]
        if len(bad):
            print(f"[warn] {len(bad)} SBD with invalid format, dropped")
            df = df.drop(index=bad.index)
        mismatch = df[df["sbd"].str[:2] != df["province_code"]]
        if len(mismatch):
            print(f"[warn] {len(mismatch)} SBD/province_code mismatches, dropped")
            df = df.drop(index=mismatch.index)

    # 2) ANONYMIZE: drop SBD unless --keep-sbd
    if "sbd" in df.columns and not args.keep_sbd:
        df = df.drop(columns=["sbd"])
        print("[anonym] Dropped the sbd column")

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

    # 7) Build the distribution table for the rank API (diem -> count per combo)
    dist_rows = []
    for name in TO_HOP:
        col = f"th_{name}"
        if col in df.columns:
            vc = df[col].dropna().value_counts().sort_index()
            for score, cnt in vc.items():
                dist_rows.append({"ky_thi": "THPTQG", "nam": 2026, "to_hop": name, "diem": round(float(score), 2), "count": int(cnt)})
    dist = pd.DataFrame(dist_rows)
    dist.to_csv(args.dist_out, index=False)
    print(f"[save] {args.dist_out} ({len(dist):,} rows)")

    # Quick sanity check
    print("\n[check] Avg toan by province (top 5):")
    print(df.groupby("province_name")["toan"].mean().sort_values(ascending=False).head())
    print("\n[check] Candidates with combo scores:")
    for name in TO_HOP:
        col = f"th_{name}"
        if col in df.columns:
            print(f"  {name}: {df[col].notna().sum():,}")


if __name__ == "__main__":
    main()
