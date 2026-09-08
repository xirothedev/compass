"""Crawl VietnamNet cutoff scores -> raw JSON + versioned CSV.
Source: server-rendered list + newsapi-edu/UniversityDetail/GetDetail API (reversed).
Out: data/raw/vnn/{year}/{MA}.json + data/out/cutoffs_vnn_{year}.csv
Each row records source_url + crawled_at for traceability. Respect the 1 req/s rate limit.
"""
import argparse, csv, html as ihtml, json, re, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

UA = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "vi,en;q=0.9",
    "Referer": "https://vietnamnet.vn/",
}
PAGE_ID = "49ff289efde0446f9ae2f5c385595744"
COMP_ID = "COMPONENT002302"
API = "https://vietnamnet.vn/newsapi-edu/UniversityDetail/GetDetail"

def get(url: str, timeout=30) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")

def parse_school_list(page_html: str):
    """(ten, ma_truong, tinh, slug_url) from the server-rendered table."""
    rows = []
    for m in re.finditer(
        r'<a[^>]+href="(/giao-duc/diem-thi/tra-cuu-diem-chuan-cd-dh-\d+/truong/[^"]+)\?keyword=([A-Z0-9]+)"[^>]*>(.*?)</a>\s*</td>\s*<td[^>]*>\s*([A-Z0-9]+)\s*</td>\s*<td[^>]*>(.*?)</td>',
        page_html, re.S):
        url, kw, name_html, code, prov = m.groups()
        name = re.sub(r"\s*\(Xem\)\s*$", "", re.sub(r"<[^>]+>", "", name_html)).strip()
        rows.append({"ten": ihtml.unescape(name), "ma_truong": code,
                     "tinh": ihtml.unescape(re.sub(r"<[^>]+>", "", prov)).strip(),
                     "url": "https://vietnamnet.vn" + url + f"?keyword={kw}"})
    return rows

def map_phuong_thuc(note: str, sg: str) -> str:
    n = f"{note} {sg}".lower()
    if "xttn" in n or "tư duy" in n or "tu duy" in n or re.search(r"\btsa\b", n): return "TSA"
    if "dgnlhcm" in n or ("năng lực" in n and "hcm" in n): return "DGNL-HCM"
    if "dgnlqghn" in n or "đgnl" in n or ("năng lực" in n and ("hn" in n or "hà nội" in n)): return "DGNL-HN"
    if "năng lực" in n: return "DGNL"
    if "học bạ" in n or "hoc ba" in n or "xdhb" in n: return "HocBa"
    if "riêng" in n or "rieng" in n or "v-sat" in n or "v-act" in n or "vsat" in n: return "DTRieng"
    if "kết hợp" in n: return "XTKH"
    return "THPTQG"

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--years", default="2024,2025,2026")
    ap.add_argument("--rawdir", default="data/raw/vnn")
    ap.add_argument("--outdir", default="data/out")
    ap.add_argument("--delay", type=float, default=1.0)
    ap.add_argument("--limit", type=int, default=0, help="Limit number of schools (0 = all)")
    ap.add_argument("--codes", default="",
                    help="CSV with a ma_truong column: merged with the crawled list (fills in schools missing from the list)")
    ap.add_argument("--page-size", type=int, default=100)
    args = ap.parse_args()
    raw, out = Path(args.rawdir), Path(args.outdir)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds")

    for year in [y.strip() for y in args.years.split(",") if y.strip()]:
        # 1) school list (server HTML + pagination)
        schools = {}
        page = 0
        while True:
            url = (f"https://vietnamnet.vn/giao-duc/diem-thi/tra-cuu-diem-chuan-cd-dh-{year}"
                   if page == 0 else
                   f"https://vietnamnet.vn/giao-duc/diem-thi/tra-cuu-diem-chuan-cd-dh-page{page}")
            html = get(url)
            found = parse_school_list(html)
            if not found: break
            for s in found: schools[s["ma_truong"]] = s
            page += 1
            if page > 30: break
            time.sleep(args.delay)
        print(f"[{year}] school list: {len(schools)} schools")
        if args.codes:
            import csv as _csv
            with open(args.codes, encoding="utf-8-sig") as f:
                extra = [r["ma_truong"].strip() for r in _csv.DictReader(f) if r.get("ma_truong")]
            added = 0
            for code in extra:
                if code and code not in schools:
                    schools[code] = {"ten": "", "ma_truong": code, "tinh": "",
                        "url": f"https://vietnamnet.vn/giao-duc/diem-thi/tra-cuu-diem-chuan-cd-dh-{year}?keyword={code}"}
                    added += 1
            print(f"[{year}] +{added} codes from --codes (total {len(schools)})")
        items = list(schools.values())
        if args.limit: items = items[:args.limit]

        # 2) per-school details via API
        rows, empty = [], []
        for i, s in enumerate(items):
            code = s["ma_truong"]
            rp = raw / year / f"{code}.json"
            if rp.exists():
                data = json.loads(rp.read_text(encoding="utf-8"))
            else:
                q = (f"?pageId={PAGE_ID}&componentId={COMP_ID}&keyword={code}&year={year}"
                     f"&pageSize={args.page_size}&pageIndex=0&typeOfTraining=0&subjectGroup=")
                try:
                    data = json.loads(get(API + q))
                except Exception as e:
                    print(f"  [err] {code}: {e}"); time.sleep(args.delay); continue
                rp.parent.mkdir(parents=True, exist_ok=True)
                rp.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
                time.sleep(args.delay)
            model = (data.get("data") or {}).get("model") or {}
            info = (model.get("universitySchool") or [{}])[0]
            if not (model.get("schoolScores") or []):
                empty.append(code)
            for sc in model.get("schoolScores") or []:
                try: diem = float(str(sc.get("score", "")).replace(",", "."))
                except ValueError: continue
                sg = (sc.get("subjectGroup") or "").strip().upper()
                rows.append({
                    "ma_truong": code, "ten_truong": info.get("name") or s["ten"],
                    "tinh": info.get("provinceName") or s["tinh"],
                    "ma_nganh": (sc.get("code") or "").strip(),
                    "ten_nganh": (sc.get("name") or "").strip(),
                    "to_hop": sg, "diem": diem,
                    "phuong_thuc": map_phuong_thuc(sc.get("note") or "", sg),
                    "nam": year, "ghi_chu": (sc.get("note") or "")[:200],
                    "source_url": s["url"], "crawled_at": now,
                })
            if (i+1) % 20 == 0: print(f"  ...{i+1}/{len(items)}")
        out.mkdir(parents=True, exist_ok=True)
        with open(out / f"cutoffs_vnn_{year}.csv", "w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=["ma_truong","ten_truong","tinh","ma_nganh",
                "ten_nganh","to_hop","diem","phuong_thuc","nam","ghi_chu","source_url","crawled_at"])
            w.writeheader(); w.writerows(rows)
        print(f"[{year}] -> {out}/cutoffs_vnn_{year}.csv ({len(rows)} rows, {len(empty)} codes with no data)")

if __name__ == "__main__":
    main()
