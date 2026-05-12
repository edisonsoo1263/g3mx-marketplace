"use client";

import { useCallback, useEffect, useState } from "react";
import { listListingReviews } from "@/lib/api/reviews-client";
import type { SellerReview } from "@/lib/types/reviews";

/**
 * useListingReviews — reactive list of reviews for one listing.
 * Exposes `refetch` so the review form can pull fresh data after a POST
 * without remounting the component.
 */
export function useListingReviews(listingId: string | null): {
  reviews: SellerReview[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [reviews, setReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    if (!listingId) {
      setReviews([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await listListingReviews(listingId);
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    void fetchReviews();
  }, [fetchReviews]);

  return { reviews, loading, error, refetch: fetchReviews };
}
