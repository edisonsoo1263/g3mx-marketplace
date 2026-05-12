/**
 * Games catalog — shared types between API, server helpers, and UI.
 * Matches the public.games table in supabase/games.sql.
 */

export type GameLocale = "en" | "zh_tw" | "id";

export type GameName = {
  en: string;
} & Partial<Record<Exclude<GameLocale, "en">, string>>;

export type GameCategory =
  | "FPS"
  | "MOBA"
  | "Gacha"
  | "MMORPG"
  | "Battle Royale"
  | "Card"
  | "Sandbox"
  | "Sports"
  | "Strategy"
  | "Survival"
  | "Action"
  | "AR";

export const GAME_CATEGORIES: GameCategory[] = [
  "FPS",
  "MOBA",
  "Gacha",
  "MMORPG",
  "Battle Royale",
  "Card",
  "Sandbox",
  "Sports",
  "Strategy",
  "Survival",
  "Action",
  "AR",
];

export type GamePlatform = "PC" | "Mobile" | "Console" | "Switch";
export const GAME_PLATFORMS: GamePlatform[] = [
  "PC",
  "Mobile",
  "Console",
  "Switch",
];

export type GameRegion = "Global" | "SEA" | "CN" | "KR" | "JP" | "NA" | "EU";
export const GAME_REGIONS: GameRegion[] = [
  "Global",
  "SEA",
  "CN",
  "KR",
  "JP",
  "NA",
  "EU",
];

export interface GameServiceBlock {
  enabled: boolean;
  examples: string[];
}

export interface GameTopUpBlock {
  enabled: boolean;
  /** Display name of the top-up currency (e.g. "Valorant Points (VP)"). */
  currency_name: string | null;
}

export interface GameServices {
  boosting: GameServiceBlock;
  account_trading: GameServiceBlock;
  top_up: GameTopUpBlock;
}

export interface Game {
  id: string;
  slug: string;
  name: GameName;
  publisher: string | null;
  category: GameCategory;
  platforms: GamePlatform[];
  region_focus: GameRegion[];
  services: GameServices;
  priority_tier: 1 | 2 | 3;
  is_active: boolean;
  icon_url: string | null;
  banner_url: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Shape accepted by POST /api/admin/games (create) and PUT (update). */
export interface GameInput {
  slug: string;
  name: GameName;
  publisher?: string | null;
  category: GameCategory;
  platforms: GamePlatform[];
  region_focus?: GameRegion[];
  services: GameServices;
  priority_tier: 1 | 2 | 3;
  is_active?: boolean;
  icon_url?: string | null;
  banner_url?: string | null;
}

export function pickGameName(name: GameName, locale: GameLocale = "en"): string {
  return name[locale] ?? name.en;
}

export function emptyServices(): GameServices {
  return {
    boosting: { enabled: false, examples: [] },
    account_trading: { enabled: false, examples: [] },
    top_up: { enabled: false, currency_name: null },
  };
}
