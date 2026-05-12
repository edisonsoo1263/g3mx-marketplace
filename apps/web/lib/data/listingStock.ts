import type { BoostListing } from "@/lib/data/boostListings";

export interface ListingStock {
  /** How many concurrent bookings the booster can take right now. */
  available: number;
  /** UI tone — flips to "low" at ≤ 3 to surface scarcity. */
  tone: "ok" | "low";
}

/**
 * Stable per-listing pseudo-stock derived from the listing id. Same input →
 * same output across renders, but seller-specific.
 *
 * Replace with a real "active booking slots" query once the backend tracks
 * concurrent capacity per booster.
 */
export function computeStock(listing: BoostListing): ListingStock {
  const seed = hashString(listing.id);
  const base = 4 + (seed % 9); // 4..12
  const available = Math.max(
    1,
    listing.options.priorityQueue ? base - 1 : base,
  );
  return { available, tone: available <= 3 ? "low" : "ok" };
}

function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
