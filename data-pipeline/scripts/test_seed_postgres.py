"""End-to-end seed test into a temp Postgres (COPY + sanity queries).
Usage: .venv/bin/python data-pipeline/scripts/test_seed_postgres.py
Env: PGHOST/ PGPORT(default 5433)/PGUSER/PG-password/PGDATABASE, or DSN via --dsn.
"""
import argparse, glob, subprocess, sys
import psycopg

SEED = "data"
MIGRATION = "packages/db/supabase/migrations/0001_init.sql"

CHECKS = [
    ("schools", "SELECT count(*) FROM schools"),
    ("majors", "SELECT count(*) FROM majors"),
    ("cutoffs", "SELECT count(*) FROM cutoffs"),
    ("score_distribution", "SELECT count(*) FROM score_distribution"),
    ("cutoffs orphan", """SELECT count(*) FROM cutoffs c LEFT JOIN schools s
        ON s.ma_truong=c.ma_truong WHERE s.ma_truong IS NULL"""),
    ("rank A00 2024 >=24 (nationwide)",
     """SELECT sum(cnt) FROM score_distribution
        WHERE ky_thi='THPTQG' AND nam=2024 AND to_hop='A00' AND tinh IS NULL AND diem>=24"""),
    ("total A00 2024 (nationwide)",
     """SELECT sum(cnt) FROM score_distribution
        WHERE ky_thi='THPTQG' AND nam=2024 AND to_hop='A00' AND tinh IS NULL"""),
    ("cutoff BKA IT1 2024",
     """SELECT ma_nganh, to_hop, diem, phuong_thuc FROM cutoffs
        WHERE ma_truong='BKA' AND nam=2024 AND phuong_thuc='THPTQG'
        ORDER BY diem DESC LIMIT 3"""),
]

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dsn", default="postgresql://compass:compass@localhost:5433/compass")
    args = ap.parse_args()
    mig = open(MIGRATION, encoding="utf-8").read()
    # Stub auth.uid() to run the Supabase migration on plain Postgres
    mig = mig.replace("alter table schools enable row level security;",
        "CREATE SCHEMA IF NOT EXISTS auth;\n"
        "CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$;\n"
        "alter table schools enable row level security;")
    with psycopg.connect(args.dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
            cur.execute(mig)
            print("[migrate] ok")
            for table, cols, paths in [
                ("schools", "ma_truong,slug_en,ten,tinh,mien,loai,website,source_url",
                 [f"{SEED}/schools.csv"]),
                ("majors", "ma_truong,ma_nganh,ten_nganh,nam", [f"{SEED}/majors.csv"]),
                ("cutoffs", "ma_truong,ma_nganh,ten_nganh,to_hop,diem,diem_thang,phuong_thuc,nam,ghi_chu,nguon,source_url",
                 sorted(glob.glob(f"{SEED}/cutoffs_*.csv"))),
                ("score_distribution", "ky_thi,nam,to_hop,tinh,tinh_new,chuong_trinh,diem,cnt",
                 sorted(glob.glob(f"{SEED}/score_distribution_*.csv"))),
            ]:
                for path in paths:
                    # score_distribution uses the 'count' header (a SQL keyword) -> mapped to cnt
                    with open(path, encoding="utf-8") as f:
                        header = f.readline().strip().split(",")
                    colmap = {"count": "cnt"}
                    actual = ",".join(colmap.get(h, h) for h in header)
                    assert set(actual.split(",")) == set(cols.split(",")), f"{path}: {actual} != {cols}"
                    with conn.cursor() as c2:
                        with open(path, encoding="utf-8") as f:
                            next(f)
                            with c2.copy(f"COPY {table} ({actual}) FROM STDIN WITH CSV NULL AS ''") as cp:
                                for line in f: cp.write(line)
                    print(f"[copy] {path} ok")
            for name, sql in CHECKS:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    print(f"[check] {name}: {cur.fetchall()}")

if __name__ == "__main__":
    sys.exit(main())
