/**
 * Per-game rank ladders. Order is ascending; index acts as the tier ordinal,
 * so filtering by from/to becomes simple index math.
 */

export interface RankTier {
  id: string;
  label: string;
  /** Hex accent for visual distinction. */
  accent: string;
}

export interface RankLadder {
  game: string;
  tiers: RankTier[];
}

const valorant: RankLadder = {
  game: "valorant",
  tiers: [
    { id: "iron", label: "Iron", accent: "#5a5a5a" },
    { id: "bronze", label: "Bronze", accent: "#cd7f32" },
    { id: "silver", label: "Silver", accent: "#c0c0c0" },
    { id: "gold", label: "Gold", accent: "#ffd700" },
    { id: "platinum", label: "Platinum", accent: "#3fc7b6" },
    { id: "diamond", label: "Diamond", accent: "#b0e0ff" },
    { id: "ascendant", label: "Ascendant", accent: "#5cffb6" },
    { id: "immortal", label: "Immortal", accent: "#ff4060" },
    { id: "radiant", label: "Radiant", accent: "#ffe488" },
  ],
};

const lol: RankLadder = {
  game: "lol",
  tiers: [
    { id: "iron", label: "Iron", accent: "#5a5a5a" },
    { id: "bronze", label: "Bronze", accent: "#cd7f32" },
    { id: "silver", label: "Silver", accent: "#c0c0c0" },
    { id: "gold", label: "Gold", accent: "#c89b3c" },
    { id: "platinum", label: "Platinum", accent: "#3fc7b6" },
    { id: "emerald", label: "Emerald", accent: "#3eb489" },
    { id: "diamond", label: "Diamond", accent: "#b0e0ff" },
    { id: "master", label: "Master", accent: "#a855f7" },
    { id: "grandmaster", label: "Grandmaster", accent: "#ef4444" },
    { id: "challenger", label: "Challenger", accent: "#06b6d4" },
  ],
};

const mlbb: RankLadder = {
  game: "mlbb",
  tiers: [
    { id: "warrior", label: "Warrior", accent: "#a78bfa" },
    { id: "elite", label: "Elite", accent: "#3fc7b6" },
    { id: "master", label: "Master", accent: "#60a5fa" },
    { id: "gm", label: "Grandmaster", accent: "#ffe488" },
    { id: "epic", label: "Epic", accent: "#a855f7" },
    { id: "legend", label: "Legend", accent: "#f59e0b" },
    { id: "mythic", label: "Mythic", accent: "#ef4444" },
    { id: "mythic25", label: "Mythic 25★", accent: "#ec4899" },
    { id: "mythic50", label: "Mythic 50★", accent: "#22d3ee" },
    { id: "mythical_glory", label: "Mythical Glory", accent: "#facc15" },
  ],
};

const genshin: RankLadder = {
  game: "genshin",
  tiers: [
    { id: "ar20", label: "AR 20", accent: "#a78bfa" },
    { id: "ar35", label: "AR 35", accent: "#60a5fa" },
    { id: "ar45", label: "AR 45", accent: "#3fc7b6" },
    { id: "ar50", label: "AR 50", accent: "#facc15" },
    { id: "ar55", label: "AR 55", accent: "#f59e0b" },
    { id: "ar60", label: "AR 60", accent: "#ef4444" },
  ],
};

const wow: RankLadder = {
  game: "wow",
  tiers: [
    { id: "leveling", label: "Leveling", accent: "#5a5a5a" },
    { id: "lvl70", label: "Level 70", accent: "#60a5fa" },
    { id: "heroic", label: "Heroic Raid", accent: "#a855f7" },
    { id: "mythic", label: "Mythic Raid", accent: "#f59e0b" },
    { id: "rated_pvp", label: "Rated PvP", accent: "#ef4444" },
    { id: "gladiator", label: "Gladiator", accent: "#facc15" },
  ],
};

const csgo: RankLadder = {
  game: "csgo",
  tiers: [
    { id: "silver", label: "Silver", accent: "#c0c0c0" },
    { id: "gold_nova", label: "Gold Nova", accent: "#c89b3c" },
    { id: "mg", label: "Master Guardian", accent: "#3fc7b6" },
    { id: "dmg", label: "DMG", accent: "#60a5fa" },
    { id: "le", label: "Legendary Eagle", accent: "#a855f7" },
    { id: "supreme", label: "Supreme", accent: "#f59e0b" },
    { id: "ge", label: "Global Elite", accent: "#ef4444" },
  ],
};

const ladders: Record<string, RankLadder> = {
  valorant,
  lol,
  mlbb,
  genshin,
  wow,
  csgo,
};

export function getLadder(gameSlug: string): RankLadder {
  return ladders[gameSlug] ?? valorant;
}

export const sortOptions = [
  { id: "popular", label: "Most popular" },
  { id: "price_asc", label: "Price: low → high" },
  { id: "price_desc", label: "Price: high → low" },
  { id: "rating", label: "Highest rating" },
  { id: "eta", label: "Fastest delivery" },
] as const;

export type SortOption = (typeof sortOptions)[number]["id"];

export const regions = ["NA", "EU", "SEA", "LATAM", "BR", "OCE", "GLOBAL"] as const;
export type Region = (typeof regions)[number];

export const queueTypes = ["Solo/Duo", "Flex", "Premade", "Unrated"] as const;
export type QueueType = (typeof queueTypes)[number];
