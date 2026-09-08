"""Raw exam scores -> distribution table for the rank API (no PII stored, only SBD->province then aggregate).
In: data/raw/scores/{diem_thi_thpt_2023.csv, diem_thi_thpt_2024.csv, 20250715-ketquathi-ct2018a.xlsx, 20250715-ketquathi-ct2006.xlsx}
Out: data/out/score_dist_{2023,2024,2025}.csv (ky_thi,nam,to_hop,tinh,diem,count; empty tinh = nationwide)
"""
import argparse
import pandas as pd

OLD_SUBJECTS = ["toan", "ngu_van", "ngoai_ngu", "vat_li", "hoa_hoc", "sinh_hoc",
                "lich_su", "dia_li", "gdcd"]
OLD_COMBOS = {
    "A00": ["toan", "vat_li", "hoa_hoc"], "A01": ["toan", "vat_li", "ngoai_ngu"],
    "A02": ["toan", "vat_li", "sinh_hoc"], "B00": ["toan", "hoa_hoc", "sinh_hoc"],
    "C00": ["ngu_van", "lich_su", "dia_li"], "C01": ["ngu_van", "toan", "vat_li"],
    "D01": ["ngu_van", "toan", "ngoai_ngu"], "D07": ["toan", "hoa_hoc", "ngoai_ngu"],
}
CT2018_MAP = {"Toán": "toan", "Văn": "ngu_van", "Lí": "vat_li", "Hóa": "hoa_hoc",
              "Sinh": "sinh_hoc", "Tin học": "tin_hoc", "Công nghệ công nghiệp": "cong_nghe_cn",
              "Công nghệ nông nghiệp": "cong_nghe_nn", "Sử": "lich_su", "Địa": "dia_li",
              "Giáo dục kinh tế và pháp luật": "ktpl", "Ngoại ngữ": "ngoai_ngu"}
CT2018_COMBOS = {**{k: v for k, v in OLD_COMBOS.items() if k in ("A00", "A01", "D01", "C00")},
                 "A0T": ["toan", "vat_li", "tin_hoc"], "K01": ["toan", "ngu_van", "tin_hoc"]}

def norm_sbd(s: pd.Series) -> pd.Series:
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

def distribute(df: pd.DataFrame, combos: dict, nam: int, out_path: str, chuong_trinh: str = ""):
    recs = []
    for name in combos:
        col = f"th_{name}"
        if col not in df.columns: continue
        s = df[["tinh", col]].dropna()
        if s.empty: continue
        vc = s.value_counts().sort_index()
        for (tinh, diem), cnt in vc.items():
            recs.append({"ky_thi": "THPTQG", "nam": nam, "to_hop": name,
                         "tinh": tinh, "chuong_trinh": chuong_trinh,
                         "diem": float(diem), "count": int(cnt)})
        vcq = df[col].dropna().value_counts().sort_index()
        for diem, cnt in vcq.items():
            recs.append({"ky_thi": "THPTQG", "nam": nam, "to_hop": name,
                         "tinh": "", "chuong_trinh": chuong_trinh,
                         "diem": float(diem), "count": int(cnt)})
    pd.DataFrame(recs).to_csv(out_path, index=False)
    print(f"[save] {out_path} ({len(recs)} rows)")

def load_old(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, dtype={"sbd": str}, usecols=lambda c: c != "ma_ngoai_ngu")
    df["sbd"] = norm_sbd(df["sbd"])
    df = df.dropna(subset=["sbd"])
    for c in OLD_SUBJECTS:
        if c in df.columns: df[c] = pd.to_numeric(df[c], errors="coerce")
    df["tinh"] = df["sbd"].str[:2]
    return combo_totals(df, OLD_COMBOS)

def load_ct2018(path: str) -> pd.DataFrame:
    parts = []
    for sh in ("Sheet1", "Sheet2"):
        d = pd.read_excel(path, sheet_name=sh)
        d = d.rename(columns={**CT2018_MAP, "SOBAODANH": "sbd"})
        d = d.drop(columns=[c for c in ("STT", "Mã môn ngoại ngữ") if c in d.columns])
        parts.append(d)
    df = pd.concat(parts, ignore_index=True)
    df["sbd"] = norm_sbd(df["sbd"])
    df = df.dropna(subset=["sbd"])
    for c in CT2018_MAP.values():
        if c in df.columns: df[c] = pd.to_numeric(df[c], errors="coerce")
    df["tinh"] = df["sbd"].str[:2]
    return combo_totals(df, CT2018_COMBOS)

def load_ct2006(path: str) -> pd.DataFrame:
    m = {"Toán": "toan", "Văn": "ngu_van", "Lí": "vat_li", "Hóa": "hoa_hoc",
         "Sinh": "sinh_hoc", "Sử": "lich_su", "Địa": "dia_li",
         "Giáo dục công dân": "gdcd", "Ngoại ngữ": "ngoai_ngu", "SOBAODANH": "sbd"}
    df = pd.read_excel(path, sheet_name=0).rename(columns=m)
    df = df.drop(columns=[c for c in ("STT", "Mã môn ngoại ngữ") if c in df.columns])
    df["sbd"] = norm_sbd(df["sbd"])
    df = df.dropna(subset=["sbd"])
    for c in OLD_SUBJECTS:
        if c in df.columns: df[c] = pd.to_numeric(df[c], errors="coerce")
    df["tinh"] = df["sbd"].str[:2]
    return combo_totals(df, OLD_COMBOS)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--rawdir", default="data/raw/scores")
    ap.add_argument("--outdir", default="data/out")
    ap.add_argument("--years", default="2023,2024,2025")
    args = ap.parse_args()
    for y in [int(x) for x in args.years.split(",") if x.strip()]:
        if y in (2023, 2024):
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
