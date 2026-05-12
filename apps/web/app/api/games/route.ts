import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase/server-public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/games — public list of active games.
 *
 * Uses the publishable (anon) Supabase key. RLS already restricts results
 * to `is_active=true AND deleted_at IS NULL`, so service-role isn't needed
 * here.
 *
 * Returns `{ games: [] }` (HTTP 200) when:
 *   - Supabase env isn't configured (degrade gracefully during early dev)
 *   - The `games` table doesn't exist (SQL migration not yet run)
 *
 * Returns 500 only on unexpected Supabase errors.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const sb = getPublicSupabase();
  if (!sb) {
    return NextResponse.json({ games: [] });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const platform = searchParams.get("platform");
  const service = searchParams.get("service");

  // Return ALL non-deleted games (active + "coming soon"). UI distinguishes
  // them visually via the is_active flag. RLS must permit reads of inactive
  // rows — see supabase/games-show-all.sql for the policy migration.
  let query = sb.from("games").select("*").is("deleted_at", null);

  // Opt-in legacy filter: ?active=1 keeps the old behaviour for any caller
  // that needs only-live rows.
  if (searchParams.get("active") === "1") {
    query = query.eq("is_active", true);
  }

  if (category) query = query.eq("category", category);
  if (platform) query = query.contains("platforms", [platform]);
  if (service === "boosting" || service === "account_trading" || service === "top_up") {
    query = query.eq(`services->${service}->>enabled`, "true");
  }

  query = query
    .order("priority_tier", { ascending: true })
    .order("slug", { ascending: true });

  const { data, error } = await query;
  if (error) {
    // "relation public.games does not exist" = SQL hasn't been run yet.
    // Degrade gracefully so the UI shows an empty grid instead of console errors.
    if (
      error.code === "42P01" ||
      /does not exist|relation.*games/i.test(error.message)
    ) {
      console.warn(
        "[/api/games] games table missing — has supabase/games.sql been run?",
      );
      return NextResponse.json({ games: [] });
    }
    console.error("[/api/games] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ games: data ?? [] });
}
