/**
 * Order types + seed mock data.
 *
 * Lives entirely client-side for now — replace with API + DB persistence
 * (Supabase / Postgres) once the backend is wired. Shape mirrors what the
 * server would return: a snapshot of the listing at order time so the UI
 * keeps working even if the listing is later edited or removed.
 */

export type OrderStatus =
  | "pending" // awaiting booster acceptance
  | "accepted" // booster confirmed, queued
  | "in_progress" // booster actively working
  | "review" // booster marked complete; buyer has 72h to verify
  | "completed" // escrow released
  | "disputed" // manual review by support
  | "refunded" // funds returned
  | "cancelled"; // cancelled pre-start

export type OrderTab = "all" | "active" | "completed" | "issues";

export type OrderTimelineType =
  | "placed"
  | "accepted"
  | "started"
  | "milestone"
  | "review_pending"
  | "completed"
  | "disputed"
  | "message"
  | "refunded"
  | "cancelled";

export interface OrderTimelineEvent {
  id: string;
  type: OrderTimelineType;
  title: string;
  detail?: string;
  at: string; // ISO
}

export interface Order {
  id: string; // ORD-XXXXXX
  /**
   * Privy user id of the buyer who placed the order. Optional for legacy
   * seed/mock data; required for orders created via checkout.
   */
  buyerUserId?: string;
  service: {
    game: string;
    gameSlug: string;
    type: string;
    title: string;
    coverEmoji: string;
    accent: "cyan" | "magenta" | "violet" | "amber";
  };
  booster: {
    handle: string;
    rating: number; // 0–5
    totalCompleted: number;
  };
  ranks: {
    from: string;
    to: string;
    progress: number; // 0..1
  };
  pricing: {
    amount: number;
    currency: "USDT" | "BNB" | "USD" | "HYPE" | "USDC";
    /** Human-friendly chain name where escrow lives (e.g. "BSC", "HyperEVM"). */
    chain?: string;
    escrowReleased?: boolean;
  };
  options: {
    offline: boolean;
    streamAlong: boolean;
    priority: boolean;
    region: string;
    queue: string;
  };
  status: OrderStatus;
  sla: {
    etaHours: number;
    placedAt: string;
    acceptedAt?: string;
    startedAt?: string;
    completedAt?: string;
    /** ISO time after which escrow auto-releases to booster if buyer doesn't act. */
    autoReleaseAt?: string;
  };
  timeline: OrderTimelineEvent[];
  unreadMessages: number;
}

export const ACTIVE_STATUSES: OrderStatus[] = [
  "pending",
  "accepted",
  "in_progress",
  "review",
];
export const COMPLETED_STATUSES: OrderStatus[] = ["completed"];
export const ISSUE_STATUSES: OrderStatus[] = [
  "disputed",
  "refunded",
  "cancelled",
];

export interface OrderStatusMeta {
  label: string;
  /** CSS color token reference (e.g. "var(--color-neon-cyan)"). */
  color: string;
  description: string;
  /** Tailwind-style accent for badges (background tint). */
  tone: "amber" | "cyan" | "violet" | "success" | "danger" | "muted";
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  pending: {
    label: "Pending",
    color: "var(--color-neon-amber)",
    description: "Waiting for booster acceptance",
    tone: "amber",
  },
  accepted: {
    label: "Accepted",
    color: "var(--color-neon-cyan)",
    description: "Booster confirmed — starting soon",
    tone: "cyan",
  },
  in_progress: {
    label: "In progress",
    color: "var(--color-neon-cyan)",
    description: "Booster is actively working",
    tone: "cyan",
  },
  review: {
    label: "Review",
    color: "var(--color-neon-violet)",
    description: "Verify completion within 72h",
    tone: "violet",
  },
  completed: {
    label: "Completed",
    color: "var(--color-success)",
    description: "Delivered — escrow released",
    tone: "success",
  },
  disputed: {
    label: "Disputed",
    color: "var(--color-danger)",
    description: "Support is reviewing your case",
    tone: "danger",
  },
  refunded: {
    label: "Refunded",
    color: "var(--color-text-muted, oklch(60% 0 0))",
    description: "Funds returned to your wallet",
    tone: "muted",
  },
  cancelled: {
    label: "Cancelled",
    color: "var(--color-text-muted, oklch(60% 0 0))",
    description: "Cancelled before start — auto-refunded",
    tone: "muted",
  },
};

// ── Seed data ────────────────────────────────────────────────────

const NOW = Date.now();
const days = (n: number) => new Date(NOW - n * 24 * 60 * 60 * 1000).toISOString();
const hrs = (n: number) => new Date(NOW - n * 60 * 60 * 1000).toISOString();
const futureHrs = (n: number) =>
  new Date(NOW + n * 60 * 60 * 1000).toISOString();

export const MOCK_ORDERS: Order[] = [
  // 1. In progress with active stream
  {
    id: "ORD-7K2N9X",
    service: {
      game: "Valorant",
      gameSlug: "valorant",
      type: "Rank Boost",
      title: "Platinum → Diamond Solo Boost",
      coverEmoji: "🎯",
      accent: "magenta",
    },
    booster: { handle: "phantom_ace", rating: 4.9, totalCompleted: 247 },
    ranks: { from: "Platinum II", to: "Diamond I", progress: 0.62 },
    pricing: { amount: 89.99, currency: "USDT" },
    options: {
      offline: true,
      streamAlong: true,
      priority: false,
      region: "NA",
      queue: "Solo/Duo",
    },
    status: "in_progress",
    sla: {
      etaHours: 18,
      placedAt: hrs(11),
      acceptedAt: hrs(10.5),
      startedAt: hrs(8),
    },
    timeline: [
      { id: "t1", type: "placed", title: "Order placed", at: hrs(11) },
      {
        id: "t2",
        type: "accepted",
        title: "Booster accepted",
        detail: "@phantom_ace queued the boost — starting within the hour",
        at: hrs(10.5),
      },
      { id: "t3", type: "started", title: "Boost started", at: hrs(8) },
      {
        id: "t4",
        type: "milestone",
        title: "Platinum II → Platinum I",
        detail: "5W 2L during the climb",
        at: hrs(5),
      },
      {
        id: "t5",
        type: "milestone",
        title: "Promotion to Diamond",
        detail: "Currently 3W 0L into a 4-win streak",
        at: hrs(2),
      },
    ],
    unreadMessages: 2,
  },
  // 2. Awaiting buyer review
  {
    id: "ORD-5L1P4R",
    service: {
      game: "League of Legends",
      gameSlug: "league-of-legends",
      type: "Placement Matches",
      title: "10 Placement Matches · 80% Win Target",
      coverEmoji: "⚔️",
      accent: "cyan",
    },
    booster: { handle: "midlane_god", rating: 4.95, totalCompleted: 412 },
    ranks: { from: "Unranked", to: "Gold IV", progress: 1 },
    pricing: { amount: 64.0, currency: "USDT" },
    options: {
      offline: false,
      streamAlong: false,
      priority: true,
      region: "EUW",
      queue: "Solo/Duo",
    },
    status: "review",
    sla: {
      etaHours: 24,
      placedAt: days(2),
      acceptedAt: days(2),
      startedAt: days(2),
      completedAt: hrs(6),
      autoReleaseAt: futureHrs(66),
    },
    timeline: [
      { id: "t1", type: "placed", title: "Order placed", at: days(2) },
      { id: "t2", type: "accepted", title: "Booster accepted", at: days(2) },
      { id: "t3", type: "started", title: "Boost started", at: days(2) },
      {
        id: "t4",
        type: "milestone",
        title: "5 of 10 placements complete",
        detail: "4W 1L — on pace for Gold",
        at: hrs(20),
      },
      {
        id: "t5",
        type: "review_pending",
        title: "Booster marked complete",
        detail: "Final rank: Gold IV. Verify within 72h or escrow auto-releases.",
        at: hrs(6),
      },
    ],
    unreadMessages: 1,
  },
  // 3. Just accepted, hasn't started
  {
    id: "ORD-3M8B2Q",
    service: {
      game: "Genshin Impact",
      gameSlug: "genshin-impact",
      type: "Spiral Abyss",
      title: "Spiral Abyss Floor 12 · Full 36★",
      coverEmoji: "✨",
      accent: "amber",
    },
    booster: { handle: "abyss_runner", rating: 4.85, totalCompleted: 89 },
    ranks: { from: "Floor 11 · 27★", to: "Floor 12 · 36★", progress: 0 },
    pricing: { amount: 35.0, currency: "USDT" },
    options: {
      offline: true,
      streamAlong: false,
      priority: false,
      region: "Asia",
      queue: "Single account",
    },
    status: "accepted",
    sla: {
      etaHours: 12,
      placedAt: hrs(2),
      acceptedAt: hrs(1.5),
    },
    timeline: [
      { id: "t1", type: "placed", title: "Order placed", at: hrs(2) },
      {
        id: "t2",
        type: "accepted",
        title: "Booster accepted",
        detail: "@abyss_runner is waiting on your temporary login.",
        at: hrs(1.5),
      },
    ],
    unreadMessages: 1,
  },
  // 4. Completed
  {
    id: "ORD-9T6W3M",
    service: {
      game: "Mobile Legends",
      gameSlug: "mobile-legends",
      type: "Mythic Climb",
      title: "Legend → Mythic Climb (50★)",
      coverEmoji: "🏆",
      accent: "violet",
    },
    booster: { handle: "ml_warlord", rating: 4.8, totalCompleted: 612 },
    ranks: { from: "Legend V", to: "Mythic", progress: 1 },
    pricing: { amount: 29.99, currency: "USDT", escrowReleased: true },
    options: {
      offline: true,
      streamAlong: false,
      priority: false,
      region: "SEA",
      queue: "Solo",
    },
    status: "completed",
    sla: {
      etaHours: 36,
      placedAt: days(8),
      acceptedAt: days(8),
      startedAt: days(8),
      completedAt: days(6),
    },
    timeline: [
      { id: "t1", type: "placed", title: "Order placed", at: days(8) },
      { id: "t2", type: "accepted", title: "Booster accepted", at: days(8) },
      { id: "t3", type: "started", title: "Boost started", at: days(8) },
      {
        id: "t4",
        type: "completed",
        title: "Order completed",
        detail: "Reached Mythic. Escrow released to booster.",
        at: days(6),
      },
    ],
    unreadMessages: 0,
  },
  // 5. Disputed
  {
    id: "ORD-2H4K8Y",
    service: {
      game: "CS2",
      gameSlug: "cs2",
      type: "Faceit Boost",
      title: "Faceit Level 7 → Level 10",
      coverEmoji: "🔫",
      accent: "cyan",
    },
    booster: { handle: "ak_one_tap", rating: 4.6, totalCompleted: 134 },
    ranks: { from: "Faceit 7", to: "Faceit 10", progress: 0.4 },
    pricing: { amount: 119.0, currency: "USDT" },
    options: {
      offline: false,
      streamAlong: true,
      priority: false,
      region: "EU",
      queue: "Solo",
    },
    status: "disputed",
    sla: {
      etaHours: 72,
      placedAt: days(5),
      acceptedAt: days(5),
      startedAt: days(5),
    },
    timeline: [
      { id: "t1", type: "placed", title: "Order placed", at: days(5) },
      { id: "t2", type: "accepted", title: "Booster accepted", at: days(5) },
      { id: "t3", type: "started", title: "Boost started", at: days(5) },
      { id: "t4", type: "milestone", title: "Level 7 → Level 8", at: days(3) },
      {
        id: "t5",
        type: "disputed",
        title: "Dispute opened",
        detail: "Booster inactive for 48h. Support is reviewing your case.",
        at: hrs(20),
      },
    ],
    unreadMessages: 0,
  },
  // 6. Cancelled before start
  {
    id: "ORD-8X3D1F",
    service: {
      game: "World of Warcraft",
      gameSlug: "wow",
      type: "Mythic+ Dungeon",
      title: "Weekly +20 Mythic Dungeon Boost",
      coverEmoji: "🐉",
      accent: "amber",
    },
    booster: { handle: "horde_main", rating: 4.7, totalCompleted: 78 },
    ranks: { from: "+15 io", to: "+20 io", progress: 0 },
    pricing: { amount: 75.0, currency: "USDT", escrowReleased: false },
    options: {
      offline: false,
      streamAlong: false,
      priority: true,
      region: "NA",
      queue: "Group",
    },
    status: "cancelled",
    sla: {
      etaHours: 6,
      placedAt: days(10),
    },
    timeline: [
      { id: "t1", type: "placed", title: "Order placed", at: days(10) },
      {
        id: "t2",
        type: "cancelled",
        title: "Cancelled by you",
        detail: "Refund issued back to your wallet.",
        at: days(10),
      },
    ],
    unreadMessages: 0,
  },
];

// ── Helpers ──────────────────────────────────────────────────────

export function filterOrdersByTab(orders: Order[], tab: OrderTab): Order[] {
  if (tab === "all") return orders;
  if (tab === "active")
    return orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
  if (tab === "completed")
    return orders.filter((o) => COMPLETED_STATUSES.includes(o.status));
  return orders.filter((o) => ISSUE_STATUSES.includes(o.status));
}

export function formatRelativeTime(iso: string, now: number = Date.now()): string {
  const diffMs = now - new Date(iso).getTime();
  if (diffMs < 0) return formatRelativeFuture(-diffMs);
  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatRelativeFuture(ms: number): string {
  const min = Math.floor(ms / 60000);
  if (min < 60) return `in ${min}m`;
  const h = Math.floor(min / 60);
  if (h < 24) return `in ${h}h`;
  const d = Math.floor(h / 24);
  return `in ${d}d`;
}

export function formatCountdown(iso: string, now: number = Date.now()): string {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "expired";
  const min = Math.floor(ms / 60000);
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const remMin = min % 60;
  if (h < 24) return `${h}h ${remMin}m`;
  const d = Math.floor(h / 24);
  const remH = h % 24;
  return `${d}d ${remH}h`;
}

export function formatPrice(amount: number, currency: string): string {
  if (currency === "USD") return `$${amount.toFixed(2)}`;
  return `${amount.toFixed(2)} ${currency}`;
}

export function formatOrderId(id: string): string {
  // Pretty-print: ORD-7K2N9X → ORD · 7K2N9X
  const parts = id.split("-");
  if (parts.length === 2) return `${parts[0]} · ${parts[1]}`;
  return id;
}
