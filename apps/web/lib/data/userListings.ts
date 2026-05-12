import {
  fetchAllListings,
  fetchListingsByUser,
  insertListing,
  deleteListing,
} from "@/lib/supabase/listings";
import type { BoostListing } from "@/lib/data/boostListings";

/**
 * Listings data layer — Supabase-backed.
 *
 * Function names mirror the previous localStorage-only API so call sites
 * (SellerWizard, /account/listings, useListings) stayed mostly unchanged —
 * just sprinkled with `await` for the async Supabase round-trips.
 *
 * Listeners:
 *   - same-tab updates: dispatch `g3mx:listings-updated` CustomEvent
 *     (after a successful insert/delete) so reactive hooks refetch
 *   - cross-tab updates: re-uses the native `storage` event for free since
 *     hooks already subscribe to it
 */

export const LISTINGS_UPDATED_EVENT = "g3mx:listings-updated";

export async function getPublishedListings(): Promise<BoostListing[]> {
  return fetchAllListings();
}

export async function getPublishedListingsByUser(
  userId: string,
): Promise<BoostListing[]> {
  return fetchListingsByUser(userId);
}

export async function addPublishedListing(
  listing: BoostListing,
): Promise<boolean> {
  const ok = await insertListing(listing);
  if (ok && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LISTINGS_UPDATED_EVENT));
  }
  return ok;
}

export async function removePublishedListing(id: string): Promise<boolean> {
  const ok = await deleteListing(id);
  if (ok && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LISTINGS_UPDATED_EVENT));
  }
  return ok;
}

/** Returns a unique listing id, preferring native UUIDs. */
export function generateListingId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `lst_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
