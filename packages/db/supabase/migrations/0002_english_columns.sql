-- Compass 0002: rename all Vietnamese columns/params to English identifiers.
-- Values (domain data) are untouched; only identifiers change. Data is preserved
-- by RENAME (no dump/reload). Applied on a fresh project holding only seed rows.

-- ============ SCHOOLS ============
alter table if exists schools rename column ma_truong to code;
alter table if exists schools rename column slug_en to slug;
alter table if exists schools rename column ten to name;
alter table if exists schools rename column tinh to province;
alter table if exists schools rename column mien to region;
alter table if exists schools rename column loai to kind;
alter index if exists idx_schools_tinh rename to idx_schools_province;

-- ============ MAJORS ============
alter table if exists majors rename column ma_truong to school_code;
alter table if exists majors rename column ma_nganh to major_code;
alter table if exists majors rename column ten_nganh to major_name;
alter table if exists majors rename column to_hop to combos;
alter table if exists majors rename column chi_tieu to quota;
alter table if exists majors rename column hoc_phi_nam to tuition_per_year;
alter table if exists majors rename column nam to year;
alter index if exists idx_majors_truong_nam rename to idx_majors_school_year;

-- ============ CUTOFFS ============
alter table if exists cutoffs rename column ma_truong to school_code;
alter table if exists cutoffs rename column ma_nganh to major_code;
alter table if exists cutoffs rename column ten_nganh to major_name;
alter table if exists cutoffs rename column to_hop to combo;
alter table if exists cutoffs rename column nam to year;
alter table if exists cutoffs rename column phuong_thuc to method;
alter table if exists cutoffs rename column diem to score;
alter table if exists cutoffs rename column diem_thang to scale;
alter table if exists cutoffs rename column ghi_chu to note;
alter table if exists cutoffs rename column nguon to source;
alter index if exists idx_cutoffs_tohop rename to idx_cutoffs_combo;

-- ============ EXAM_SCORES (rename propagates to partitions) ============
alter table if exists exam_scores rename column sbd to reg_no;
alter table if exists exam_scores rename column ky_thi to exam;
alter table if exists exam_scores rename column nam to year;
alter table if exists exam_scores rename column chuong_trinh to curriculum;
alter table if exists exam_scores rename column tinh to province_code;
alter table if exists exam_scores rename column toan to math;
alter table if exists exam_scores rename column ngu_van to literature;
alter table if exists exam_scores rename column ngoai_ngu to foreign_lang;
alter table if exists exam_scores rename column vat_li to physics;
alter table if exists exam_scores rename column hoa_hoc to chemistry;
alter table if exists exam_scores rename column sinh_hoc to biology;
alter table if exists exam_scores rename column lich_su to history;
alter table if exists exam_scores rename column dia_li to geography;
alter table if exists exam_scores rename column gdcd to civic_education;
alter table if exists exam_scores rename column ktpl to econ_law;
alter table if exists exam_scores rename column tin_hoc to informatics;
alter table if exists exam_scores rename column cong_nghe_cn to tech_industry;
alter table if exists exam_scores rename column cong_nghe_nn to tech_agri;
alter table if exists exam_scores rename column th_a00 to total_a00;
alter table if exists exam_scores rename column th_a01 to total_a01;
alter table if exists exam_scores rename column th_a02 to total_a02;
alter table if exists exam_scores rename column th_b00 to total_b00;
alter table if exists exam_scores rename column th_c00 to total_c00;
alter table if exists exam_scores rename column th_c01 to total_c01;
alter table if exists exam_scores rename column th_d01 to total_d01;
alter table if exists exam_scores rename column th_d07 to total_d07;
alter table if exists exam_scores rename column th_a0t to total_a0t;
alter table if exists exam_scores rename column th_k01 to total_k01;
alter index if exists idx_scores_tinh rename to idx_scores_province;

-- ============ SCORE_DISTRIBUTION ============
alter table if exists score_distribution rename column ky_thi to exam;
alter table if exists score_distribution rename column nam to year;
alter table if exists score_distribution rename column to_hop to combo;
alter table if exists score_distribution rename column tinh to province_code;
alter table if exists score_distribution rename column tinh_new to province_code_new;
alter table if exists score_distribution rename column chuong_trinh to curriculum;
alter table if exists score_distribution rename column diem to score;
alter table if exists score_distribution rename column cnt to count;

-- ============ REVIEWS ============
alter table if exists reviews rename column ma_truong to school_code;
alter index if exists idx_reviews_truong rename to idx_reviews_school;

-- ============ WISHLISTS (comment refresh: English keys) ============
comment on table wishlists is 'onboarding + suggestions (onboarding json: {score, combo, groups, region, budget, risk})';
