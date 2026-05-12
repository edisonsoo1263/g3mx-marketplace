/**
 * Seller reviews — types shared between API, client lib, and UI.
 * Mirrors the public.seller_reviews table in supabase/reviews.sql.
 */

export type ReviewRating = 1 | 2 | 3 | 4 | 5;

export interface SellerReview {
  id: string;
  listing_id: string;
  seller_user_id: string;
  buyer_user_id: string;
  rating: ReviewRating;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

/** Client → server payload for POST /api/listings/[id]/reviews */
export interface ReviewSubmission {
  rating: ReviewRating;
  title?: string;
  body: string;
  /** The seller's Privy user id — copied from the listing so we can
   *  aggregate by seller cheaply. Server doesn't currently verify this
   *  against a listings table (none exists yet); when one lands it should. */
  seller_user_id: string;
}

export interface SellerRatingSummary {
  average: number;
  count: number;
  /** Count of reviews at each star tier, 1..5. Drives the histogram bars. */
  distribution: Record<ReviewRating, number>;
}

export function emptyRatingSummary(): SellerRatingSummary {
  return {
    average: 0,
    count: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  };
}

export function summarize(reviews: SellerReview[]): SellerRatingSummary {
  const out = emptyRatingSummary();
  if (reviews.length === 0) return out;
  let total = 0;
  for (const r of reviews) {
    const rating = r.rating as ReviewRating;
    out.distribution[rating] = (out.distribution[rating] ?? 0) + 1;
    total += rating;
  }
  out.count = reviews.length;
  out.average = Math.round((total / reviews.length) * 100) / 100;
  return out;
}
