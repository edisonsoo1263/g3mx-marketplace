import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-side Supabase client using the publishable (anon) key.
 *
 * Use for public reads that should respect RLS — e.g. /api/games returns
 * only `is_active=true` rows and that's the public-safe subset, so the
 * publishable key is sufficient. Avoids forcing every public route to
 * require SUPABASE_SERVICE_ROLE_KEY at runtime.
 *
 * For admin writes / RLS-bypassing reads, use lib/supabase/admin.ts.
 */
let cached: SupabaseClient | null = null;

export function getPublicSupabase(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

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
