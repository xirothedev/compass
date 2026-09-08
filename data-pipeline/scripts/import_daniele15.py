"""Import daniele15/DV-Final-Crawler -> Compass schema.
In: university.csv + diemchuan{2018..2023}_full.csv (raw download from GitHub)
Out: data/schools.csv, majors.csv, cutoffs.csv + seed SQL
Mapping:
  schools.ma_truong = admission_code (Ministry code, e.g. BKA)
  diemchuan.university_code -> admission_code via university.csv
  phuong_thuc from note; to_hop filtered from subject_group
"""
import argparse, csv, re, unicodedata
from collections import defaultdict
from pathlib import Path
from urllib.request import urlretrieve

BASE = "https://raw.githubusercontent.com/daniele15/DV-Final-Crawler/main/Crawler-hocmai/data"
UNI_URL = f"{BASE}/university/university.csv"

TO_HOP_RE = re.compile(r"^[ABCDTVHN][0-9]{2}[A-Z]?$")
SKIP_TOKENS = {"XDHB", "DGNLHCM", "DGNLQGHN", "DGTD", "TSA", "HSA"}

def slug_en(name: str) -> str:
    n = unicodedata.normalize("NFD", name).encode("ascii", "ignore").decode()
    n = re.sub(r"[^a-zA-Z0-9]+", "-", n.lower()).strip("-")
    return re.sub(r"-+", "-", n)[:120]

def map_region(region: str) -> str:
    r = (region or "").lower()
    if "nam" in r: return "Nam"
    if "trung" in r: return "Trung"
    return "Bac"

def map_phuong_thuc(note: str, subject_group: str) -> str:
    n = (note or "") + " " + (subject_group or "")
    nl = n.lower()
    sg = (subject_group or "").upper()
    if "dgnlhcm" in nl or "dgnalhcm" in nl: return "DGNL-HCM"
    if "dghn" in nl or "qghn" in nl or "dgnlqghn" in nl: return "DGNL-HN"
    if "dgtd" in nl or "đgtd" in nl: return "TSA"
    if re.search(r"\bdgnl", nl): return "DGNL"
    if "xdhb" in nl or "học bạ" in nl or "hoc ba" in nl: return "HocBa"
    if "kết hợp" in nl or "ket hop" in nl: return "XTKH"
    if "dg nl" in nl or "năng lực" in nl: return "DGNL"
    return "THPTQG"

def parse_to_hop(subject_group: str) -> list:
    out = []
    for tok in (subject_group or "").split(","):
        t = tok.strip().upper()
        if t in SKIP_TOKENS: continue
        if TO_HOP_RE.match(t): out.append(t)
    return sorted(set(out))

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default="2018,2019,2020,2021,2022,2023")
    ap.add_argument("--workdir", default="data/daniele15")
    ap.add_argument("--outdir", default="data/out")
    args = ap.parse_args()
    work, out = Path(args.workdir), Path(args.outdir)
    work.mkdir(parents=True, exist_ok=True); out.mkdir(parents=True, exist_ok=True)

    # 1) university.csv
    uni_path = work / "university.csv"
    if not uni_path.exists():
        print(f"[dl] {UNI_URL}"); urlretrieve(UNI_URL, uni_path)
    # admission_code -> school; university_code -> admission_code (first wins, warn dup)
    schools, ucode2acode, dup = {}, {}, defaultdict(list)
    with open(uni_path, encoding="utf-8-sig") as f:
        for row in csv.DictReader(f):
            acode = (row.get("admission_code") or "").strip()
            ucode = (row.get("university_code") or "").strip()
            if not acode: continue
            dup[ucode].append(acode)
            if acode not in schools:
                schools[acode] = {
                    "ma_truong": acode, "slug_en": slug_en(row.get("university_name","") or acode),
                    "ten": (row.get("university_name") or "").strip(),
                    "tinh": (row.get("province") or "").strip(),
                    "mien": map_region(row.get("region","")),
                    "loai": "CaoDang" if "cao đẳng" in (row.get("university_name","").lower()) else "DaiHoc",
                    "website": "", "source_url": (row.get("url") or "").strip(),
                }
            if ucode and ucode not in ucode2acode:
                ucode2acode[ucode] = acode
    for u, acs in dup.items():
        if len(set(acs)) > 1:
            print(f"[warn] university_code {u} -> multiple admission_code {sorted(set(acs))}, using {ucode2acode[u]}")
    print(f"[schools] {len(schools)} schools (key=admission_code)")

    # 2) per-year diemchuan
    majors, cutoffs, skipped = {}, [], 0
    for y in [int(x) for x in args.years.split(",") if x.strip()]:
        p = work / f"diemchuan{y}_full.csv"
        if not p.exists():
            url = f"{BASE}/full/diemchuan{y}_full.csv"
            print(f"[dl] {url}"); urlretrieve(url, p)
        n = 0
        with open(p, encoding="utf-8-sig") as f:
            for row in csv.DictReader(f):
                ucode = (row.get("university_code") or "").strip()
                acode = ucode2acode.get(ucode)
                if not acode: skipped += 1; continue
                try: diem = float(str(row.get("point","")).strip())
                except ValueError: skipped += 1; continue
                sg = row.get("subject_group","") or ""
                pt = map_phuong_thuc(row.get("note",""), sg)
                th = parse_to_hop(sg)
                mcode = (row.get("major_code") or "").strip()
                mname = (row.get("major_name") or "").strip()
                if not mcode: skipped += 1; continue
                majors[(acode, mcode, y)] = {
                    "ma_truong": acode, "ma_nganh": mcode, "ten_nganh": mname,
                    "to_hop": "{" + ",".join(th) + "}", "nam": y,
                }
                cutoffs.append({"ma_truong": acode, "ma_nganh": mcode, "nam": y,
                                "phuong_thuc": pt, "diem": diem,
                                "note": (row.get("note") or "").strip()[:200]})
                n += 1
        print(f"[{y}] {n:,} rows ok")
    print(f"[majors] {len(majors):,} | [cutoffs] {len(cutoffs):,} | skipped {skipped:,}")

    # 3) Write out CSVs
    with open(out/"schools.csv","w",newline="",encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","slug_en","ten","tinh","mien","loai","website","source_url"])
        w.writeheader(); w.writerows(schools.values())
    with open(out/"majors.csv","w",newline="",encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","ma_nganh","ten_nganh","to_hop","nam"])
        w.writeheader(); w.writerows(majors.values())
    with open(out/"cutoffs.csv","w",newline="",encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","ma_nganh","nam","phuong_thuc","diem","note"])
        w.writeheader(); w.writerows(cutoffs)
    print(f"[save] {out}/schools.csv, majors.csv, cutoffs.csv")

if __name__ == "__main__":
    main()
