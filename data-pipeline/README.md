# Data pipeline (Python, outside pnpm/turbo)

Crawls + normalizes datasets for the lookup/catalog contexts. Run from the repo root.

## Data (`data/`, flat — only final seed files, split by year)

- `schools.csv` (334, not split by year), `majors.csv` (35k)
- `cutoffs_2018.csv` … `cutoffs_2026.csv` (265k total)
- `score_distribution_2023/2024/2025.csv` (382k total) — ready to `COPY` into Postgres
- `_quarantine.csv` + `REPORT.md` — rejected rows with reasons + build report

## Scripts (`data-pipeline/scripts/`)

Rebuild `data/` from web sources (writes intermediate `data/raw/`, `data/out/`, deleted after seeding):

- `crawl_vietnamnet_diemchuan.py` / `crawl_ts247_diemchuan.py` — crawl cutoff scores
- `import_daniele15.py` / `import_htnam2024.py` — normalize GitHub datasets
- `prep_diemthi_2026.py` / `build_score_distribution.py` — bulk scores → distribution
- `merge_cutoffs.py` → `build_seed.py` → `test_seed_postgres.py` — merge, clean, test COPY
- `province_data.py` — map old department codes → new provinces (hardcoded instead of a CSV ref)
