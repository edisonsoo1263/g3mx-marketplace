import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase/server-public";
import {
  emptyRatingSummary,
  summarize,
  type SellerReview,
} from "@/lib/types/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/sellers/rating?user_id=did:privy:...
 *
 * Aggregates rating + count + 1..5 distribution across ALL of a seller's
 * listings. Powers the seller card on PDPs and (eventually) a seller
 * profile page.
 *
 * Public — no auth required. Empty result for unknown sellers.
 */
export async function GET(req: NextRequest): Promise<Response> {
  const sellerUserId = new URL(req.url).searchParams.get("user_id");
  if (!sellerUserId) {
    return NextResponse.json(
      { error: "Missing user_id query param" },
      { status: 400 },
    );
  }

  const sb = getPublicSupabase();
  if (!sb) return NextResponse.json(emptyRatingSummary());

  const { data, error } = await sb
    .from("seller_reviews")
    .select("rating, listing_id, seller_user_id, buyer_user_id, id, title, body, created_at, updated_at")
    .eq("seller_user_id", sellerUserId);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(emptyRatingSummary());
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(summarize((data ?? []) as SellerReview[]));
}
