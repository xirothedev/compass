"""HTNam 2024 (_full) adapter -> Compass schema.
In: data/raw/cutoffs-upstream/diem_chuan_2024_full.csv
Out: data/out/htnam2024/cutoffs_2024_htnam.csv
Source caveats: group majors are mislabeled in bulk -> dropped; major codes carry
home-made _1/_2 suffixes -> split into ma_nganh_base; scores use 2 scales
(30 / 40) -> kept in the scale column.
"""
import argparse, csv, re
from pathlib import Path

COMBO_RE = re.compile(r"^[ABCDTVHN][0-9]{2}[A-Z]?$")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--inp", default="data/raw/cutoffs-upstream/diem_chuan_2024_full.csv")
    ap.add_argument("--outdir", default="data/out/htnam2024")
    args = ap.parse_args()
    rows, skipped = [], {"no_major_code": 0, "no_combo": 0, "bad_score": 0}
    with open(args.inp, encoding="utf-8-sig") as f:
        for r in csv.DictReader(f):
            mcode = (r.get("Mã ngành") or "").strip()
            combo = (r.get("Tổ hợp môn") or "").strip().upper()
            if not mcode: skipped["no_major_code"] += 1; continue
            if not COMBO_RE.match(combo): skipped["no_combo"] += 1; continue
            try: score = float(str(r.get("Điểm chuẩn", "")).strip())
            except ValueError: skipped["bad_score"] += 1; continue
            score_type = (r.get("Loại điểm") or "").strip()
            rows.append({
                "school_code": (r.get("Mã trường") or "").strip(),
                "major_code": re.sub(r"_\d+$", "", mcode),
                "major_code_raw": mcode,
                "major_name": (r.get("Tên ngành") or "").strip(),
                "combo": combo, "score": score,
                "scale": "40" if "40" in score_type else "30",
                "method": "THPTQG", "year": 2024,
                "note": ((r.get("Ghi chú") or "") + (" | " + score_type if score_type else ""))[:200],
                "source": "htnam2024_full",
            })
    out = Path(args.outdir); out.mkdir(parents=True, exist_ok=True)
    with open(out / "cutoffs_2024_htnam.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    print(f"[save] {out}/cutoffs_2024_htnam.csv ({len(rows)} rows, skipped={skipped})")

if __name__ == "__main__":
    main()
