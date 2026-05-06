import type { Rarity } from "@/components/ui/GlowingBorder";
import type { QueueType, Region } from "@/lib/data/ranks";

export const serviceTypes = [
  "Rank Boost",
  "Placement Matches",
  "Coaching",
  "Daily Wins",
  "Achievement",
  "Win Boost",
] as const;
export type ServiceType = (typeof serviceTypes)[number];

export interface BoostListing {
  id: string;
  game: string;            // game slug — matches lib/data/catalog.ts games[].slug
  serviceType: ServiceType;
  title: string;
  fromRankId: string;
  toRankId: string;
  /** Index of fromRank in its ladder. Pre-baked for cheap filtering. */
  fromIdx: number;
  /** Index of toRank in its ladder. */
  toIdx: number;
  region: Region;
  queueType: QueueType;
  priceUsd: number;
  etaHours: number;
  responseMinutes: number;
  boosterTag: string;
  boosterAvatarSeed: string;
  boosterRating: number;
  ordersCompleted: number;
  rarity: Rarity;
  hot: boolean;
  options: {
    offlineMode: boolean;
    streamSession: boolean;
    priorityQueue: boolean;
  };
}

/**
 * Seed catalog of boost listings. Spans all six supported games. Replace with
 * a real query against Supabase / Postgres in v0.2.
 */
export const boostListings: BoostListing[] = [];

export interface CompletedOrder {
  id: string;
  boosterTag: string;
  game: string;
  fromRankId: string;
  toRankId: string;
  hoursAgo: number;
  durationHours: number;
  priceUsd: number;
}

export const recentlyCompleted: CompletedOrder[] = [];
