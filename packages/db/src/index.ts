import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Row types mirror supabase/migrations (public-read tables only).
export type SchoolRow = {
  code: string;
  slug: string;
  name: string;
  province: string;
  region: string;
  kind: string;
  website: string | null;
  source_url: string | null;
};

export type CutoffRow = {
  school_code: string;
  major_code: string;
  major_name: string;
  combo: string | null;
  year: number;
  method: string;
  score: number;
  tuition_per_year?: number | null;
  quota?: number | null;
};

export type DistRow = { combo: string; score: number; count: number };

export type ReviewRow = {
  school_code: string;
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
