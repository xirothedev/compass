"""Bulk exam scores (SBD + scores, NO names) -> data/exam_scores_{YYYY}.csv.
Sources (transient, deleted after build to keep data/ flat):
  /tmp/bulkfull/du_lieu_diem_thi_{2017-2022,2026}.csv (sdgedfegw, SBD/Tinh/Khoi* precomputed)
  /tmp/bulkfull/diem_thi_thpt_{2023,2024}.csv (anhdung98)
  /tmp/bulkfull/20250715-ketquathi-ct{2018a,2006}.xlsx (anhdung98, 2025)
Canonical columns: reg_no,province_code,year,curriculum + subjects + combos total_a00..total_d07.
Legal: SBD+scores only, no names (see docs/adr/0004-no-pii.md). No public bulk download from the app.
"""
import argparse
import pandas as pd

SUBJECTS = ["math", "literature", "foreign_lang", "physics", "chemistry", "biology",
            "history", "geography", "civic_education", "econ_law", "informatics", "tech_industry",
            "tech_agri"]
COMBOS = {
    "total_a00": ["math", "physics", "chemistry"], "total_a01": ["math", "physics", "foreign_lang"],
    "total_a02": ["math", "physics", "biology"], "total_b00": ["math", "chemistry", "biology"],
    "total_c00": ["literature", "history", "geography"], "total_c01": ["literature", "math", "physics"],
    "total_d01": ["literature", "math", "foreign_lang"], "total_d07": ["math", "chemistry", "foreign_lang"],
    "total_a0t": ["math", "physics", "informatics"], "total_k01": ["math", "literature", "informatics"],
}
SDG_SUB = {"Toan": "math", "NguVan": "literature", "VatLy": "physics", "HoaHoc": "chemistry",
           "SinhHoc": "biology", "LichSu": "history", "DiaLy": "geography", "GDCD": "civic_education",
           "KinhTePhapLuat": "econ_law", "TinHoc": "informatics",
           "CongNgheCongNghiep": "tech_industry", "CongNgheNongNghiep": "tech_agri",
           "NgoaiNgu": "foreign_lang"}
SDG_KHOI = {"KhoiA": "total_a00", "KhoiA1": "total_a01", "KhoiA02": "total_a02", "KhoiB": "total_b00",
            "KhoiC": "total_c00", "KhoiC01": "total_c01", "KhoiD": "total_d01", "KhoiD07": "total_d07"}
CT2018_MAP = {"Toán": "math", "Văn": "literature", "Lí": "physics", "Hóa": "chemistry",
              "Sinh": "biology", "Tin học": "informatics", "Công nghệ công nghiệp": "tech_industry",
              "Công nghệ nông nghiệp": "tech_agri", "Sử": "history", "Địa": "geography",
              "Giáo dục kinh tế và pháp luật": "econ_law", "Ngoại ngữ": "foreign_lang"}
CT2006_MAP = {"Toán": "math", "Văn": "literature", "Lí": "physics", "Hóa": "chemistry",
              "Sinh": "biology", "Sử": "history", "Địa": "geography",
              "Giáo dục công dân": "civic_education", "Ngoại ngữ": "foreign_lang"}

def norm_reg_no(s: pd.Series) -> pd.Series:
    n = pd.to_numeric(s.astype(str).str.strip(), errors="coerce").astype("Int64")
    out = n.astype(str).str.zfill(8)
    return out.where(out.str.match(r"^\d{8}$", na=False))

def finalize(df: pd.DataFrame, year: int, curriculum: str = "") -> pd.DataFrame:
    df["year"] = year
    df["curriculum"] = curriculum
    for c in SUBJECTS:
        if c not in df.columns: df[c] = pd.NA
        df[c] = pd.to_numeric(df[c], errors="coerce")
    for combo, cols in COMBOS.items():
        if combo not in df.columns:
            tot = df[cols].sum(axis=1).round(2)
            tot[df[cols].isna().any(axis=1)] = pd.NA
            df[combo] = tot
    df = df.dropna(subset=["reg_no"]).drop_duplicates(subset=["reg_no"])
    return df[["reg_no", "province_code", "year", "curriculum"] + SUBJECTS + list(COMBOS)]

def load_sdg(path: str, year: int) -> pd.DataFrame:
    df = pd.read_csv(path, dtype=str)
    df = df.rename(columns={**SDG_SUB, "SOBAODANH": "reg_no"})
    if "SBD" in df.columns: df = df.rename(columns={"SBD": "reg_no"})
    df["reg_no"] = norm_reg_no(df["reg_no"])
    df["province_code"] = df["Tinh"].astype(str).str.strip().str.zfill(2)
    for khoi, combo in SDG_KHOI.items():
        if khoi in df.columns: df[combo] = pd.to_numeric(df[khoi], errors="coerce").round(2)
    return finalize(df, year)

def load_anhdung(path: str, year: int) -> pd.DataFrame:
    df = pd.read_csv(path, dtype=str)
    df["reg_no"] = norm_reg_no(df["reg_no"])
    df["province_code"] = df["reg_no"].str[:2]
    return finalize(df, year)

def load_xlsx(path: str, mapping: dict, year: int, curriculum: str) -> pd.DataFrame:
    xl = pd.ExcelFile(path)
    parts = []
    for sh in xl.sheet_names:
        d = pd.read_excel(xl, sheet_name=sh)
        if d.empty or "SOBAODANH" not in d.columns: continue
        parts.append(d.rename(columns={**mapping, "SOBAODANH": "reg_no"}))
    df = pd.concat(parts, ignore_index=True)
    df["reg_no"] = norm_reg_no(df["reg_no"])
    df["province_code"] = df["reg_no"].str[:2]
    return finalize(df, year, curriculum)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--bulkdir", default="/tmp/bulkfull")
    ap.add_argument("--outdir", default="data")
    ap.add_argument("--years", default="2017,2018,2019,2020,2021,2022,2023,2024,2025,2026")
    args = ap.parse_args()
    for y in [int(x) for x in args.years.split(",") if x.strip()]:
        if y in (2017, 2018, 2019, 2020, 2021, 2022, 2026):
            df = load_sdg(f"{args.bulkdir}/du_lieu_diem_thi_{y}.csv", y)
        elif y in (2023, 2024):
            df = load_anhdung(f"{args.bulkdir}/diem_thi_thpt_{y}.csv", y)
        elif y == 2025:
            a = load_xlsx(f"{args.bulkdir}/20250715-ketquathi-ct2018a.xlsx", CT2018_MAP, y, "CT2018")
            b = load_xlsx(f"{args.bulkdir}/20250715-ketquathi-ct2006.xlsx", CT2006_MAP, y, "CT2006")
            df = pd.concat([a, b], ignore_index=True)
        else:
            raise SystemExit(f"unsupported year {y}")
        out = f"{args.outdir}/exam_scores_{y}.csv"
        df.to_csv(out, index=False)
        print(f"[{y}] {len(df):,} candidates -> {out}", flush=True)
        del df

if __name__ == "__main__":
    main()
