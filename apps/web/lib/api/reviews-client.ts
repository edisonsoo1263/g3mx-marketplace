"use client";

import type {
  ReviewSubmission,
  SellerRatingSummary,
  SellerReview,
} from "@/lib/types/reviews";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    // ignore — leave body as null
  }
  if (!res.ok) {
    const msg =
      (body as { error?: string } | null)?.error ??
      `Request failed with ${res.status}`;
    throw new Error(msg);
  }
  return body as T;
}

export async function listListingReviews(
  listingId: string,
): Promise<SellerReview[]> {
  const res = await fetch(
    `/api/listings/${encodeURIComponent(listingId)}/reviews`,
    { cache: "no-store" },
  );
  return (await jsonOrThrow<{ reviews: SellerReview[] }>(res)).reviews;
}

export async function submitListingReview(
  token: string,
  listingId: string,
  payload: ReviewSubmission,
): Promise<SellerReview> {
  const res = await fetch(
    `/api/listings/${encodeURIComponent(listingId)}/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
  return (await jsonOrThrow<{ review: SellerReview }>(res)).review;
}

export async function getSellerRating(
  sellerUserId: string,
): Promise<SellerRatingSummary> {
  const res = await fetch(
    `/api/sellers/rating?user_id=${encodeURIComponent(sellerUserId)}`,
    { cache: "no-store" },
  );
  return jsonOrThrow<SellerRatingSummary>(res);
}
