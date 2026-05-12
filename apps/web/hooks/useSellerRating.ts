"use client";

import { useEffect, useState } from "react";
import { getSellerRating } from "@/lib/api/reviews-client";
import {
  emptyRatingSummary,
  type SellerRatingSummary,
} from "@/lib/types/reviews";

/**
 * useSellerRating — aggregate rating + count + distribution for one seller.
 * Returns the empty summary (0 / 0 / all-zero distribution) until the
 * fetch resolves. Updates whenever sellerUserId changes.
 */
export function useSellerRating(sellerUserId: string | null): {
  summary: SellerRatingSummary;
  loading: boolean;
  error: string | null;
} {
  const [summary, setSummary] = useState<SellerRatingSummary>(
    emptyRatingSummary(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sellerUserId) {
      setSummary(emptyRatingSummary());
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    getSellerRating(sellerUserId)
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load rating");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sellerUserId]);

  return { summary, loading, error };
}
