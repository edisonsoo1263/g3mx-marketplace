"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-safe Supabase client using the publishable (anon) key.
 *
 * Privy is the auth source of truth — Supabase Auth is unused here. We pass
 * `auth.persistSession: false` so Supabase doesn't try to manage its own
 * session cookies / localStorage entries.
 *
 * Returns null when env vars are missing so callers can fall through to a
 * legacy localStorage path during early dev. In production both env vars
 * must be set on Vercel.
 */
let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (typeof window === "undefined") return null;
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[supabase] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY missing — falling back to localStorage.",
      );
    }
    return null;
  }

  cached = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: { schema: "public" },
  });
  return cached;
}
