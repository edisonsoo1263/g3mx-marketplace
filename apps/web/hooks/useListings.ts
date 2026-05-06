"use client";

import { useEffect, useState } from "react";
import { boostListings, type BoostListing } from "@/lib/data/boostListings";
import {
  getPublishedListings,
  LISTINGS_UPDATED_EVENT,
} from "@/lib/data/userListings";

/**
 * useListings — returns the full marketplace feed: user-published listings
 * (newest first) merged with the static seed catalog.
 *
 * SSR-safe: starts with just the seed, hydrates the localStorage layer on
 * mount, and re-reads on the same-tab `g3mx:listings-updated` custom event
 * and the native cross-tab `storage` event.
 */
export function useListings(): BoostListing[] {
  const [userListings, setUserListings] = useState<BoostListing[]>([]);

  useEffect(() => {
    setUserListings(getPublishedListings());

    function refresh() {
      setUserListings(getPublishedListings());
    }

    window.addEventListener(LISTINGS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(LISTINGS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  // User listings come first so seller's just-published listing is visible
  // before any seed entries.
  return [...userListings, ...boostListings];
}
