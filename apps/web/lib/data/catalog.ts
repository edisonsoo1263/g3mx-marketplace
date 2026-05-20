import type { Rarity } from "@/components/ui/GlowingBorder";

export interface Game {
  slug: string;
  name: string;
  region: string;
  publisher: string;
  accent: string;
  /**
   * Optional path to a card cover image (e.g. "/games/valorant.png"). When
   * present, GameShowcase uses it as the card backdrop. When omitted, the
   * card falls back to the stylized SVG art in <GameArt>.
   */
  cardImage?: string;
}

/**
 * Top 10 most popular games — surfaces in the home Hero ticker and other
 * marketing surfaces. The full 39-game catalogue lives in Supabase
 * (`public.games`) and is fetched via `/api/games`.
 */
export const games: Game[] = [
  {
    slug: "valorant",
    name: "Valorant",
    region: "GLOBAL",
    publisher: "Riot Games",
    accent: "#ff4655",
    cardImage: "/games/valorant.jpg",
  },
  {
    slug: "lol",
    name: "League of Legends",
    region: "GLOBAL",
    publisher: "Riot Games",
    accent: "#c89b3c",
    cardImage: "/games/lol.png",
  },
  {
    slug: "mlbb",
    name: "Mobile Legends",
    region: "SEA",
    publisher: "Moonton",
    accent: "#00d4ff",
    cardImage: "/games/mlbb.png",
  },
  {
    slug: "genshin",
    name: "Genshin Impact",
    region: "ASIA",
    publisher: "HoYoverse",
    accent: "#9c8cf0",
    cardImage: "/games/genshin.png",
  },
  {
    slug: "fortnite",
    name: "Fortnite",
    region: "GLOBAL",
    publisher: "Epic Games",
    accent: "#00b4ff",
  },
  {
    slug: "apex-legends",
    name: "Apex Legends",
    region: "GLOBAL",
    publisher: "EA",
    accent: "#ff3d3d",
  },
  {
    slug: "pubg-mobile",
    name: "PUBG Mobile",
    region: "ASIA",
    publisher: "Krafton",
    accent: "#f6c200",
  },
  {
    slug: "honkai-star-rail",
    name: "Honkai: Star Rail",
    region: "ASIA",
    publisher: "HoYoverse",
    accent: "#8b6cff",
  },
  {
    slug: "wow",
    name: "World of Warcraft",
    region: "GLOBAL",
    publisher: "Blizzard",
    accent: "#0078ff",
    cardImage: "/games/wow.png",
  },
  {
    slug: "csgo",
    name: "CS2",
    region: "GLOBAL",
    publisher: "Valve",
    accent: "#f5a623",
    cardImage: "/games/csgo.png",
  },
];

export interface BoostListing {
  id: string;
  game: string;
  title: string;
  fromTier: string;
  toTier: string;
  priceUsd: number;
  etaHours: number;
  boosterTag: string;
  boosterRating: number;
  ordersCompleted: number;
  rarity: Rarity;
  trending: boolean;
}

export const trendingBoosts: BoostListing[] = [];

export interface AccountListing {
  id: string;
  game: string;
  title: string;
  highlight: string;
  priceUsd: number;
  originalPriceUsd: number;
  rarity: Rarity;
  stockLeft: number;
  expiresAt: string;
  features: string[];
}

export const flashAccountDeals: AccountListing[] = [];

export interface TopUpPack {
  id: string;
  game: string;
  amount: string;
  priceUsd: number;
  bonus: string | null;
}

export const topUps: TopUpPack[] = [];
