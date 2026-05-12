import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase/server-public";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/games/[slug] — public single-game detail.
 *
 * Same resilience rules as /api/games: empty Supabase config → 200 with
 * null + "not configured" hint; missing table → 404; otherwise standard.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
): Promise<Response> {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  const sb = getPublicSupabase();
  if (!sb) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  // Return the row regardless of is_active so /games/[slug] can render a
  // "Coming soon" page for inactive titles. Only soft-deleted rows 404.
  const { data, error } = await sb
    .from("games")
    .select("*")
    .eq("slug", slug)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    if (
      error.code === "42P01" ||
      /does not exist|relation.*games/i.test(error.message)
    ) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    console.error("[/api/games/:slug] error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ game: data });
}
