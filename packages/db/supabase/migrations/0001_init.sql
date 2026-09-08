-- Compass v1 init: schools, majors, cutoffs, scores, reviews, wishlists
-- Stack: Postgres (Supabase). 2023-2025 hot in DB, <2023 archived to S3.

-- ============ SCHOOLS ============
create table if not exists schools (
  ma_truong text primary key,          -- Ministry code: BKA, KHA...
  slug_en text unique not null,        -- English slug: hanoi-university-of-science-and-technology
  ten text not null,
  tinh text not null,                  -- province/city
  mien text not null default 'Bac',    -- Bac/Trung/Nam
  loai text not null default 'DaiHoc', -- DaiHoc/CaoDang/HocVien
  website text,
  source_url text,                     -- proposal link / crawl source
  created_at timestamptz default now()
);
create index if not exists idx_schools_tinh on schools(tinh);
create index if not exists idx_schools_slug on schools(slug_en);

-- ============ MAJORS (majors by year) ============
create table if not exists majors (
  id bigserial primary key,
  ma_truong text not null references schools(ma_truong) on delete cascade,
  ma_nganh text not null,              -- Ministry major code: 7480201
  ten_nganh text not null,
  to_hop text[] not null default '{}', -- {A00,D01}
  chi_tieu int,
  hoc_phi_nam int,                     -- VND/year, null if unknown
  nam int not null,                    -- admission year
  source_url text,
  unique (ma_truong, ma_nganh, nam)
);
create index if not exists idx_majors_truong_nam on majors(ma_truong, nam);

-- ============ CUTOFFS ============
create table if not exists cutoffs (
  id bigserial primary key,
  ma_truong text not null references schools(ma_truong) on delete cascade,
  ma_nganh text not null,
  ten_nganh text not null default '',
  to_hop text,                          -- single combo: A00 (null = any/unknown combo)
  nam int not null,
  phuong_thuc text not null default 'THPTQG', -- THPTQG/DGNL-HCM/DGNL-HN/TSA/HocBa/XTKH/DTRieng/CCQT/XTT
  diem numeric(7,2) not null,
  diem_thang text,                      -- 30/40 (null = method default scale)
  ghi_chu text,
  nguon text,                           -- daniele15/htnam/vnn/ts247 (crawl source trace)
  source_url text,
  unique (ma_truong, ma_nganh, to_hop, nam, phuong_thuc, diem)
);
create index if not exists idx_cutoffs_lookup on cutoffs(nam, phuong_thuc, diem);
create index if not exists idx_cutoffs_tohop on cutoffs(nam, to_hop, diem);

-- ============ EXAM_SCORES (bulk SBD+scores, NO PII) ============
-- Partitioned by year for easy drop/archive to S3. Only 2023+ kept hot.
create table if not exists exam_scores (
  sbd char(8) not null,
  ky_thi text not null default 'THPTQG',
  nam int not null,
  chuong_trinh text,                   -- CT2018/CT2006 (2025+)
  tinh text not null,                  -- 2-digit province code
  toan numeric(4,2), ngu_van numeric(4,2), ngoai_ngu numeric(4,2),
  vat_li numeric(4,2), hoa_hoc numeric(4,2), sinh_hoc numeric(4,2),
  lich_su numeric(4,2), dia_li numeric(4,2), gdcd numeric(4,2),
  ktpl numeric(4,2), tin_hoc numeric(4,2),
  cong_nghe_cn numeric(4,2), cong_nghe_nn numeric(4,2),
  th_a00 numeric(5,2), th_a01 numeric(5,2), th_a02 numeric(5,2),
  th_b00 numeric(5,2), th_c00 numeric(5,2), th_c01 numeric(5,2),
  th_d01 numeric(5,2), th_d07 numeric(5,2),
  th_a0t numeric(5,2), th_k01 numeric(5,2),
  primary key (ky_thi, nam, sbd)
) partition by list (nam);

create table if not exists exam_scores_2017 partition of exam_scores for values in (2017);
create table if not exists exam_scores_2018 partition of exam_scores for values in (2018);
create table if not exists exam_scores_2019 partition of exam_scores for values in (2019);
create table if not exists exam_scores_2020 partition of exam_scores for values in (2020);
create table if not exists exam_scores_2021 partition of exam_scores for values in (2021);
create table if not exists exam_scores_2022 partition of exam_scores for values in (2022);

create table if not exists exam_scores_2023 partition of exam_scores for values in (2023);
create table if not exists exam_scores_2024 partition of exam_scores for values in (2024);
create table if not exists exam_scores_2025 partition of exam_scores for values in (2025);
create table if not exists exam_scores_2026 partition of exam_scores for values in (2026);
create index if not exists idx_scores_tinh on exam_scores(tinh);

-- ============ SCORE_DISTRIBUTION (primary read model for the rank API) ============
create table if not exists score_distribution (
  id bigserial primary key,
  ky_thi text not null,
  nam int not null,
  to_hop text not null,                -- A00, D01...
  tinh text,                           -- old So code, null = nationwide
  tinh_new text,                       -- new 34-province code (null = nationwide/unmapped)
  chuong_trinh text,                   -- CT2018/CT2006 (2025 has 2 programs, null = pre-2025)
  diem numeric(5,2) not null,
  cnt int not null,
  unique (ky_thi, nam, chuong_trinh, to_hop, tinh, diem)
);
-- Note: Postgres treats NULL as distinct in UNIQUE, so nationwide rows
-- (tinh null) are not deduped by the DB — the pipeline dedupes before COPY; the DB only catches dupes with tinh set.

-- ============ REVIEWS ============
create table if not exists reviews (
  id bigserial primary key,
  ma_truong text not null references schools(ma_truong) on delete cascade,
  user_id uuid,                        -- null if seeded
  criteria jsonb not null default '{}', -- {csvc:5, giang_vien:4, ...}
  comment text,
  seeded boolean not null default false,
  status text not null default 'published', -- published/hidden/flagged
  created_at timestamptz default now()
);
create index if not exists idx_reviews_truong on reviews(ma_truong, status);

-- ============ WISHLISTS (onboarding + suggestions) ============
create table if not exists wishlists (
  id bigserial primary key,
  user_id uuid,
  onboarding jsonb not null,           -- {diem, to_hop, nhom_nganh, mien, ngan_sach, rui_ro}
  suggestions jsonb not null default '[]', -- [{ma_truong, ma_nganh, nhom: chac/vua/mo}]
  created_at timestamptz default now()
);

-- ============ RLS (Supabase) ============
alter table schools enable row level security;
alter table majors enable row level security;
alter table cutoffs enable row level security;
alter table score_distribution enable row level security;
alter table reviews enable row level security;
alter table wishlists enable row level security;

-- Public read for lookups
drop policy if exists "public read schools" on schools;
create policy "public read schools" on schools for select using (true);
drop policy if exists "public read majors" on majors;
create policy "public read majors" on majors for select using (true);
drop policy if exists "public read cutoffs" on cutoffs;
create policy "public read cutoffs" on cutoffs for select using (true);
drop policy if exists "public read dist" on score_distribution;
create policy "public read dist" on score_distribution for select using (true);
drop policy if exists "public read reviews" on reviews;
create policy "public read reviews" on reviews for select using (status = 'published');

-- Review: authenticated insert, owner update
drop policy if exists "auth insert reviews" on reviews;
create policy "auth insert reviews" on reviews for insert with check (auth.uid() = user_id);
