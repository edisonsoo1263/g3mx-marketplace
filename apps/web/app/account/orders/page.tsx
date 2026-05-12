"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Inbox,
  Lock,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";
import {
  ACTIVE_STATUSES,
  COMPLETED_STATUSES,
  filterOrdersByTab,
  ISSUE_STATUSES,
  type Order,
  type OrderTab,
} from "@/lib/data/orders";
import { useOrders } from "@/hooks/useOrders";
import { OrderCard } from "@/components/orders/OrderCard";
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";

const TABS: Array<{ value: OrderTab; label: string; iconLabel?: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "issues", label: "Issues" },
];

export default function MyOrdersPage() {
  const { user, isReady, isAuthenticated, loginWithWallet } = useAuth();
  const [tab, setTab] = useState<OrderTab>("all");
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Real orders for the current authenticated user, persisted in localStorage
  // until the backend is wired. Empty array when the user has never bought —
  // they'll see the empty state and a CTA to browse boosts.
  const orders = useOrders();

  const counts = useMemo(() => {
    return {
      all: orders.length,
      active: orders.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      completed: orders.filter((o) => COMPLETED_STATUSES.includes(o.status))
        .length,
      issues: orders.filter((o) => ISSUE_STATUSES.includes(o.status)).length,
    };
  }, [orders]);

  const stats = useMemo(() => {
    const totalSpent = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "refunded")
      .reduce((sum, o) => sum + o.pricing.amount, 0);
    return {
      totalSpent,
      activeCount: counts.active,
      completedCount: counts.completed,
      unreadMessages: orders.reduce((sum, o) => sum + o.unreadMessages, 0),
    };
  }, [orders, counts.active, counts.completed]);

  const visible = useMemo(
    () => filterOrdersByTab(orders, tab),
    [orders, tab],
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <Link
          href="/boosts"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to marketplace
        </Link>

        <header className="space-y-3">
          <PixelBadge tone="cyan">
            <Package className="size-3" /> Buyer dashboard
          </PixelBadge>
          <h1
            className="font-display font-black tracking-tight text-white"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            My Orders
          </h1>
          <p className="text-white/70 max-w-2xl">
            Track every boost you&apos;ve commissioned, message the booster, and
            release escrow once the work checks out. New activity surfaces here
            in real time.
          </p>
        </header>

        {!isReady ? (
          <SkeletonState />
        ) : !isAuthenticated || !user ? (
          <ConnectGate
            onConnect={() => loginWithWallet().catch(() => undefined)}
          />
        ) : (
          <>
            <StatRow
              totalSpent={stats.totalSpent}
              activeCount={stats.activeCount}
              completedCount={stats.completedCount}
              unreadMessages={stats.unreadMessages}
            />

            <Tabs current={tab} counts={counts} onChange={setTab} />

            {visible.length === 0 ? (
              <EmptyState tab={tab} />
            ) : (
              <ul className="space-y-3">
                {visible.map((o) => (
                  <li key={o.id}>
                    <OrderCard order={o} onOpen={setActiveOrder} />
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </main>
      <Footer />
      <OrderDetailDrawer
        order={activeOrder}
        onClose={() => setActiveOrder(null)}
      />
    </>
  );
}

// ── Stats ──────────────────────────────────────────────────────

function StatRow({
  totalSpent,
  activeCount,
  completedCount,
  unreadMessages,
}: {
  totalSpent: number;
  activeCount: number;
  completedCount: number;
  unreadMessages: number;
}) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Stat
        label="Total spent"
        value={`$${totalSpent.toFixed(2)}`}
        sub="Across all orders"
        accent="cyan"
        icon={Wallet}
      />
      <Stat
        label="Active"
        value={String(activeCount)}
        sub="Currently in flight"
        accent="magenta"
        icon={Sparkles}
      />
      <Stat
        label="Completed"
        value={String(completedCount)}
        sub="Successfully delivered"
        accent="success"
        icon={ShieldCheck}
      />
      <Stat
        label="Unread"
        value={String(unreadMessages)}
        sub="Messages from boosters"
        accent="amber"
        icon={Inbox}
        pulse={unreadMessages > 0}
      />
    </div>
  );
}

const STAT_ACCENT: Record<string, string> = {
  cyan: "var(--color-neon-cyan)",
  magenta: "var(--color-neon-magenta)",
  amber: "var(--color-neon-amber)",
  success: "var(--color-success)",
};

function Stat({
  label,
  value,
  sub,
  accent,
  icon: Icon,
  pulse,
}: {
  label: string;
  value: string;
  sub: string;
  accent: keyof typeof STAT_ACCENT;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  pulse?: boolean;
}) {
  const c = STAT_ACCENT[accent];
  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
          {label}
        </span>
        <span
          aria-hidden
          className="grid place-items-center size-8 rounded-full"
          style={{
            background: `${c}1a`,
            border: `1px solid ${c}55`,
            boxShadow: pulse ? `0 0 14px ${c}` : undefined,
          }}
        >
          <Icon className="size-3.5" style={{ color: c }} />
        </span>
      </div>
      <div
        className="mt-2 font-display text-2xl font-bold text-white tabular-nums"
        style={{ textShadow: pulse ? `0 0 16px ${c}` : undefined }}
      >
        {value}
      </div>
      <div className="text-[11px] text-white/55 mt-0.5">{sub}</div>
    </div>
  );
}

// ── Tabs ───────────────────────────────────────────────────────

function Tabs({
  current,
  counts,
  onChange,
}: {
  current: OrderTab;
  counts: Record<OrderTab, number>;
  onChange: (t: OrderTab) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-[var(--color-border-subtle)] pb-3">
      {TABS.map((t) => {
        const active = current === t.value;
        const count = counts[t.value];
        return (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 h-9 rounded-full",
              "text-sm font-medium cursor-pointer",
              "transition-[border-color,background-color,color]",
              active
                ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-white border"
                : "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 text-white/70 hover:text-white hover:border-[var(--color-border-strong)]",
            )}
          >
            {t.label}
            <span
              className={cn(
                "min-w-[20px] h-5 px-1.5 rounded-full grid place-items-center text-[10px] font-mono tabular-nums",
                active
                  ? "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]"
                  : "bg-white/5 text-white/55",
              )}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── States ─────────────────────────────────────────────────────

function SkeletonState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-[100px] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
          />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[160px] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ tab }: { tab: OrderTab }) {
  const messages: Record<OrderTab, { title: string; sub: string; cta: string }> = {
    all: {
      title: "No orders yet",
      sub: "When you commission a boost, it'll show up here with live progress.",
      cta: "Browse boosts",
    },
    active: {
      title: "Nothing in flight",
      sub: "All your orders are wrapped up. Time to climb again?",
      cta: "Find a boost",
    },
    completed: {
      title: "No completed boosts yet",
      sub: "Your finished orders will land here once escrow releases.",
      cta: "Browse boosts",
    },
    issues: {
      title: "No issues — clean slate",
      sub: "Disputes, refunds, and cancellations would show up here.",
      cta: "Browse boosts",
    },
  };
  const msg = messages[tab];
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-10 md:p-14 text-center">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
        <ShoppingBag className="size-6 text-[var(--color-neon-cyan)]" />
      </div>
      <h2 className="font-display text-xl font-bold text-white">
        {msg.title}
      </h2>
      <p className="mt-2 text-white/65 max-w-md mx-auto text-sm">{msg.sub}</p>
      <div className="mt-6">
        <Link
          href="/boosts"
          className={cn(
            "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full",
            "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
            "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
            "transition-[filter,transform] duration-150",
          )}
        >
          {msg.cta}
        </Link>
      </div>
    </div>
  );
}

// ── Auth gate ──────────────────────────────────────────────────

function ConnectGate({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
        <Lock className="size-6 text-[var(--color-neon-cyan)]" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white">
        Sign in to see your orders
      </h2>
      <p className="mt-2 text-white/70 max-w-md mx-auto">
        Your boosts, escrow status, and booster chats live behind your wallet
        or social login.
      </p>
      <div className="mt-7">
        <Button size="lg" onClick={onConnect}>
          Connect wallet or social
        </Button>
      </div>
    </div>
  );
}
