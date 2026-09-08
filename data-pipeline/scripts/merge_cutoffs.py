"""Merge cutoffs from 4 sources -> canonical cutoffs_all.csv (union, keep source column, dedupe exact matches).
In (glob, a missing file skips that source):
  data/out/daniele15/cutoffs.csv            (2018-2023, to_hop joined from majors.csv)
  data/out/htnam2024/cutoffs_2024_htnam.csv (2024)
  data/out/cutoffs_vnn_{y}.csv              (2024-2026)
  data/out/cutoffs_ts247_{y}.csv            (2024-2026)
Out: data/out/cutoffs_all.csv
Priority on exact matches (ma_truong, ma_nganh, to_hop, nam, phuong_thuc): ts247 > vnn > htnam > daniele15.
"""
import argparse, csv, glob, re
from pathlib import Path

PRIORITY = {"ts247": 0, "vnn": 1, "htnam": 2, "daniele15": 3}

def norm_manganh(s: str) -> str:
    return re.sub(r"_\d+$", "", (s or "").strip().upper())

def load_daniele15(base: Path):
    rows = []
    tohop = {}
    mp = base / "daniele15" / "majors.csv"
    if mp.exists():
        with open(mp, encoding="utf-8") as f:
            for r in csv.DictReader(f):
                tohop[(r["ma_truong"], r["ma_nganh"], r["nam"])] = r.get("to_hop", "")
    cp = base / "daniele15" / "cutoffs.csv"
    if not cp.exists(): return rows
    with open(cp, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            base = {"ma_truong": r["ma_truong"], "ma_nganh": norm_manganh(r["ma_nganh"]),
                "ten_nganh": "", "diem": r["diem"], "diem_thang": "",
                "phuong_thuc": r["phuong_thuc"], "nam": r["nam"],
                "ghi_chu": r.get("note", ""), "nguon": "daniele15", "source_url": ""}
            for th in split_tohop(tohop.get((r["ma_truong"], r["ma_nganh"], r["nam"]), "")):
                rows.append({**base, "to_hop": th})
    return rows

def load_htnam(base: Path):
    rows, p = [], base / "htnam2024" / "cutoffs_2024_htnam.csv"
    if not p.exists(): return rows
    with open(p, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append({"ma_truong": r["ma_truong"], "ma_nganh": norm_manganh(r["ma_nganh"]),
                "ten_nganh": r.get("ten_nganh", ""), "to_hop": r.get("to_hop", ""),
                "diem": r["diem"], "diem_thang": r.get("diem_thang", ""),
                "phuong_thuc": r.get("phuong_thuc", "THPTQG"), "nam": r.get("nam", "2024"),
                "ghi_chu": r.get("ghi_chu", ""), "nguon": "htnam", "source_url": ""})
    return rows

def split_tohop(s: str) -> list:
    s = (s or "").strip()
    if s.startswith("{") and s.endswith("}"):  # daniele15 set literal {A00,D01}
        s = s[1:-1]
    parts = [p.strip().upper() for p in re.split(r"[;,/|]", s) if p.strip()]
    return parts or [""]


def load_vnn_ts247(base: Path, prefix: str, nguon: str):
    rows = []
    for p in sorted(glob.glob(str(base / f"{prefix}_*.csv"))):
        with open(p, encoding="utf-8") as f:
            for r in csv.DictReader(f):
                for th in split_tohop(r.get("to_hop", "")):
                    rows.append({"ma_truong": r["ma_truong"], "ma_nganh": norm_manganh(r.get("ma_nganh", "")),
                        "ten_nganh": r.get("ten_nganh", ""), "to_hop": th,
                        "diem": r["diem"], "diem_thang": "", "phuong_thuc": r.get("phuong_thuc", ""),
                        "nam": r.get("nam", ""), "ghi_chu": r.get("ghi_chu", ""),
                        "nguon": nguon, "source_url": r.get("source_url", "")})
    return rows

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--outdir", default="data/out")
    args = ap.parse_args()
    base = Path(args.outdir)
    all_rows = (load_daniele15(base) + load_htnam(base)
                + load_vnn_ts247(base, "cutoffs_vnn", "vnn")
                + load_vnn_ts247(base, "cutoffs_ts247", "ts247"))
    print(f"[load] {len(all_rows)} raw rows")
    # Normalize diem to 2 decimals BEFORE dedupe: sources write 25.03 vs 25.0267 for
    # the same cutoff level (the DB numeric(7,2) would also round to 25.03 -> unique violation).
    for r in all_rows:
        try: r["diem"] = f"{round(float(r['diem']), 2):.2f}"
        except (ValueError, TypeError): pass
    best = {}
    for r in all_rows:
        k = (r["ma_truong"], r["ma_nganh"], r["to_hop"], str(r["nam"]), r["phuong_thuc"], str(r["diem"]))
        if k not in best or PRIORITY[r["nguon"]] < PRIORITY[best[k]["nguon"]]:
            best[k] = r
    rows = sorted(best.values(), key=lambda r: (r["nam"], r["ma_truong"], r["ma_nganh"]))
    with open(base / "cutoffs_all.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","ma_nganh","ten_nganh","to_hop","diem",
            "diem_thang","phuong_thuc","nam","ghi_chu","nguon","source_url"])
        w.writeheader(); w.writerows(rows)
    from collections import Counter
    print(f"[save] {base}/cutoffs_all.csv ({len(rows)} rows, deduped from {len(all_rows)})")
    print("sources:", dict(Counter(r["nguon"] for r in rows)))
    print("years:", dict(sorted(Counter(str(r['nam']) for r in rows).items())))

if __name__ == "__main__":
    main()
