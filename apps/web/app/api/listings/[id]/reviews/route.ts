import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPublicSupabase } from "@/lib/supabase/server-public";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { verifyPrivyAuth } from "@/lib/auth/privy-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const submissionSchema = z
  .object({
    rating: z.union([
      z.literal(1),
      z.literal(2),
      z.literal(3),
      z.literal(4),
      z.literal(5),
    ]),
    title: z.string().trim().max(120).optional(),
    body: z.string().trim().min(10, "Tell us a bit more — at least 10 chars").max(4000),
    seller_user_id: z.string().trim().min(3).max(200),
  })
  .strict();

/**
 * GET /api/listings/[id]/reviews — public list of reviews for one listing.
 * Returns newest-first.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: listingId } = await params;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
  }
  const sb = getPublicSupabase();
  if (!sb) return NextResponse.json({ reviews: [] });

  const { data, error } = await sb
    .from("seller_reviews")
    .select("*")
    .eq("listing_id", listingId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.code === "42P01") {
      // table doesn't exist yet — degrade gracefully
      return NextResponse.json({ reviews: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reviews: data ?? [] });
}

/**
 * POST /api/listings/[id]/reviews — create a review.
 *
 * Requires a valid Privy bearer token. The buyer_user_id is taken from the
 * verified JWT, NOT the body, so a client can't spoof reviews as someone
 * else. seller_user_id comes from the body for now (no listings table to
 * cross-validate yet); when that table lands, validate seller_user_id by
 * joining to listings via listing_id.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id: listingId } = await params;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listing id" }, { status: 400 });
  }

  const auth = await verifyPrivyAuth(req);
  if (!auth) {
    return NextResponse.json(
      { error: "Sign in to leave a review" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = submissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  if (parsed.data.seller_user_id === auth.userId) {
    return NextResponse.json(
      { error: "You can't review your own listing" },
      { status: 400 },
    );
  }

  // Writes need to bypass RLS deterministically — use the admin client.
  // Falls back to public client if service role isn't configured (RLS is
  // currently permissive so insert still works).
  const sb = (() => {
    try {
      return getAdminSupabase();
    } catch {
      return getPublicSupabase();
    }
  })();
  if (!sb) {
    return NextResponse.json(
      { error: "Reviews offline — Supabase not configured" },
      { status: 503 },
    );
  }

  const { data, error } = await sb
    .from("seller_reviews")
    .insert({
      listing_id: listingId,
      seller_user_id: parsed.data.seller_user_id,
      buyer_user_id: auth.userId,
      rating: parsed.data.rating,
      title: parsed.data.title ?? null,
      body: parsed.data.body,
    })
    .select("*")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "You've already reviewed this listing — edit your existing review instead" },
        { status: 409 },
      );
    }
    if (error.code === "42P01") {
      return NextResponse.json(
        { error: "Reviews table not yet created — run supabase/reviews.sql" },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ review: data }, { status: 201 });
}
