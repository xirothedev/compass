import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Row types mirror supabase/migrations/0001_init.sql (public-read tables only).
export type SchoolRow = {
  ma_truong: string;
  slug_en: string;
  ten: string;
  tinh: string;
  mien: string;
  loai: string;
  website: string | null;
  source_url: string | null;
};

export type CutoffRow = {
  ma_truong: string;
  ma_nganh: string;
  ten_nganh: string;
  to_hop: string | null;
  nam: number;
  phuong_thuc: string;
  diem: number;
  hoc_phi_nam?: number | null;
  chi_tieu?: number | null;
};

export type DistRow = { to_hop: string; diem: number; cnt: number };

export type ReviewRow = {
  ma_truong: string;
  criteria: Record<string, number>;
  comment: string | null;
};

let client: SupabaseClient | null = null;

/** Null when env is missing: callers fall back to local mocks. */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  if (!client) client = createClient(url, key);
  return client;
}

export function isSupabaseConfigured(): boolean {
  return getSupabase() !== null;
}
