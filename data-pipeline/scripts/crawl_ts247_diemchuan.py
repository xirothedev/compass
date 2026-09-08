"""Crawl tuyensinh247 cutoff scores -> raw JSON + versioned CSV.
Source: internal Next.js API reversed from the JS bundle (chunk 5748):
  GET /api/school/search (+ ?level=cao-dang) -> school list {id, code, alias, name}
  GET /api/common/cutoff-score?school_id={id}&year={year} -> rows for all methods
    each row has admission_name/admission_alias/mark_type/code(name)/block/mark/introtext.
Out: data/raw/ts247/{year}/{MA}.json + data/out/cutoffs_ts247_{year}.csv
Each row records source_url + crawled_at for traceability. Respect the 1 req/s rate limit.
"""
import argparse, csv, json, re, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "vi,en;q=0.9",
    "Referer": "https://diemthi.tuyensinh247.com/diem-chuan.html",
}
BASE = "https://diemthi.tuyensinh247.com"
API_SEARCH = BASE + "/api/school/search"
API_CUTOFF = BASE + "/api/common/cutoff-score"

def get_json(url: str, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode("utf-8", "replace"))

def map_phuong_thuc(admission_name: str, mark_type) -> str:
    n = (admission_name or "").lower()
    try: mt = int(mark_type)
    except (TypeError, ValueError): mt = 0
    if mt == 6 or "tư duy" in n or "tu duy" in n or re.search(r"\btsa\b", n): return "TSA"
    if mt == 5 or "hsa" in n or ("năng lực" in n and ("hn" in n or "hà nội" in n or "ha noi" in n)): return "DGNL-HN"
    if mt == 2 or "v-act" in n or "vact" in n or ("năng lực" in n and "hcm" in n): return "DGNL-HCM"
    if "học bạ" in n or "hoc ba" in n: return "HocBa"
    if "v-sat" in n or "vsat" in n or "v-act" in n or "vact" in n or "đánh giá đầu vào" in n or "danh gia dau vao" in n: return "DTRieng"
    if "năng lực" in n or "dgnl" in n or "đgnl" in n: return "DGNL"
    if "kết hợp" in n or "ket hop" in n: return "XTKH"
    if "chứng chỉ" in n or "chung chi" in n: return "CCQT"
    if "tuyển thẳng" in n or "tuyen thang" in n or "ưtxt" in n or "utxt" in n: return "XTT"
    if "thi thpt" in n or "tốt nghiệp" in n or "tot nghiep" in n: return "THPTQG"
    return "THPTQG"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default="2024,2025,2026")
    ap.add_argument("--rawdir", default="data/raw/ts247")
    ap.add_argument("--outdir", default="data/out")
    ap.add_argument("--delay", type=float, default=1.0)
    ap.add_argument("--limit", type=int, default=0, help="Limit number of schools (0 = all)")
    ap.add_argument("--codes", default="",
                    help="CSV with a ma_truong column: only crawl these codes (skip codes missing from the API list)")
    args = ap.parse_args()
    raw, out = Path(args.rawdir), Path(args.outdir)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    # 1) school list (search API: universities + colleges, merged by id)
    schools = {}
    for url in (API_SEARCH, API_SEARCH + "?level=cao-dang"):
        data = get_json(url).get("data") or []
        for s in data:
            code = (s.get("code") or "").strip()
            if code: schools[s["id"]] = s
        time.sleep(args.delay)
    print(f"school list: {len(schools)} schools")
    items = sorted(schools.values(), key=lambda s: (s.get("code") or ""))
    if args.codes:
        import csv as _csv
        with open(args.codes, encoding="utf-8-sig") as f:
            want = {r["ma_truong"].strip() for r in _csv.DictReader(f) if r.get("ma_truong")}
        before = len(items)
        items = [s for s in items if s["code"] in want]
        missing = want - {s["code"] for s in items}
        print(f"--codes: keeping {len(items)}/{before} schools; missing from API: {sorted(missing) or 'none'}")
    if args.limit: items = items[:args.limit]

    for year in [y.strip() for y in args.years.split(",") if y.strip()]:
        rows, empty = [], []
        for i, s in enumerate(items):
            code = s["code"]
            rp = raw / year / f"{code}.json"
            if rp.exists():
                payload = json.loads(rp.read_text(encoding="utf-8"))
            else:
                q = f"?school_id={s['id']}&year={year}"
                try:
                    payload = get_json(API_CUTOFF + q)
                except Exception as e:
                    print(f"  [err] {code}: {e}"); time.sleep(args.delay); continue
                rp.parent.mkdir(parents=True, exist_ok=True)
                rp.write_text(json.dumps({"school": s, "response": payload}, ensure_ascii=False), encoding="utf-8")
                time.sleep(args.delay)
            data = (payload.get("response") or payload).get("data") or []
            if not data: empty.append(code)
            url = f"{BASE}/diem-chuan/{s.get('alias')}-{code}.html"
            for sc in data:
                try: diem = float(str(sc.get("mark", "")).replace(",", "."))
                except (ValueError, TypeError): continue
                adm = (sc.get("admission_name") or "").strip()
                intro = (sc.get("introtext") or "").strip()
                note = f"{adm} | {intro}" if intro else adm
                rows.append({
                    "ma_truong": code, "ten_truong": s.get("name") or "",
                    "tinh": "",
                    "ma_nganh": (sc.get("display_code") or sc.get("code") or "").strip(),
                    "ten_nganh": (sc.get("name") or "").strip(),
                    "to_hop": (sc.get("block") or "").strip().upper(),
                    "diem": diem,
                    "phuong_thuc": map_phuong_thuc(adm, sc.get("mark_type")),
                    "nam": year, "ghi_chu": note[:200],
                    "source_url": url, "crawled_at": now,
                })
            if (i+1) % 20 == 0: print(f"  ...{i+1}/{len(items)}")
        out.mkdir(parents=True, exist_ok=True)
        with open(out / f"cutoffs_ts247_{year}.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["ma_truong","ten_truong","tinh","ma_nganh",
                "ten_nganh","to_hop","diem","phuong_thuc","nam","ghi_chu","source_url","crawled_at"])
            w.writeheader(); w.writerows(rows)
        print(f"[{year}] -> {out}/cutoffs_ts247_{year}.csv ({len(rows)} rows, {len(empty)} codes with no data)")

if __name__ == "__main__":
    main()
