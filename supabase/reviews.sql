-- G3MX seller reviews
-- =========================================================
-- One review per (listing, buyer). Reviews attach to a listing but also
-- carry the seller_user_id so /api/sellers/rating can aggregate across all
-- of a seller's listings cheaply.
--
-- Identity: buyer_user_id and seller_user_id are Privy user ids
-- ("did:privy:..."). Buyer identity is JWT-verified server-side via
-- @privy-io/server-auth on the POST handler — the client cannot spoof
-- whose review they're leaving.
--
-- Run in Supabase SQL Editor. Idempotent.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.seller_reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id      TEXT NOT NULL,
  seller_user_id  TEXT NOT NULL,
  buyer_user_id   TEXT NOT NULL,
  rating          INT  NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title           TEXT,
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (listing_id, buyer_user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_listing on public.seller_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_seller  on public.seller_reviews(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_buyer   on public.seller_reviews(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created on public.seller_reviews(created_at DESC);

CREATE OR REPLACE FUNCTION public.seller_reviews_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS seller_reviews_updated_at ON public.seller_reviews;
CREATE TRIGGER seller_reviews_updated_at
  BEFORE UPDATE ON public.seller_reviews
  FOR EACH ROW EXECUTE FUNCTION public.seller_reviews_set_updated_at();

ALTER TABLE public.seller_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reviews: public read"       ON public.seller_reviews;
DROP POLICY IF EXISTS "reviews: anyone can insert" ON public.seller_reviews;
DROP POLICY IF EXISTS "reviews: anyone can update" ON public.seller_reviews;
DROP POLICY IF EXISTS "reviews: anyone can delete" ON public.seller_reviews;

-- MVP-permissive: API enforces buyer identity via Privy JWT verification.
-- Tighten once Postgres-level auth is wired (e.g. Privy → Supabase JWT).
CREATE POLICY "reviews: public read"       ON public.seller_reviews FOR SELECT USING (true);
CREATE POLICY "reviews: anyone can insert" ON public.seller_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "reviews: anyone can update" ON public.seller_reviews FOR UPDATE USING (true);
CREATE POLICY "reviews: anyone can delete" ON public.seller_reviews FOR DELETE USING (true);
