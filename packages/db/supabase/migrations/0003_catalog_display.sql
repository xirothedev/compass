-- Compass 0003: curated display columns for the catalog + owner policies for wishlists.
-- Apply once in the Supabase dashboard (SQL editor) with a service-role session:
--   1) paste this file, run
--   2) re-seed schools (COPY data/schools.csv) so groups/tuition_display land
-- Until then the web app keeps its mock fallback (see apps/web/src/data.ts getSchools).

-- ============ SCHOOLS display columns (curated, nullable until backfilled) ============
alter table if exists schools add column if not exists groups text[] not null default '{}';
alter table if exists schools add column if not exists tuition_display text;
alter table if exists schools add column if not exists address text;
alter table if exists schools add column if not exists name_en text;

-- ============ WISHLISTS owner policies (needed by saveOrder) ============
drop policy if exists "owner read wishlists" on wishlists;
create policy "owner read wishlists" on wishlists for select using (auth.uid() = user_id);
drop policy if exists "owner insert wishlists" on wishlists;
create policy "owner insert wishlists" on wishlists for insert with check (auth.uid() = user_id);
drop policy if exists "owner update wishlists" on wishlists;
create policy "owner update wishlists" on wishlists for update using (auth.uid() = user_id);
