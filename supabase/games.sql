-- G3MX Games Catalog — Supabase schema + seed
-- =========================================================
-- Run in Supabase Dashboard → SQL Editor → New Query → Paste → Run.
-- Idempotent: safe to re-run (CREATE IF NOT EXISTS + ON CONFLICT DO NOTHING).
--
-- Auth model: identity comes from Privy (see lib/auth/privy-server.ts).
-- Admin actions go through the Next.js Route Handlers using the
-- SUPABASE_SERVICE_ROLE_KEY so RLS is bypassed for trusted writes.
-- Public reads are RLS-policy-gated to active, non-deleted rows only.
-- =========================================================

CREATE TABLE IF NOT EXISTS public.games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,

  -- Multilingual names. en is required; zh_tw and id are optional.
  -- Frontend falls back to en when a locale key is missing.
  name JSONB NOT NULL,

  publisher TEXT,
  category TEXT NOT NULL, -- FPS | MOBA | Gacha | MMORPG | Battle Royale | Card | Sandbox | Sports | Strategy | Survival | Action | AR
  platforms TEXT[] NOT NULL DEFAULT '{}', -- ["PC", "Mobile", "Console", "Switch"]
  region_focus TEXT[] NOT NULL DEFAULT '{}', -- ["Global", "SEA", "CN", "KR", "JP", "NA", "EU"]

  -- Three service blocks. UI toggles `enabled` and edits `examples` / `currency_name`.
  services JSONB NOT NULL DEFAULT '{
    "boosting": { "enabled": false, "examples": [] },
    "account_trading": { "enabled": false, "examples": [] },
    "top_up": { "enabled": false, "currency_name": null }
  }'::jsonb,

  priority_tier INT NOT NULL DEFAULT 3, -- 1 = MVP launch, 2 = expansion, 3 = long-tail
  is_active BOOLEAN NOT NULL DEFAULT false,

  icon_url TEXT,
  banner_url TEXT,

  -- Soft delete. Public read filters this; admin list still surfaces tombstones.
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_games_is_active     ON public.games(is_active);
CREATE INDEX IF NOT EXISTS idx_games_priority_tier ON public.games(priority_tier);
CREATE INDEX IF NOT EXISTS idx_games_category      ON public.games(category);
CREATE INDEX IF NOT EXISTS idx_games_slug          ON public.games(slug);
CREATE INDEX IF NOT EXISTS idx_games_deleted_at    ON public.games(deleted_at);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.games_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS games_update_updated_at ON public.games;
CREATE TRIGGER games_update_updated_at
  BEFORE UPDATE ON public.games
  FOR EACH ROW EXECUTE FUNCTION public.games_set_updated_at();

-- ── RLS ────────────────────────────────────────────────────────
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "games: public read active" ON public.games;
CREATE POLICY "games: public read active" ON public.games
  FOR SELECT
  USING (is_active = true AND deleted_at IS NULL);

-- Admin writes happen via the Next.js API using the service role key,
-- which bypasses RLS — no policies needed for INSERT/UPDATE/DELETE here.

-- ── Seed: 39 games across 3 tiers ─────────────────────────────
-- ON CONFLICT (slug) DO NOTHING keeps re-runs safe. Once a row is created,
-- updates must go through the admin UI.

INSERT INTO public.games (slug, name, publisher, category, platforms, services, priority_tier, is_active) VALUES
  -- ── Tier 1 (MVP launch, active) ──
  ('valorant', '{"en":"Valorant"}'::jsonb, 'Riot Games', 'FPS', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Valorant Points (VP)"}}'::jsonb, 1, true),
  ('league-of-legends', '{"en":"League of Legends"}'::jsonb, 'Riot Games', 'MOBA', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Riot Points (RP)"}}'::jsonb, 1, true),
  ('cs2', '{"en":"Counter-Strike 2"}'::jsonb, 'Valve', 'FPS', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 1, true),
  ('mlbb', '{"en":"Mobile Legends: Bang Bang"}'::jsonb, 'Moonton', 'MOBA', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Diamonds"}}'::jsonb, 1, true),
  ('free-fire', '{"en":"Free Fire"}'::jsonb, 'Garena', 'Battle Royale', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Diamonds"}}'::jsonb, 1, true),
  ('pubg-mobile', '{"en":"PUBG Mobile"}'::jsonb, 'Tencent/Krafton', 'Battle Royale', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"UC"}}'::jsonb, 1, true),
  ('genshin-impact', '{"en":"Genshin Impact"}'::jsonb, 'miHoYo', 'Gacha', ARRAY['PC','Mobile','Console'],
    '{"boosting":{"enabled":false,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Genesis Crystals"}}'::jsonb, 1, true),
  ('honkai-star-rail', '{"en":"Honkai: Star Rail"}'::jsonb, 'miHoYo', 'Gacha', ARRAY['PC','Mobile'],
    '{"boosting":{"enabled":false,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Oneiric Shards"}}'::jsonb, 1, true),

  -- ── Tier 2 (expansion, inactive until manually flipped) ──
  ('wild-rift', '{"en":"LoL: Wild Rift"}'::jsonb, 'Riot Games', 'MOBA', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Wild Cores"}}'::jsonb, 2, false),
  ('cod-mobile', '{"en":"Call of Duty: Mobile"}'::jsonb, 'Activision', 'FPS', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"CP"}}'::jsonb, 2, false),
  ('apex-legends', '{"en":"Apex Legends"}'::jsonb, 'EA', 'Battle Royale', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Apex Coins"}}'::jsonb, 2, false),
  ('fortnite', '{"en":"Fortnite"}'::jsonb, 'Epic Games', 'Battle Royale', ARRAY['PC','Mobile','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"V-Bucks"}}'::jsonb, 2, false),
  ('aov', '{"en":"Arena of Valor"}'::jsonb, 'Tencent', 'MOBA', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Vouchers"}}'::jsonb, 2, false),
  ('honor-of-kings', '{"en":"Honor of Kings"}'::jsonb, 'Tencent', 'MOBA', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Tokens"}}'::jsonb, 2, false),
  ('marvel-rivals', '{"en":"Marvel Rivals"}'::jsonb, 'NetEase', 'FPS', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Units"}}'::jsonb, 2, false),
  ('overwatch-2', '{"en":"Overwatch 2"}'::jsonb, 'Blizzard', 'FPS', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"OW Coins"}}'::jsonb, 2, false),
  ('fc-26', '{"en":"EA Sports FC 26"}'::jsonb, 'EA', 'Sports', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 2, false),
  ('dota-2', '{"en":"Dota 2"}'::jsonb, 'Valve', 'MOBA', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 2, false),

  -- ── Tier 3 (long-tail, inactive) ──
  ('wow', '{"en":"World of Warcraft"}'::jsonb, 'Blizzard', 'MMORPG', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('ffxiv', '{"en":"Final Fantasy XIV"}'::jsonb, 'Square Enix', 'MMORPG', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('lost-ark', '{"en":"Lost Ark"}'::jsonb, 'Amazon Games', 'MMORPG', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('poe-2', '{"en":"Path of Exile 2"}'::jsonb, 'GGG', 'MMORPG', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('diablo-4', '{"en":"Diablo IV"}'::jsonb, 'Blizzard', 'MMORPG', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('warzone', '{"en":"Call of Duty: Warzone"}'::jsonb, 'Activision', 'Battle Royale', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('r6-siege', '{"en":"Rainbow Six Siege"}'::jsonb, 'Ubisoft', 'FPS', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"R6 Credits"}}'::jsonb, 3, false),
  ('rocket-league', '{"en":"Rocket League"}'::jsonb, 'Epic Games', 'Sports', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Credits"}}'::jsonb, 3, false),
  ('coc', '{"en":"Clash of Clans"}'::jsonb, 'Supercell', 'Strategy', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Gems"}}'::jsonb, 3, false),
  ('clash-royale', '{"en":"Clash Royale"}'::jsonb, 'Supercell', 'Card', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Gems"}}'::jsonb, 3, false),
  ('brawl-stars', '{"en":"Brawl Stars"}'::jsonb, 'Supercell', 'Strategy', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Gems"}}'::jsonb, 3, false),
  ('identity-v', '{"en":"Identity V"}'::jsonb, 'NetEase', 'Survival', ARRAY['Mobile'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Echoes"}}'::jsonb, 3, false),
  ('pokemon-unite', '{"en":"Pokémon Unite"}'::jsonb, 'TiMi/Nintendo', 'MOBA', ARRAY['Mobile','Switch'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Aeos Gems"}}'::jsonb, 3, false),
  ('pokemon-go', '{"en":"Pokémon GO"}'::jsonb, 'Niantic', 'AR', ARRAY['Mobile'],
    '{"boosting":{"enabled":false,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"PokéCoins"}}'::jsonb, 3, false),
  ('roblox', '{"en":"Roblox"}'::jsonb, 'Roblox Corp', 'Sandbox', ARRAY['PC','Mobile','Console'],
    '{"boosting":{"enabled":false,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Robux"}}'::jsonb, 3, false),
  ('minecraft', '{"en":"Minecraft"}'::jsonb, 'Mojang', 'Sandbox', ARRAY['PC','Mobile','Console'],
    '{"boosting":{"enabled":false,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('gta-5', '{"en":"GTA V Online"}'::jsonb, 'Rockstar', 'Action', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Shark Cards"}}'::jsonb, 3, false),
  ('new-world', '{"en":"New World"}'::jsonb, 'Amazon Games', 'MMORPG', ARRAY['PC'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('bdo', '{"en":"Black Desert Online"}'::jsonb, 'Pearl Abyss', 'MMORPG', ARRAY['PC','Console'],
    '{"boosting":{"enabled":true,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":false,"currency_name":null}}'::jsonb, 3, false),
  ('wuwa', '{"en":"Wuthering Waves"}'::jsonb, 'Kuro Games', 'Gacha', ARRAY['PC','Mobile'],
    '{"boosting":{"enabled":false,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Astrites"}}'::jsonb, 3, false),
  ('zzz', '{"en":"Zenless Zone Zero"}'::jsonb, 'miHoYo', 'Gacha', ARRAY['PC','Mobile'],
    '{"boosting":{"enabled":false,"examples":[]},"account_trading":{"enabled":true,"examples":[]},"top_up":{"enabled":true,"currency_name":"Polychromes"}}'::jsonb, 3, false)
ON CONFLICT (slug) DO NOTHING;
