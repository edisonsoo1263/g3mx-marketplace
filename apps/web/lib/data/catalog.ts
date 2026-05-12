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

export const games: Game[] = [
  {
    slug: "valorant",
    name: "Valorant",
    region: "GLOBAL",
    publisher: "Riot Games",
    accent: "#ff4655",
    cardImage: "/games/valorant.png",
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
    slug: "mlbb",
    name: "Mobile Legends",
    region: "SEA",
    publisher: "Moonton",
    accent: "#00d4ff",
    cardImage: "/games/mlbb.png",
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
