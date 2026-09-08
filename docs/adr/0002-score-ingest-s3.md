# Full exam-score ingest into DB + S3 archival + precomputed distribution table

Bulk ~1M rows/year x 10 years (~10M rows) still queries fine on Postgres if partitioned by (ky_thi, nam), keeping only the 2-3 hot years in the DB and archiving the original CSV/XLSX files to S3 (lifecycle to cold storage). Ranks are served from the aggregate distribution table ((diem, to_hop) → count) for p95 < 200ms; raw bulk data is only used for recomputation and audits. Rejected: storing only the distribution (loses province/SBD drill-down) and ingesting everything without archiving (costly, slow).

## Consequences

The `exam_scores` table is partitioned by year; `score_distribution` is the primary read model for the rank API.
