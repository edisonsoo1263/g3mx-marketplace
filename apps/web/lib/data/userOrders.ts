import {
  type Order,
  type OrderStatus,
  type OrderTimelineEvent,
} from "@/lib/data/orders";
import { games } from "@/lib/data/catalog";
import { getLadder } from "@/lib/data/ranks";
import type { BoostListing } from "@/lib/data/boostListings";
import {
  fetchOrdersByBuyer,
  insertOrder,
  updateOrderRecord,
  deleteOrder,
} from "@/lib/supabase/orders";

/**
 * Orders data layer — Supabase-backed.
 *
 * The "current user" filter happens server-side via WHERE buyer_user_id =
 * <privy id>. Hooks subscribe to the same `g3mx:orders-updated` event the
 * checkout drawer dispatches after a successful insert.
 */

export const ORDERS_UPDATED_EVENT = "g3mx:orders-updated";

export async function getOrders(buyerUserId: string): Promise<Order[]> {
  if (!buyerUserId) return [];
  return fetchOrdersByBuyer(buyerUserId);
}

export async function addOrder(order: Order): Promise<boolean> {
  const ok = await insertOrder(order);
  if (ok && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
  }
  return ok;
}

export async function updateOrder(
  id: string,
  patch: Partial<Order>,
): Promise<boolean> {
  const ok = await updateOrderRecord(id, patch);
  if (ok && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
  }
  return ok;
}

export async function removeOrder(id: string): Promise<boolean> {
  const ok = await deleteOrder(id);
  if (ok && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ORDERS_UPDATED_EVENT));
  }
  return ok;
}

/** ORD-XXXXXX style id using unambiguous Crockford-ish alphabet. */
export function generateOrderId(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let id = "";
  for (let i = 0; i < 6; i++) id += chars[Math.floor(Math.random() * chars.length)];
  return `ORD-${id}`;
}

// ── Listing → Order conversion ───────────────────────────────────

interface BuyerLike {
  id: string;
  walletAddress?: string | null;
}

const GAME_EMOJI: Record<string, string> = {
  valorant: "🎯",
  "league-of-legends": "⚔️",
  "genshin-impact": "✨",
  "mobile-legends": "🏆",
  cs2: "🔫",
  wow: "🐉",
  "world-of-warcraft": "🐉",
};

const GAME_ACCENT: Record<string, Order["service"]["accent"]> = {
  valorant: "magenta",
  "league-of-legends": "cyan",
  "genshin-impact": "amber",
  "mobile-legends": "violet",
  cs2: "cyan",
  wow: "amber",
  "world-of-warcraft": "amber",
};

export function gameMeta(slug: string): {
  name: string;
  emoji: string;
  accent: Order["service"]["accent"];
} {
  const matched = games.find((g) => g.slug === slug);
  return {
    name: matched?.name ?? slug,
    emoji: GAME_EMOJI[slug] ?? "🎮",
    accent: GAME_ACCENT[slug] ?? "cyan",
  };
}

export interface CheckoutPayment {
  currency: Order["pricing"]["currency"];
  chain: string;
}

export const DEFAULT_PAYMENT: CheckoutPayment = {
  currency: "USDT",
  chain: "BSC",
};

/**
 * Snapshot a listing + the current buyer into a fresh Order at "pending"
 * status. Mirrors the data shape /account/orders already renders.
 */
export function buildOrderFromListing(
  listing: BoostListing,
  buyer: BuyerLike,
  payment: CheckoutPayment = DEFAULT_PAYMENT,
): Order {
  const meta = gameMeta(listing.game);
  const ladder = getLadder(listing.game);
  const fromTier = ladder.tiers[listing.fromIdx];
  const toTier = ladder.tiers[listing.toIdx];
  const placedAt = new Date().toISOString();

  const initialEvent: OrderTimelineEvent = {
    id: "t1",
    type: "placed",
    title: "Order placed",
    detail: "Awaiting booster acceptance — funds locked in escrow.",
    at: placedAt,
  };

  return {
    id: generateOrderId(),
    buyerUserId: buyer.id,
    service: {
      game: meta.name,
      gameSlug: listing.game,
      type: listing.serviceType,
      title: listing.title,
      coverEmoji: meta.emoji,
      accent: meta.accent,
    },
    booster: {
      handle: cleanHandle(listing.boosterTag),
      rating: listing.boosterRating,
      totalCompleted: listing.ordersCompleted,
    },
    ranks: {
      from: fromTier?.label ?? "—",
      to: toTier?.label ?? "—",
      progress: 0,
    },
    pricing: {
      amount: listing.priceUsd,
      currency: payment.currency,
      chain: payment.chain,
    },
    options: {
      offline: listing.options.offlineMode,
      streamAlong: listing.options.streamSession,
      priority: listing.options.priorityQueue,
      region: listing.region,
      queue: listing.queueType,
    },
    status: "pending" as OrderStatus,
    sla: {
      etaHours: listing.etaHours,
      placedAt,
    },
    timeline: [initialEvent],
    unreadMessages: 0,
  };
}

function cleanHandle(tag: string): string {
  return tag.replace(/^@/, "").trim() || "booster";
}
