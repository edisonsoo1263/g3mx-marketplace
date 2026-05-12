"use client";

import { useEffect, useState } from "react";
import { boostListings, type BoostListing } from "@/lib/data/boostListings";
import {
  getPublishedListings,
  LISTINGS_UPDATED_EVENT,
} from "@/lib/data/userListings";

/**
 * useListings — returns the full marketplace feed: Supabase-backed
 * user-published listings (newest first) merged with the static seed
 * catalog.
 *
 * SSR-safe: starts with just the seed, hydrates async on mount, and
 * re-fetches on the same-tab `g3mx:listings-updated` custom event and the
 * native cross-tab `storage` event.
 */
export function useListings(): BoostListing[] {
  const [userListings, setUserListings] = useState<BoostListing[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function refresh() {
      const data = await getPublishedListings();
      if (!cancelled) setUserListings(data);
    }
    void refresh();

    function onUpdate() {
      void refresh();
    }
    window.addEventListener(LISTINGS_UPDATED_EVENT, onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener(LISTINGS_UPDATED_EVENT, onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  // User listings come first so seller's just-published listing is visible
  // before any seed entries.
  return [...userListings, ...boostListings];
}
