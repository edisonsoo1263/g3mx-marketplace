import type { BoostListing } from "@/lib/data/boostListings";

/**
 * userListings — localStorage-backed store for boost listings published by
 * sellers via the onboarding wizard. Acts as the temporary "backend" until a
 * real API is wired up. Persisted under one key as a JSON array.
 *
 * Listeners:
 *   - same-tab updates: dispatch `g3mx:listings-updated` CustomEvent
 *   - cross-tab updates: native `storage` event fires on other tabs
 */

const STORAGE_KEY = "g3mx_published_listings";
export const LISTINGS_UPDATED_EVENT = "g3mx:listings-updated";

export function getPublishedListings(): BoostListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Trust the seed shape — we wrote these ourselves
    return parsed as BoostListing[];
  } catch {
    return [];
  }
}

export function addPublishedListing(listing: BoostListing): void {
  if (typeof window === "undefined") return;
  try {
    const current = getPublishedListings();
    // Newest first so the seller sees their listing immediately on /boosts
    const next = [listing, ...current];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(LISTINGS_UPDATED_EVENT));
  } catch {
    // localStorage may be full; swallow to avoid breaking the publish UX
  }
}

export function removePublishedListing(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = getPublishedListings().filter((l) => l.id !== id);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(LISTINGS_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

export function clearPublishedListings(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new CustomEvent(LISTINGS_UPDATED_EVENT));
  } catch {
    // ignore
  }
}

/** Returns a unique listing id, preferring native UUIDs. */
export function generateListingId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `lst_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
