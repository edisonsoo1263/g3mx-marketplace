"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  getPublishedListingsByUser,
  LISTINGS_UPDATED_EVENT,
} from "@/lib/data/userListings";
import type { BoostListing } from "@/lib/data/boostListings";

/**
 * useMyListings — Supabase-backed listings owned by the current Privy user.
 * Returns an empty array when logged out.
 */
export function useMyListings(): BoostListing[] {
  const { user, isReady } = useAuth();
  const [listings, setListings] = useState<BoostListing[]>([]);

  useEffect(() => {
    if (!isReady) return;
    if (!user) {
      setListings([]);
      return;
    }
    const userId = user.id;
    let cancelled = false;

    async function refresh() {
      const data = await getPublishedListingsByUser(userId);
      if (!cancelled) setListings(data);
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
  }, [user, isReady]);

  return listings;
}
