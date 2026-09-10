"""End-to-end seed test into a temp Postgres (COPY + sanity queries).
Usage: .venv/bin/python data-pipeline/scripts/test_seed_postgres.py
Env: PGHOST/ PGPORT(default 5433)/PGUSER/PG-password/PGDATABASE, or DSN via --dsn.
"""

import argparse, glob, subprocess, sys
import psycopg

SEED = "data"
MIGRATIONS = sorted(glob.glob("packages/db/supabase/migrations/*.sql"))

CHECKS = [
    ("schools", "SELECT count(*) FROM schools"),
    ("majors", "SELECT count(*) FROM majors"),
    ("cutoffs", "SELECT count(*) FROM cutoffs"),
    ("score_distribution", "SELECT count(*) FROM score_distribution"),
    (
        "cutoffs orphan",
        """SELECT count(*) FROM cutoffs c LEFT JOIN schools s
        ON s.code=c.school_code WHERE s.code IS NULL""",
    ),
    (
        "rank A00 2024 >=24 (nationwide)",
        """SELECT sum(count) FROM score_distribution
        WHERE exam='THPTQG' AND year=2024 AND combo='A00' AND province_code IS NULL AND score>=24""",
    ),
    (
        "total A00 2024 (nationwide)",
        """SELECT sum(count) FROM score_distribution
        WHERE exam='THPTQG' AND year=2024 AND combo='A00' AND province_code IS NULL""",
    ),
    (
        "cutoff BKA IT1 2024",
        """SELECT major_code, combo, score, method FROM cutoffs
        WHERE school_code='BKA' AND year=2024 AND method='THPTQG'
        ORDER BY score DESC LIMIT 3""",
    ),
]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument(
        "--dsn", default="postgresql://compass:compass@localhost:5433/compass"
    )
    args = ap.parse_args()
    mig = ""
    for path in MIGRATIONS:
        mig += open(path, encoding="utf-8").read() + "\n"
    # Stub auth.uid() to run the Supabase migration on plain Postgres
    mig = mig.replace(
        "alter table schools enable row level security;",
        "CREATE SCHEMA IF NOT EXISTS auth;\n"
        "CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql AS $$SELECT NULL::uuid$$;\n"
        "alter table schools enable row level security;",
    )
    with psycopg.connect(args.dsn, autocommit=True) as conn:
        with conn.cursor() as cur:
            cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
            cur.execute(mig)
            print("[migrate] ok")
            for table, cols, paths in [
                (
                    "schools",
                    "code,slug,name,province,region,kind,website,source_url",
                    [f"{SEED}/schools.csv"],
                ),
                (
                    "majors",
                    "school_code,major_code,major_name,year",
                    [f"{SEED}/majors.csv"],
                ),
                (
                    "cutoffs",
                    "school_code,major_code,major_name,combo,score,scale,method,year,note,source,source_url",
                    sorted(glob.glob(f"{SEED}/cutoffs_*.csv")),
                ),
                (
                    "score_distribution",
                    "exam,year,combo,province_code,province_code_new,curriculum,score,count",
                    sorted(glob.glob(f"{SEED}/score_distribution_*.csv")),
                ),
            ]:
                for path in paths:
                    with open(path, encoding="utf-8") as f:
                        header = f.readline().strip().split(",")
                    actual = ",".join(header)
                    assert set(actual.split(",")) == set(cols.split(",")), (
                        f"{path}: {actual} != {cols}"
                    )
                    with conn.cursor() as c2:
                        with open(path, encoding="utf-8") as f:
                            next(f)
                            with c2.copy(
                                f"COPY {table} ({actual}) FROM STDIN WITH CSV NULL AS ''"
                            ) as cp:
                                for line in f:
                                    cp.write(line)
                    print(f"[copy] {path} ok")
            for name, sql in CHECKS:
                with conn.cursor() as cur:
                    cur.execute(sql)
                    print(f"[check] {name}: {cur.fetchall()}")


if __name__ == "__main__":
    sys.exit(main())
