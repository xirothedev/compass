# Seed report

- schools base: 291, enriched from VNN: 356
- school stubs added: 43
- schools missing mien after inference: 0 (before: 0)
- ten_nganh resolved from raw daniele15: 6405 (truong,nganh) pairs
- schools seed: 334 (slug collisions renamed: 9)
- cutoffs seed: 265274 (quarantined: 16158)
- quarantine out-of-range scores (diem_ngoai_range:*): 11233
- quarantine unrecognized subject combos (to_hop_la:*): 4910
- quarantine ma_nganh_X: 4
- quarantine thieu_khoa: 11
- majors seed: 35774
- score_distribution seed: 382565 rows
- tinh_new: mapped 63 old codes; unmapped: {}

## Score distributions by year (bulk exam scores, sdgedfegw + anhdung98)
- 2017: 861,068 candidates -> score_distribution_2017.csv (181,957 rows)
- 2018: 921,520 -> 165,286 rows
- 2019: 882,594 -> 171,726 rows
- 2020: 870,517 -> 154,311 rows
- 2021: 987,704 -> 159,513 rows
- 2022: 995,441 -> 158,967 rows
- 2023: 1,022,060 -> 151,755 rows
- 2024: 1,061,605 -> 152,365 rows
- 2025: 1,153,226 (CT2018+CT2006) -> 78,445 rows
- 2026: 1,208,863 -> 58,155 rows (CT2018 combos only)
- tinh_new mapped for all provinces, all years (0 blank). Bulk raw deleted after build; qualifying note: precomputed Khoi columns used where available.
