"""Raw exam scores -> distribution table for the rank API (no PII stored, only SBD->province then aggregate).
In: data/raw/scores/{diem_thi_thpt_2023.csv, diem_thi_thpt_2024.csv, 20250715-ketquathi-ct2018a.xlsx, 20250715-ketquathi-ct2006.xlsx}
Out: data/out/score_dist_{2023,2024,2025}.csv (exam,year,combo,province_code,score,count; empty province_code = nationwide)
"""
import argparse
import pandas as pd

OLD_SUBJECTS = ["math", "literature", "foreign_lang", "physics", "chemistry", "biology",
                "history", "geography", "civic_education"]
OLD_COMBOS = {
    "A00": ["math", "physics", "chemistry"], "A01": ["math", "physics", "foreign_lang"],
    "A02": ["math", "physics", "biology"], "B00": ["math", "chemistry", "biology"],
    "C00": ["literature", "history", "geography"], "C01": ["literature", "math", "physics"],
    "D01": ["literature", "math", "foreign_lang"], "D07": ["math", "chemistry", "foreign_lang"],
}
CT2018_MAP = {"Toán": "math", "Văn": "literature", "Lí": "physics", "Hóa": "chemistry",
              "Sinh": "biology", "Tin học": "informatics", "Công nghệ công nghiệp": "tech_industry",
              "Công nghệ nông nghiệp": "tech_agri", "Sử": "history", "Địa": "geography",
              "Giáo dục kinh tế và pháp luật": "econ_law", "Ngoại ngữ": "foreign_lang"}
CT2018_COMBOS = {**{k: v for k, v in OLD_COMBOS.items() if k in ("A00", "A01", "D01", "C00")},
                 "A0T": ["math", "physics", "informatics"], "K01": ["math", "literature", "informatics"]}

def norm_reg_no(s: pd.Series) -> pd.Series:
    """8-char SBD: Excel eats leading zeros (01000001 -> 1000001), so zfill is required."""
    n = pd.to_numeric(s.astype(str).str.strip(), errors="coerce").astype("Int64")
    out = n.astype(str).str.zfill(8)
    bad = (~out.str.match(r"^\d{8}$")).sum()
    if bad: print(f"  [warn] {bad} SBD with invalid format, dropped")
    return out.where(out.str.match(r"^\d{8}$", na=False))

def combo_totals(df: pd.DataFrame, combos: dict) -> pd.DataFrame:
    for name, cols in combos.items():
        cols = [c for c in cols if c in df.columns]
        if len(cols) == 3:
            tot = df[cols].sum(axis=1).round(2)
            tot[df[cols].isna().any(axis=1)] = pd.NA
            df[f"th_{name}"] = tot
    return df

def distribute(df: pd.DataFrame, combos: dict, year: int, out_path: str, curriculum: str = ""):
    recs = []
    for name in combos:
        col = f"th_{name}"
        if col not in df.columns: continue
        s = df[["province_code", col]].dropna()
        if s.empty: continue
        vc = s.value_counts().sort_index()
        for (province_code, score), count in vc.items():
            recs.append({"exam": "THPTQG", "year": year, "combo": name,
                         "province_code": province_code, "curriculum": curriculum,
                         "score": float(score), "count": int(count)})
        vcq = df[col].dropna().value_counts().sort_index()
        for score, count in vcq.items():
            recs.append({"exam": "THPTQG", "year": year, "combo": name,
                         "province_code": "", "curriculum": curriculum,
                         "score": float(score), "count": int(count)})
    pd.DataFrame(recs).to_csv(out_path, index=False)
    print(f"[save] {out_path} ({len(recs)} rows)")

TRACK_MAP = {"KhoiA": "A00", "KhoiA1": "A01", "KhoiA02": "A02", "KhoiB": "B00",
            "KhoiC": "C00", "KhoiC01": "C01", "KhoiD": "D01", "KhoiD07": "D07"}

def load_sdgedfegw(path: str) -> pd.DataFrame:
    """Schema sdgedfegw/du-lieu-score-thi: SBD,Tinh + Khoi* precomputed (2017-2022, 2026)."""
    df = pd.read_csv(path, dtype=str)
    df["reg_no"] = norm_reg_no(df["SBD"])
    df = df.dropna(subset=["reg_no"])
    df["province_code"] = df["Tinh"].astype(str).str.strip().str.zfill(2)
    df["province_code"] = df["province_code"].where(df["province_code"].str.match(r"^\d{2}$", na=False))
    return df

def distribute_tracks(df: pd.DataFrame, year: int, out_path: str, curriculum: str = ""):
    import sys
    sys.path.insert(0, "data-pipeline/scripts")
    from province_data import PROVINCE_MAP
    pmap = {k: v[0] for k, v in PROVINCE_MAP.items()}
    newcodes = {v[0] for v in PROVINCE_MAP.values()}
    recs = []
    for track, combo in TRACK_MAP.items():
        if track not in df.columns: continue
        s = pd.to_numeric(df[track], errors="coerce").round(2)
        ok = s.dropna()
        if ok.empty: continue
        vc = pd.concat([df.loc[ok.index, "province_code"], ok], axis=1).value_counts().sort_index()
        for (province_code, score), count in vc.items():
            if pd.isna(province_code): continue
            recs.append({"exam": "THPTQG", "year": year, "combo": combo,
                         "province_code": province_code, "province_code_new": map_province(province_code, year, pmap, newcodes),
                         "curriculum": curriculum,
                         "score": float(score), "count": int(count)})
        for score, count in ok.value_counts().sort_index().items():
            recs.append({"exam": "THPTQG", "year": year, "combo": combo,
                         "province_code": "", "province_code_new": "",
                         "curriculum": curriculum,
                         "score": float(score), "count": int(count)})
    pd.DataFrame(recs).to_csv(out_path, index=False)
    print(f"[save] {out_path} ({len(recs)} rows)", flush=True)

def map_province(t: str, year: int, pmap: dict, newcodes: set) -> str:
    if not t: return ""
    if year == 2026:
        return (t if t in newcodes else "") or pmap.get(t, "")
    return pmap.get(t, "") or (t if t in newcodes else "")

def load_old(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, dtype={"reg_no": str}, usecols=lambda c: c != "ma_ngoai_ngu")
    df["reg_no"] = norm_reg_no(df["reg_no"])
    df = df.dropna(subset=["reg_no"])
    for c in OLD_SUBJECTS:
        if c in df.columns: df[c] = pd.to_numeric(df[c], errors="coerce")
    df["province_code"] = df["reg_no"].str[:2]
    return combo_totals(df, OLD_COMBOS)

def load_ct2018(path: str) -> pd.DataFrame:
    parts = []
    for sh in ("Sheet1", "Sheet2"):
        d = pd.read_excel(path, sheet_name=sh)
        d = d.rename(columns={**CT2018_MAP, "SOBAODANH": "reg_no"})
        d = d.drop(columns=[c for c in ("STT", "Mã môn ngoại ngữ") if c in d.columns])
        parts.append(d)
    df = pd.concat(parts, ignore_index=True)
    df["reg_no"] = norm_reg_no(df["reg_no"])
    df = df.dropna(subset=["reg_no"])
    for c in CT2018_MAP.values():
        if c in df.columns: df[c] = pd.to_numeric(df[c], errors="coerce")
    df["province_code"] = df["reg_no"].str[:2]
    return combo_totals(df, CT2018_COMBOS)

def load_ct2006(path: str) -> pd.DataFrame:
    m = {"Toán": "math", "Văn": "literature", "Lí": "physics", "Hóa": "chemistry",
         "Sinh": "biology", "Sử": "history", "Địa": "geography",
         "Giáo dục công dân": "civic_education", "Ngoại ngữ": "foreign_lang", "SOBAODANH": "reg_no"}
    df = pd.read_excel(path, sheet_name=0).rename(columns=m)
    df = df.drop(columns=[c for c in ("STT", "Mã môn ngoại ngữ") if c in df.columns])
    df["reg_no"] = norm_reg_no(df["reg_no"])
    df = df.dropna(subset=["reg_no"])
    for c in OLD_SUBJECTS:
        if c in df.columns: df[c] = pd.to_numeric(df[c], errors="coerce")
    df["province_code"] = df["reg_no"].str[:2]
    return combo_totals(df, OLD_COMBOS)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rawdir", default="data/raw/scores")
    ap.add_argument("--outdir", default="data/out")
    ap.add_argument("--years", default="2023,2024,2025")
    ap.add_argument("--bulkdir", default="/tmp/bulk",
                    help="Thư mục chứa bulk sdgedfegw du_lieu_diem_thi_{YYYY}.csv (2017-2022, 2026)")
    args = ap.parse_args()
    for y in [int(x) for x in args.years.split(",") if x.strip()]:
        if y in (2017, 2018, 2019, 2020, 2021, 2022, 2026):
            df = load_sdgedfegw(f"{args.bulkdir}/du_lieu_diem_thi_{y}.csv")
            print(f"[{y}] {len(df):,} thí sinh (sdgedfegw)", flush=True)
            distribute_tracks(df, y, f"{args.outdir}/score_dist_{y}.csv")
            del df
        elif y in (2023, 2024):
            df = load_old(f"{args.rawdir}/diem_thi_thpt_{y}.csv")
            print(f"[{y}] {len(df):,} candidates", flush=True)
            distribute(df, OLD_COMBOS, y, f"{args.outdir}/score_dist_{y}.csv")
            del df
        elif y == 2025:
            a = load_ct2018(f"{args.rawdir}/20250715-ketquathi-ct2018a.xlsx")
            b = load_ct2006(f"{args.rawdir}/20250715-ketquathi-ct2006.xlsx")
            print(f"[2025] CT2018 {len(a):,} + CT2006 {len(b):,}", flush=True)
            distribute(a, CT2018_COMBOS, y, f"{args.outdir}/score_dist_2025_ct2018.csv", "CT2018")
            del a
            distribute(b, OLD_COMBOS, y, f"{args.outdir}/score_dist_2025_ct2006.csv", "CT2006")
            del b

if __name__ == "__main__":
    main()
