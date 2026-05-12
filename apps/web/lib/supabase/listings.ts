"use client";

import { getSupabase } from "@/lib/supabase/client";
import type { BoostListing, ServiceType } from "@/lib/data/boostListings";
import type { QueueType, Region } from "@/lib/data/ranks";

interface ListingRow {
  id: string;
  user_id: string;
  game: string;
  service_type: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  from_idx: number;
  to_idx: number;
  from_rank_id: string | null;
  to_rank_id: string | null;
  region: string;
  queue_type: string;
  price_usd: number;
  eta_hours: number;
  response_minutes: number;
  booster_tag: string;
  booster_avatar_seed: string;
  booster_rating: number;
  orders_completed: number;
  rarity: string;
  hot: boolean;
  options: BoostListing["options"];
  created_at: string;
  updated_at: string;
}

function rowToListing(row: ListingRow): BoostListing {
  return {
    id: row.id,
    game: row.game,
    serviceType: row.service_type as ServiceType,
    title: row.title,
    fromRankId: row.from_rank_id ?? "",
    toRankId: row.to_rank_id ?? "",
    fromIdx: row.from_idx,
    toIdx: row.to_idx,
    region: row.region as Region,
    queueType: row.queue_type as QueueType,
    priceUsd: Number(row.price_usd),
    etaHours: row.eta_hours,
    responseMinutes: row.response_minutes,
    boosterTag: row.booster_tag,
    boosterAvatarSeed: row.booster_avatar_seed,
    boosterRating: Number(row.booster_rating),
    ordersCompleted: row.orders_completed,
    rarity: row.rarity as BoostListing["rarity"],
    hot: row.hot,
    options: row.options,
  };
}

function listingToRow(
  listing: BoostListing,
): Omit<ListingRow, "created_at" | "updated_at"> {
  return {
    id: listing.id,
    user_id: listing.boosterAvatarSeed, // Privy user id of the seller
    game: listing.game,
    service_type: listing.serviceType,
    title: listing.title,
    description: null, // wizard description isn't stored on BoostListing today
    cover_image: null, // same — base64 covers aren't on the type
    from_idx: listing.fromIdx,
    to_idx: listing.toIdx,
    from_rank_id: listing.fromRankId || null,
    to_rank_id: listing.toRankId || null,
    region: listing.region,
    queue_type: listing.queueType,
    price_usd: listing.priceUsd,
    eta_hours: listing.etaHours,
    response_minutes: listing.responseMinutes,
    booster_tag: listing.boosterTag,
    booster_avatar_seed: listing.boosterAvatarSeed,
    booster_rating: listing.boosterRating,
    orders_completed: listing.ordersCompleted,
    rarity: listing.rarity,
    hot: listing.hot,
    options: listing.options,
  };
}

// ── CRUD ─────────────────────────────────────────────────────────

export async function fetchAllListings(): Promise<BoostListing[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] fetchAllListings error:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToListing(r as unknown as ListingRow));
}

export async function fetchListingsByUser(userId: string): Promise<BoostListing[]> {
  const sb = getSupabase();
  if (!sb) return [];
  const { data, error } = await sb
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[supabase] fetchListingsByUser error:", error.message);
    return [];
  }
  return (data ?? []).map((r) => rowToListing(r as unknown as ListingRow));
}

export async function insertListing(listing: BoostListing): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("listings").insert(listingToRow(listing));
  if (error) {
    console.error("[supabase] insertListing error:", error.message);
    return false;
  }
  return true;
}

export async function deleteListing(id: string): Promise<boolean> {
  const sb = getSupabase();
  if (!sb) return false;
  const { error } = await sb.from("listings").delete().eq("id", id);
  if (error) {
    console.error("[supabase] deleteListing error:", error.message);
    return false;
  }
  return true;
}
