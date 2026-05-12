-- Loosen the games RLS policy so the public API can return inactive
-- ("coming soon") games too. The UI marks them with a badge and dims
-- the card, but they're surfaced so users see the roadmap.
--
-- Run this in Supabase SQL Editor once, after games.sql.
-- Idempotent: safe to re-run.

DROP POLICY IF EXISTS "games: public read active"      ON public.games;
DROP POLICY IF EXISTS "games: public read non-deleted" ON public.games;

CREATE POLICY "games: public read non-deleted" ON public.games
  FOR SELECT
  USING (deleted_at IS NULL);
