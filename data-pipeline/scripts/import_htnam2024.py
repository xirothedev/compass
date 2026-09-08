"""HTNam 2024 (_full) adapter -> Compass schema.
In: data/raw/cutoffs-upstream/diem_chuan_2024_full.csv
Out: data/out/htnam2024/cutoffs_2024_htnam.csv
Source caveats: group majors are mislabeled in bulk -> dropped; major codes carry
home-made _1/_2 suffixes -> split into ma_nganh_base; scores use 2 scales
(30 / 40) -> kept in the diem_thang column.
"""
import argparse, csv, re
from pathlib import Path

TO_HOP_RE = re.compile(r"^[ABCDTVHN][0-9]{2}[A-Z]?$")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--inp", default="data/raw/cutoffs-upstream/diem_chuan_2024_full.csv")
    ap.add_argument("--outdir", default="data/out/htnam2024")
    args = ap.parse_args()
    rows, skipped = [], {"no_manganh": 0, "no_tohop": 0, "bad_diem": 0}
    with open(args.inp, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            mcode = (r.get("Mã ngành") or "").strip()
            th = (r.get("Tổ hợp môn") or "").strip().upper()
            if not mcode: skipped["no_manganh"] += 1; continue
            if not TO_HOP_RE.match(th): skipped["no_tohop"] += 1; continue
            try: diem = float(str(r.get("Điểm chuẩn", "")).strip())
            except ValueError: skipped["bad_diem"] += 1; continue
            loai = (r.get("Loại điểm") or "").strip()
            rows.append({
                "ma_truong": (r.get("Mã trường") or "").strip(),
                "ma_nganh": re.sub(r"_\d+$", "", mcode),
                "ma_nganh_raw": mcode,
                "ten_nganh": (r.get("Tên ngành") or "").strip(),
                "to_hop": th, "diem": diem,
                "diem_thang": "40" if "40" in loai else "30",
                "phuong_thuc": "THPTQG", "nam": 2024,
                "ghi_chu": ((r.get("Ghi chú") or "") + (" | " + loai if loai else ""))[:200],
                "nguon": "htnam2024_full",
            })
    out = Path(args.outdir); out.mkdir(parents=True, exist_ok=True)
    with open(out / "cutoffs_2024_htnam.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    print(f"[save] {out}/cutoffs_2024_htnam.csv ({len(rows)} rows, skipped={skipped})")

if __name__ == "__main__":
    main()
