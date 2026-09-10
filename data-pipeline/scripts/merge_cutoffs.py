"""Merge cutoffs from 4 sources -> canonical cutoffs_all.csv (union, keep source column, dedupe exact matches).
In (glob, a missing file skips that source):
  data/out/daniele15/cutoffs.csv            (2018-2023, combo joined from majors.csv)
  data/out/htnam2024/cutoffs_2024_htnam.csv (2024)
  data/out/cutoffs_vnn_{y}.csv              (2024-2026)
  data/out/cutoffs_ts247_{y}.csv            (2024-2026)
Out: data/out/cutoffs_all.csv
Priority on exact matches (school_code, major_code, combo, year, method): ts247 > vnn > htnam > daniele15.
"""
import argparse, csv, glob, re
from pathlib import Path

PRIORITY = {"ts247": 0, "vnn": 1, "htnam": 2, "daniele15": 3}

def norm_major_code(s: str) -> str:
    return re.sub(r"_\d+$", "", (s or "").strip().upper())

def load_daniele15(base: Path):
    rows = []
    combos = {}
    mp = base / "daniele15" / "majors.csv"
    if mp.exists():
        with open(mp, encoding="utf-8") as f:
            for r in csv.DictReader(f):
                combos[(r["school_code"], r["major_code"], r["year"])] = r.get("combo", "")
    cp = base / "daniele15" / "cutoffs.csv"
    if not cp.exists(): return rows
    with open(cp, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            base = {"school_code": r["school_code"], "major_code": norm_major_code(r["major_code"]),
                "major_name": "", "score": r["score"], "scale": "",
                "method": r["method"], "year": r["year"],
                "note": r.get("note", ""), "source": "daniele15", "source_url": ""}
            for combo in split_combos(combos.get((r["school_code"], r["major_code"], r["year"]), "")):
                rows.append({**base, "combo": combo})
    return rows

def load_htnam(base: Path):
    rows, p = [], base / "htnam2024" / "cutoffs_2024_htnam.csv"
    if not p.exists(): return rows
    with open(p, encoding="utf-8") as f:
        for r in csv.DictReader(f):
            rows.append({"school_code": r["school_code"], "major_code": norm_major_code(r["major_code"]),
                "major_name": r.get("major_name", ""), "combo": r.get("combo", ""),
                "score": r["score"], "scale": r.get("scale", ""),
                "method": r.get("method", "THPTQG"), "year": r.get("year", "2024"),
                "note": r.get("note", ""), "source": "htnam", "source_url": ""})
    return rows

def split_combos(s: str) -> list:
    s = (s or "").strip()
    if s.startswith("{") and s.endswith("}"):  # daniele15 set literal {A00,D01}
        s = s[1:-1]
    parts = [p.strip().upper() for p in re.split(r"[;,/|]", s) if p.strip()]
    return parts or [""]


def load_vnn_ts247(base: Path, prefix: str, source: str):
    rows = []
    for p in sorted(glob.glob(str(base / f"{prefix}_*.csv"))):
        with open(p, encoding="utf-8") as f:
            for r in csv.DictReader(f):
                for combo in split_combos(r.get("combo", "")):
                    rows.append({"school_code": r["school_code"], "major_code": norm_major_code(r.get("major_code", "")),
                        "major_name": r.get("major_name", ""), "combo": combo,
                        "score": r["score"], "scale": "", "method": r.get("method", ""),
                        "year": r.get("year", ""), "note": r.get("note", ""),
                        "source": source, "source_url": r.get("source_url", "")})
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
    # Normalize score to 2 decimals BEFORE dedupe: sources write 25.03 vs 25.0267 for
    # the same cutoff level (the DB numeric(7,2) would also round to 25.03 -> unique violation).
    for r in all_rows:
        try: r["score"] = f"{round(float(r['score']), 2):.2f}"
        except (ValueError, TypeError): pass
    best = {}
    for r in all_rows:
        k = (r["school_code"], r["major_code"], r["combo"], str(r["year"]), r["method"], str(r["score"]))
        if k not in best or PRIORITY[r["source"]] < PRIORITY[best[k]["source"]]:
            best[k] = r
    rows = sorted(best.values(), key=lambda r: (r["year"], r["school_code"], r["major_code"]))
    with open(base / "cutoffs_all.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["school_code","major_code","major_name","combo","score",
            "scale","method","year","note","source","source_url"])
        w.writeheader(); w.writerows(rows)
    from collections import Counter
    print(f"[save] {base}/cutoffs_all.csv ({len(rows)} rows, deduped from {len(all_rows)})")
    print("sources:", dict(Counter(r["source"] for r in rows)))
    print("years:", dict(sorted(Counter(str(r['year']) for r in rows).items())))

if __name__ == "__main__":
    main()
