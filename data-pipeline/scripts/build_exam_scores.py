"""Bulk exam scores (SBD + scores, NO names) -> data/exam_scores_{YYYY}.csv.
Sources (transient, deleted after build to keep data/ flat):
  /tmp/bulkfull/du_lieu_diem_thi_{2017-2022,2026}.csv (sdgedfegw, SBD/Tinh/Khoi* precomputed)
  /tmp/bulkfull/diem_thi_thpt_{2023,2024}.csv (anhdung98)
  /tmp/bulkfull/20250715-ketquathi-ct{2018a,2006}.xlsx (anhdung98, 2025)
Canonical columns: sbd,tinh,nam,chuong_trinh + subjects + combos th_a00..th_d07.
Legal: SBD+scores only, no names (see docs/adr/0004-no-pii.md). No public bulk download from the app.
"""
import argparse
import pandas as pd

SUBJECTS = ["toan", "ngu_van", "ngoai_ngu", "vat_li", "hoa_hoc", "sinh_hoc",
            "lich_su", "dia_li", "gdcd", "ktpl", "tin_hoc", "cong_nghe_cn",
            "cong_nghe_nn"]
COMBOS = {
    "th_a00": ["toan", "vat_li", "hoa_hoc"], "th_a01": ["toan", "vat_li", "ngoai_ngu"],
    "th_a02": ["toan", "vat_li", "sinh_hoc"], "th_b00": ["toan", "hoa_hoc", "sinh_hoc"],
    "th_c00": ["ngu_van", "lich_su", "dia_li"], "th_c01": ["ngu_van", "toan", "vat_li"],
    "th_d01": ["ngu_van", "toan", "ngoai_ngu"], "th_d07": ["toan", "hoa_hoc", "ngoai_ngu"],
    "th_a0t": ["toan", "vat_li", "tin_hoc"], "th_k01": ["toan", "ngu_van", "tin_hoc"],
}
SDG_SUB = {"Toan": "toan", "NguVan": "ngu_van", "VatLy": "vat_li", "HoaHoc": "hoa_hoc",
           "SinhHoc": "sinh_hoc", "LichSu": "lich_su", "DiaLy": "dia_li", "GDCD": "gdcd",
           "KinhTePhapLuat": "ktpl", "TinHoc": "tin_hoc",
           "CongNgheCongNghiep": "cong_nghe_cn", "CongNgheNongNghiep": "cong_nghe_nn",
           "NgoaiNgu": "ngoai_ngu"}
SDG_KHOI = {"KhoiA": "th_a00", "KhoiA1": "th_a01", "KhoiA02": "th_a02", "KhoiB": "th_b00",
            "KhoiC": "th_c00", "KhoiC01": "th_c01", "KhoiD": "th_d01", "KhoiD07": "th_d07"}
CT2018_MAP = {"Toán": "toan", "Văn": "ngu_van", "Lí": "vat_li", "Hóa": "hoa_hoc",
              "Sinh": "sinh_hoc", "Tin học": "tin_hoc", "Công nghệ công nghiệp": "cong_nghe_cn",
              "Công nghệ nông nghiệp": "cong_nghe_nn", "Sử": "lich_su", "Địa": "dia_li",
              "Giáo dục kinh tế và pháp luật": "ktpl", "Ngoại ngữ": "ngoai_ngu"}
CT2006_MAP = {"Toán": "toan", "Văn": "ngu_van", "Lí": "vat_li", "Hóa": "hoa_hoc",
              "Sinh": "sinh_hoc", "Sử": "lich_su", "Địa": "dia_li",
              "Giáo dục công dân": "gdcd", "Ngoại ngữ": "ngoai_ngu"}

def norm_sbd(s: pd.Series) -> pd.Series:
    n = pd.to_numeric(s.astype(str).str.strip(), errors="coerce").astype("Int64")
    out = n.astype(str).str.zfill(8)
    return out.where(out.str.match(r"^\d{8}$", na=False))

def finalize(df: pd.DataFrame, nam: int, chuong_trinh: str = "") -> pd.DataFrame:
    df["nam"] = nam
    df["chuong_trinh"] = chuong_trinh
    for c in SUBJECTS:
        if c not in df.columns: df[c] = pd.NA
        df[c] = pd.to_numeric(df[c], errors="coerce")
    for combo, cols in COMBOS.items():
        if combo not in df.columns:
            tot = df[cols].sum(axis=1).round(2)
            tot[df[cols].isna().any(axis=1)] = pd.NA
            df[combo] = tot
    df = df.dropna(subset=["sbd"]).drop_duplicates(subset=["sbd"])
    return df[["sbd", "tinh", "nam", "chuong_trinh"] + SUBJECTS + list(COMBOS)]

def load_sdg(path: str, nam: int) -> pd.DataFrame:
    df = pd.read_csv(path, dtype=str)
    df = df.rename(columns={**SDG_SUB, "SOBAODANH": "sbd"})
    if "SBD" in df.columns: df = df.rename(columns={"SBD": "sbd"})
    df["sbd"] = norm_sbd(df["sbd"])
    df["tinh"] = df["Tinh"].astype(str).str.strip().str.zfill(2)
    for khoi, combo in SDG_KHOI.items():
        if khoi in df.columns: df[combo] = pd.to_numeric(df[khoi], errors="coerce").round(2)
    return finalize(df, nam)

def load_anhdung(path: str, nam: int) -> pd.DataFrame:
    df = pd.read_csv(path, dtype=str)
    df["sbd"] = norm_sbd(df["sbd"])
    df["tinh"] = df["sbd"].str[:2]
    return finalize(df, nam)

def load_xlsx(path: str, mapping: dict, nam: int, chuong_trinh: str) -> pd.DataFrame:
    xl = pd.ExcelFile(path)
    parts = []
    for sh in xl.sheet_names:
        d = pd.read_excel(xl, sheet_name=sh)
        if d.empty or "SOBAODANH" not in d.columns: continue
        parts.append(d.rename(columns={**mapping, "SOBAODANH": "sbd"}))
    df = pd.concat(parts, ignore_index=True)
    df["sbd"] = norm_sbd(df["sbd"])
    df["tinh"] = df["sbd"].str[:2]
    return finalize(df, nam, chuong_trinh)

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
