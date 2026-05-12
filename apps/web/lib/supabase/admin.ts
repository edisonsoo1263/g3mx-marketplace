import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key. Bypasses RLS.
 *
 * NEVER import this from any module that ends up in the client bundle.
 * The `server-only` import at the top throws at build time if you try.
 *
 * Use cases:
 *   - Admin writes (CRUD on games, etc.)
 *   - Reads where you specifically want to bypass RLS (e.g. previews)
 *
 * For ordinary client-side reads use the publishable client in
 * lib/supabase/client.ts instead.
 */
let cached: SupabaseClient | null = null;

export function getAdminSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "[supabase admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
        "Add them to your Vercel env or .env.local.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    db: { schema: "public" },
  });
  return cached;
}
