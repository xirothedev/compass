"""Clean + normalize -> data/seed/ ready to COPY into Postgres.
In:  out/daniele15/schools.csv, out/cutoffs_all.csv (run merge_cutoffs.py first),
      out/score_dist_*.csv, raw/vnn/*/*.json (province/website enrichment)
Out: data/seed/{schools,cutoffs,majors,score_distribution}.csv + _quarantine.csv + REPORT.md
Cutoff grain: (ma_truong, ma_nganh, to_hop, nam, phuong_thuc). Rows with bad range/keys -> quarantine.
"""
import argparse, csv, glob, json, re, unicodedata
from collections import Counter
from pathlib import Path

TO_HOP_RE = re.compile(r"^[A-Z]{1,3}[0-9]{2}[A-Z0-9]*$")
# Manual map of source-internal combo codes to the Ministry standard (extend while reviewing quarantine)
MANUAL_TOHOP = {}
RANGES = {"THPTQG": (0, 30), "THPTQG40": (0, 40), "TSA": (0, 100),
          "DGNL-HCM": (0, 1200), "DGNL-HN": (0, 150), "DGNL": (0, 1200),
          "HocBa": (0, 30), "XTKH": (0, 40), "DTRieng": (0, 1600)}

BAC = ["hà nội", "hải phòng", "quảng ninh", "bắc ninh", "bắc giang", "vĩnh phúc",
       "phú thọ", "thái nguyên", "lạng sơn", "cao bằng", "hà giang", "tuyên quang",
       "lào cai", "yên bái", "điện biên", "lai châu", "sơn la", "hòa bình",
       "hưng yên", "hải dương", "thái bình", "hà nam", "nam định", "ninh bình",
       "thanh hóa", "bắc kạn"]
NAM = ["hồ chí minh", "tp. hồ chí minh", "tp hcm", "tphcm", "sài gòn", "đồng nai", "bình dương",
       "tây ninh", "long an", "tiền giang", "bến tre", "trà vinh", "vĩnh long",
       "đồng tháp", "an giang", "kiên giang", "cần thơ", "hậu giang", "sóc trăng",
       "bạc liêu", "cà mau", "bình phước", "bà rịa"]

def mien_for(tinh: str) -> str:
    t = (tinh or "").lower()
    if any(k in t for k in BAC): return "Bac"
    if any(k in t for k in NAM): return "Nam"
    return "Trung" if any(k in t for k in TRUNG) else ""

TRUNG = ["nghệ an", "hà tĩnh", "quảng trị", "huế", "đà nẵng", "quảng ngãi",
    "gia lai", "khánh hòa", "đắk lắk", "lâm đồng", "quảng bình", "quảng nam",
    "bình định", "phú yên", "ninh thuận", "bình thuận", "kon tum", "đắk nông",
    "thừa thiên"]
# Special cases that cannot be inferred from the name (hospitals/central-level ones...)
# (CDD0408 is multi-campus: main campus in Da Nang.)
MANUAL_SCHOOL_PROV = {"CBM": "Hà Nội", "CDD0408": "Đà Nẵng", "CDT0209": "TP. Hồ Chí Minh",
    "CKC": "TP. Hồ Chí Minh", "DDU": "Hà Nội", "DNH": "Hà Nội", "DQH": "Hà Nội",
    "DYH": "Hà Nội", "HFH": "Hà Nội", "HGH": "Hà Nội", "HSU": "TP. Hồ Chí Minh",
    "HVD": "Hà Nội", "LBS": "Đồng Nai", "PCS": "Đồng Nai", "TCU": "Khánh Hòa",
    "TMU": "Hà Nội", "UFA": "Quảng Ngãi"}

PROVINCES = ["Hà Nội", "Cao Bằng", "Tuyên Quang", "Điện Biên", "Lai Châu", "Sơn La",
    "Lào Cai", "Thái Nguyên", "Lạng Sơn", "Quảng Ninh", "Bắc Ninh", "Phú Thọ",
    "Hải Phòng", "Hưng Yên", "Ninh Bình", "Thanh Hóa", "Nghệ An", "Hà Tĩnh",
    "Quảng Trị", "Huế", "Đà Nẵng", "Quảng Ngãi", "Gia Lai", "Khánh Hòa",
    "Đắk Lắk", "Lâm Đồng", "Đồng Nai", "TP. Hồ Chí Minh", "Tây Ninh", "Đồng Tháp",
    "Vĩnh Long", "An Giang", "Cần Thơ", "Cà Mau"]
PROV_ALIAS = {"tphcm": "TP. Hồ Chí Minh", "tp hcm": "TP. Hồ Chí Minh",
              "sài gòn": "TP. Hồ Chí Minh", "hà nội": "Hà Nội"}
# Old province names (still showing up in school names) — keep as-is when extracting
OLD_PROVINCES = ["Kiên Giang", "Bà Rịa - Vũng Tàu", "Bình Dương", "Long An",
    "Tiền Giang", "Bến Tre", "Hậu Giang", "Sóc Trăng", "Bạc Liêu", "Yên Bái",
    "Hà Giang", "Bắc Giang", "Bắc Kạn", "Hòa Bình", "Hải Dương", "Thái Bình",
    "Hà Nam", "Nam Định", "Quảng Bình", "Quảng Nam", "Bình Định", "Phú Yên",
    "Ninh Thuận", "Bình Thuận", "Kon Tum", "Đắk Nông", "Thừa Thiên - Huế",
    "Vĩnh Phúc", "Bình Phước"]

def extract_tinh(ten: str) -> str:
    t = f" {(ten or '').lower()} "
    for a, canon in PROV_ALIAS.items():
        if a in t: return canon
    for p in PROVINCES + OLD_PROVINCES:
        if p.lower() in t: return p
    return ""

def slug_en(name: str) -> str:
    n = unicodedata.normalize("NFD", name or "").encode("ascii", "ignore").decode()
    return re.sub(r"-+", "-", re.sub(r"[^a-zA-Z0-9]+", "-", n.lower()).strip("-"))[:120]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--base", default="data")
    args = ap.parse_args()
    base, seed = Path(args.base), Path(args.base) / "seed"
    seed.mkdir(parents=True, exist_ok=True)
    report = []
    need = [base / "out/daniele15/schools.csv", base / "out/cutoffs_all.csv"]
    missing_in = [str(p) for p in need if not p.exists()]
    if missing_in:
        raise SystemExit(f"[fail] missing intermediate inputs (data/raw+out were cleaned): {missing_in}\n"
                         "  -> re-run crawl/import/merge before building the seed.")

    # ---- 1) SCHOOLS: daniele15 + VNN enrichment + stubs for unknown codes ----
    schools = {}
    with open(base / "out/daniele15/schools.csv", encoding="utf-8") as f:
        for r in csv.DictReader(f):
            schools[r["ma_truong"]] = r
    enriched = 0
    for p in glob.glob(str(base / "raw/vnn/*/*.json")):
        try: m = (json.load(open(p, encoding="utf-8")).get("data") or {}).get("model") or {}
        except Exception: continue
        info = (m.get("universitySchool") or [{}])[0]
        code = info.get("code")
        if code in schools:
            if info.get("provinceName"): schools[code]["tinh"] = info["provinceName"]
            if info.get("website"): schools[code]["website"] = info["website"]
            enriched += 1
    report.append(f"schools base: {len(schools)}, enriched from VNN: {enriched}")

    cutoffs = list(csv.DictReader(open(base / "out/cutoffs_all.csv", encoding="utf-8")))
    # enrich stubs from raw VNN/ts247 (name + province + website by school code)
    rawinfo = {}
    for p in glob.glob(str(base / "raw/vnn/*/*.json")):
        try: m = (json.load(open(p, encoding="utf-8")).get("data") or {}).get("model") or {}
        except Exception: continue
        for s in m.get("universitySchool") or []:
            if s.get("code"): rawinfo[s["code"]] = (s.get("name", ""), s.get("provinceName", ""), s.get("website", ""))
    for p in glob.glob(str(base / "raw/ts247/*/*.json")):
        try: s = json.load(open(p, encoding="utf-8")).get("school") or {}
        except Exception: continue
        if s.get("code") and s["code"] not in rawinfo:
            rawinfo[s["code"]] = (s.get("name", ""), "", "")
    missing = sorted({c["ma_truong"] for c in cutoffs} - set(schools))
    for code in missing:
        ten, tinh, web = rawinfo.get(code, (code, "", ""))
        if not tinh: tinh = extract_tinh(ten)
        if not tinh: tinh = MANUAL_SCHOOL_PROV.get(code, "")
        schools[code] = {"ma_truong": code, "slug_en": slug_en(ten) or code.lower(),
                         "ten": ten, "tinh": tinh, "mien": mien_for(f"{ten} {tinh}"), "loai": "DaiHoc",
                         "website": web, "source_url": ""}
    bad = sorted(c for c, s in schools.items() if not s["tinh"] or not s["mien"])
    if bad:
        raise SystemExit(f"[fail] {len(bad)} schools missing tinh/mien, add them to MANUAL_SCHOOL_PROV: {bad}")
    report.append(f"school stubs added: {len(missing)}")
    nomien = sum(1 for s in schools.values() if not s.get("mien"))
    for s in schools.values():
        if not s.get("mien"): s["mien"] = mien_for(f"{s.get('ten','')} {s.get('tinh','')}")
    report.append(f"schools missing mien after inference: {sum(1 for s in schools.values() if not s.get('mien'))} (before: {nomien})")

    # ten_nganh for daniele15 rows (raw has major_name, derived lost it)
    name_map, ucode2a = {}, {}
    try:
        with open(base / "raw/daniele15/university.csv", encoding="utf-8-sig") as f:
            for r in csv.DictReader(f):
                if r.get("university_code") and r.get("admission_code") and r["university_code"] not in ucode2a:
                    ucode2a[r["university_code"]] = r["admission_code"].strip()
        for y in range(2018, 2024):
            p = base / f"raw/daniele15/diemchuan{y}_full.csv"
            if not p.exists(): continue
            with open(p, encoding="utf-8-sig") as f:
                for r in csv.DictReader(f):
                    a = ucode2a.get((r.get("university_code") or "").strip(), "")
                    m = re.sub(r"_\d+$", "", (r.get("major_code") or "").strip()).upper()
                    n = (r.get("major_name") or "").strip()
                    if a and m and m != "X" and n: name_map.setdefault((a, m), Counter())[n] += 1
        name_map = {k: v.most_common(1)[0][0] for k, v in name_map.items()}
    except FileNotFoundError:
        pass
    report.append(f"ten_nganh resolved from raw daniele15: {len(name_map)} (truong,nganh) pairs")

    seen_slug, for_rename = set(), 0
    for s in schools.values():
        if not s.get("slug_en"): s["slug_en"] = s["ma_truong"].lower()
        if s["slug_en"] in seen_slug:
            s["slug_en"] = f"{s['slug_en']}-{s['ma_truong'].lower()}"; for_rename += 1
        seen_slug.add(s["slug_en"])
    with open(seed / "schools.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","slug_en","ten","tinh","mien","loai","website","source_url"])
        w.writeheader(); w.writerows(schools.values())
    report.append(f"schools seed: {len(schools)} (slug collisions renamed: {for_rename})")

    # ---- 2) CUTOFFS: validate range + keys ----
    majors, clean, quar = {}, [], []
    QFIELDS = ["ma_truong","ma_nganh","ten_nganh","to_hop","diem","diem_thang",
               "phuong_thuc","nam","ghi_chu","nguon","reason"]
    def q(row, reason): quar.append({k: row.get(k, "") for k in QFIELDS[:-1]} | {"reason": reason})
    for c in cutoffs:
        try: diem = float(c["diem"])
        except (ValueError, TypeError): q(c, "diem_nan"); continue
        if not c["ma_truong"] or not c["ma_nganh"] or c["ma_nganh"] == "X" or not c["nam"]:
            q(c, "thieu_khoa" if c["ma_nganh"] != "X" else "ma_nganh_X"); continue
        th = MANUAL_TOHOP.get(c["to_hop"], c["to_hop"])
        if th and not TO_HOP_RE.match(th): q(c, f"to_hop_la:{c['to_hop']}"); continue
        c = {**c, "to_hop": th}
        note = (c.get("ghi_chu") or "").lower()
        note1200 = "1200" in note or "quy đổi" in note or "quy doi" in note
        if c.get("diem_thang") != "40" and c["phuong_thuc"] == "THPTQG" and 30 < diem <= 40:
            c["diem_thang"] = "40"
            c["ghi_chu"] = (c.get("ghi_chu", "") + " | thang 40 (suy ra)").strip(" |")[:200]
        scale = "THPTQG40" if c.get("diem_thang") == "40" else c["phuong_thuc"]
        lo, hi = RANGES.get(scale, (None, None)) if not note1200 else (0, 1200)
        if lo is not None and not (lo < diem <= hi):
            q(c, f"diem_ngoai_range:{diem}"); continue
        if not c.get("ten_nganh"):
            c["ten_nganh"] = name_map.get((c["ma_truong"], c["ma_nganh"]), "")
        majors[(c["ma_truong"], c["ma_nganh"], c["nam"])] = {
            "ma_truong": c["ma_truong"], "ma_nganh": c["ma_nganh"],
            "ten_nganh": c.get("ten_nganh", ""), "nam": c["nam"]}
        clean.append({k: c.get(k, "") for k in
            ["ma_truong","ma_nganh","ten_nganh","to_hop","diem","diem_thang",
             "phuong_thuc","nam","ghi_chu","nguon","source_url"]})
    with open(seed / "cutoffs.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","ma_nganh","ten_nganh","to_hop","diem",
            "diem_thang","phuong_thuc","nam","ghi_chu","nguon","source_url"])
        w.writeheader(); w.writerows(clean)
    with open(seed / "majors.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","ma_nganh","ten_nganh","nam"])
        w.writeheader(); w.writerows(majors.values())
    with open(seed / "_quarantine.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ma_truong","ma_nganh","ten_nganh","to_hop","diem",
            "diem_thang","phuong_thuc","nam","ghi_chu","nguon","reason"])
        w.writeheader(); w.writerows(quar)
    # Bucket quarantine reasons by category so REPORT.md stays readable:
    # raw to_hop values can contain non-ASCII text, so they are counted, not dumped.
    qcat = Counter()
    for r in quar:
        reason = r["reason"]
        if reason.startswith("diem_ngoai_range:"): qcat["out-of-range scores (diem_ngoai_range:*)"] += 1
        elif reason.startswith("to_hop_la:"): qcat["unrecognized subject combos (to_hop_la:*)"] += 1
        else: qcat[reason] += 1
    report.append(f"cutoffs seed: {len(clean)} (quarantined: {len(quar)})")
    for label in ["out-of-range scores (diem_ngoai_range:*)",
                  "unrecognized subject combos (to_hop_la:*)",
                  "ma_nganh_X", "thieu_khoa", "diem_nan"]:
        if qcat.get(label): report.append(f"quarantine {label}: {qcat.pop(label)}")
    for label in sorted(qcat): report.append(f"quarantine {label}: {qcat[label]}")
    report.append(f"majors seed: {len(majors)}")

    # ---- 3) SCORE_DISTRIBUTION: concat years + tinh_new (year-aware) ----
    from province_data import PROVINCE_MAP
    pmap = {k: v[0] for k, v in PROVINCE_MAP.items()}
    newcodes = {v[0] for v in PROVINCE_MAP.values()}
    dist, unmapped = [], Counter()
    for p in sorted(glob.glob(str(base / "out/score_dist_*.csv"))):
        for r in csv.DictReader(open(p, encoding="utf-8")):
            # 2026 uses new province codes (post-merger): prefer identity, fallback old map.
            # 2023-2025 exams predate the merger: prefer the old So map.
            t = (r.get("tinh") or "")
            y = str(r.get("nam", ""))
            if y == "2026":
                hit = (t if t in newcodes else "") or pmap.get(t, "")
            else:
                hit = pmap.get(t, "") or (t if t in newcodes else "")
            r["tinh_new"] = hit
            if t and not hit: unmapped[f"{y}:{t}"] += int(r["count"])
            dist.append(r)
    with open(seed / "score_distribution.csv", "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=["ky_thi","nam","to_hop","tinh","tinh_new","chuong_trinh","diem","count"])
        w.writeheader(); w.writerows(dist)
    report.append(f"score_distribution seed: {len(dist)} rows")
    report.append(f"tinh_new: mapped {len(pmap)} old codes; unmapped: {dict(unmapped)}")

    (seed / "REPORT.md").write_text("# Seed report\n\n" + "\n".join(f"- {l}" for l in report) + "\n")
    print("\n".join(report))

if __name__ == "__main__":
    main()
