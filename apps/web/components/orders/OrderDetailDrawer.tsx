"use client";

import { useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CheckCircle2,
  Copy,
  ExternalLink,
  MessageSquare,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Star,
  Tv,
  X,
  Zap,
} from "lucide-react";
import { TokenIcon, NetworkIcon } from "@web3icons/react/dynamic";
import { cn } from "@/lib/utils/cn";
import {
  formatCountdown,
  formatOrderId,
  formatPrice,
  formatRelativeTime,
  ORDER_STATUS_META,
  type Order,
} from "@/lib/data/orders";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { OrderTimeline } from "./OrderTimeline";

interface Props {
  order: Order | null;
  onClose: () => void;
}

const ACCENT_COLOR = {
  cyan: "var(--color-neon-cyan)",
  magenta: "var(--color-neon-magenta)",
  violet: "var(--color-neon-violet)",
  amber: "var(--color-neon-amber)",
} as const;

export function OrderDetailDrawer({ order, onClose }: Props) {
  const reduced = useReducedMotion();

  // Esc handler — only when open
  useEffect(() => {
    if (!order) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [order, onClose]);

  return (
    <AnimatePresence>
      {order && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            role="dialog"
            aria-label={`Order ${order.id}`}
            initial={
              reduced ? { opacity: 0 } : { x: "100%", opacity: 0.6 }
            }
            animate={
              reduced ? { opacity: 1 } : { x: 0, opacity: 1 }
            }
            exit={
              reduced ? { opacity: 0 } : { x: "100%", opacity: 0.6 }
            }
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-[60] flex flex-col",
              "inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[480px] lg:w-[540px]",
              "bg-[var(--color-bg-panel)] border-l border-[var(--color-border-strong)]",
              "shadow-[0_24px_64px_rgb(0_0_0_/_60%)] overflow-hidden",
            )}
          >
            <DrawerHeader order={order} onClose={onClose} />
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-6">
              <ServiceBlock order={order} />
              <BoosterBlock order={order} />
              <OptionsBlock order={order} />
              <PricingBlock order={order} />
              <TimelineBlock order={order} />
            </div>
            <DrawerActions order={order} onClose={onClose} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Header ─────────────────────────────────────────────────────

function DrawerHeader({ order, onClose }: { order: Order; onClose: () => void }) {
  return (
    <header className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/60 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <OrderStatusBadge status={order.status} />
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
          {formatOrderId(order.id)}
        </span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid place-items-center size-9 rounded-md text-white/65 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors cursor-pointer"
      >
        <X className="size-5" />
      </button>
    </header>
  );
}

// ── Sections ───────────────────────────────────────────────────

function ServiceBlock({ order }: { order: Order }) {
  const accent = ACCENT_COLOR[order.service.accent];
  return (
    <section>
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="grid place-items-center size-14 rounded-xl text-3xl shrink-0"
          style={{
            background: `${accent}1f`,
            border: `1px solid ${accent}55`,
            boxShadow: `0 0 24px ${accent}25`,
          }}
        >
          {order.service.coverEmoji}
        </span>
        <div className="min-w-0 leading-tight pt-0.5">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
            {order.service.game} · {order.service.type}
          </div>
          <h2 className="mt-1 font-display text-xl font-bold text-white">
            {order.service.title}
          </h2>
          <div className="mt-1.5 text-sm text-white/75">
            <span className="font-mono">{order.ranks.from}</span>
            <span className="mx-2 text-white/40">→</span>
            <span className="font-mono text-white">{order.ranks.to}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-white/55 italic">
        {ORDER_STATUS_META[order.status].description}
      </div>
    </section>
  );
}

function BoosterBlock({ order }: { order: Order }) {
  return (
    <section className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-4">
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-2">
        Booster
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden
            className="grid place-items-center size-10 rounded-full shrink-0 font-semibold text-white"
            style={{
              background: `linear-gradient(135deg, hsl(${hash(order.booster.handle) % 360} 80% 55%), hsl(${(hash(order.booster.handle) + 60) % 360} 90% 60%))`,
            }}
          >
            {order.booster.handle.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-sm font-semibold text-white">
              @{order.booster.handle}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-white/65 mt-0.5">
              <Star className="size-3 fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]" />
              <span className="font-mono tabular-nums">
                {order.booster.rating.toFixed(2)}
              </span>
              <span className="text-white/30">·</span>
              <span>{order.booster.totalCompleted} completed</span>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] text-xs font-medium text-white hover:border-[var(--color-neon-cyan)]/50 transition-colors cursor-pointer"
        >
          <MessageSquare className="size-3.5" />
          Message
          {order.unreadMessages > 0 && (
            <span className="ml-0.5 grid place-items-center min-w-[16px] h-[16px] px-1 rounded-full bg-[var(--color-neon-amber)] text-[var(--color-text-inverse)] text-[9px] font-bold">
              {order.unreadMessages}
            </span>
          )}
        </button>
      </div>
    </section>
  );
}

function OptionsBlock({ order }: { order: Order }) {
  const items: Array<{ label: string; value: string; icon?: React.ComponentType<{ className?: string }>; active?: boolean }> = [
    { label: "Region", value: order.options.region },
    { label: "Queue", value: order.options.queue },
    { label: "ETA", value: `${order.sla.etaHours}h` },
  ];

  const flags: Array<{ label: string; on: boolean; icon: React.ComponentType<{ className?: string }> }> = [
    { label: "Offline mode", on: order.options.offline, icon: ShieldCheck },
    { label: "Stream-along", on: order.options.streamAlong, icon: Tv },
    { label: "Priority queue", on: order.options.priority, icon: Zap },
  ];

  return (
    <section>
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-2">
        Order options
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {items.map((it) => (
          <div
            key={it.label}
            className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 px-3 py-2"
          >
            <div className="text-[10px] font-mono text-white/45 uppercase tracking-[0.2em]">
              {it.label}
            </div>
            <div className="text-sm font-semibold text-white mt-0.5">
              {it.value}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {flags.map((f) => (
          <span
            key={f.label}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border",
              f.on
                ? "border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/10 text-white"
                : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 text-white/40 line-through",
            )}
          >
            <f.icon className="size-3" />
            {f.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function PricingBlock({ order }: { order: Order }) {
  const escrowReleased = order.pricing.escrowReleased ?? order.status === "completed";
  const refunded = order.status === "refunded" || order.status === "cancelled";

  return (
    <section className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
          Payment
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full text-[10px] font-mono uppercase tracking-[0.18em] border",
            refunded
              ? "border-white/15 bg-white/5 text-white/55"
              : escrowReleased
                ? "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]"
                : "border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)]",
          )}
        >
          {refunded ? (
            <RotateCcw className="size-3" />
          ) : escrowReleased ? (
            <CheckCircle2 className="size-3" />
          ) : (
            <ShieldAlert className="size-3" />
          )}
          {refunded
            ? "Refunded"
            : escrowReleased
              ? "Released"
              : "In escrow"}
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-2xl font-bold text-white tabular-nums">
          {formatPrice(order.pricing.amount, order.pricing.currency)}
        </span>
        <span className="text-[11px] font-mono text-white/55 inline-flex items-center gap-1">
          <TokenIcon
            symbol={order.pricing.currency}
            size={14}
            variant="branded"
          />
          <span>{order.pricing.currency}</span>
          <span className="text-white/30 mx-0.5">on</span>
          <NetworkIcon
            name={chainToNetworkId(order.pricing.chain)}
            size={14}
            variant="branded"
          />
          <span>{order.pricing.chain ?? "BSC"}</span>
        </span>
      </div>
      {order.status === "review" && order.sla.autoReleaseAt && (
        <div className="mt-3 pt-3 border-t border-[var(--color-border-subtle)] text-[11px] text-white/65">
          Auto-release in{" "}
          <span className="font-mono text-[var(--color-neon-violet)]">
            {formatCountdown(order.sla.autoReleaseAt)}
          </span>{" "}
          if you don&apos;t verify.
        </div>
      )}
    </section>
  );
}

function TimelineBlock({ order }: { order: Order }) {
  return (
    <section>
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-3">
        Timeline
      </div>
      <OrderTimeline events={order.timeline} />
      <div className="mt-3 text-[10px] font-mono text-white/35">
        Placed {formatRelativeTime(order.sla.placedAt)}
      </div>
    </section>
  );
}

// ── Footer actions ─────────────────────────────────────────────

function DrawerActions({ order, onClose }: { order: Order; onClose: () => void }) {
  const actions = pickActions(order);
  if (actions.length === 0) return null;

  function handleCopyId() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(order.id);
  }

  return (
    <footer className="px-4 sm:px-6 py-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/60 shrink-0">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopyId}
          aria-label="Copy order ID"
          title="Copy order ID"
          className="grid place-items-center size-10 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)] text-white/65 hover:text-white hover:border-[var(--color-border-strong)] cursor-pointer transition-colors"
        >
          <Copy className="size-4" />
        </button>
        <div className="flex-1 grid grid-flow-col auto-cols-fr gap-2">
          {actions.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => {
                a.onClick?.();
                if (a.closeOnClick) onClose();
              }}
              className={cn(
                "inline-flex items-center justify-center gap-1.5 h-10 px-3 rounded-full",
                "text-xs font-semibold cursor-pointer select-none",
                "transition-[background-color,border-color,filter,transform] duration-150",
                a.kind === "primary"
                  ? "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)] hover:brightness-110 active:scale-[0.98]"
                  : a.kind === "danger"
                    ? "border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)] hover:bg-[var(--color-danger)]/15"
                    : "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] text-white hover:border-[var(--color-border-strong)]",
              )}
            >
              {a.icon && <a.icon className="size-3.5" />}
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}

interface OrderAction {
  label: string;
  kind: "primary" | "secondary" | "danger";
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  closeOnClick?: boolean;
}

function pickActions(order: Order): OrderAction[] {
  switch (order.status) {
    case "in_progress":
      return [
        ...(order.options.streamAlong
          ? [{ label: "Watch stream", kind: "secondary" as const, icon: Tv }]
          : []),
        { label: "Open chat", kind: "primary" as const, icon: MessageSquare },
      ];
    case "accepted":
    case "pending":
      return [
        { label: "Open chat", kind: "secondary" as const, icon: MessageSquare },
        { label: "Cancel", kind: "danger" as const, icon: X },
      ];
    case "review":
      return [
        { label: "Request changes", kind: "secondary" as const, icon: RotateCcw },
        {
          label: "Approve & release",
          kind: "primary" as const,
          icon: CheckCircle2,
        },
      ];
    case "completed":
      return [
        { label: "Receipt", kind: "secondary" as const, icon: ExternalLink },
        { label: "Leave review", kind: "primary" as const, icon: Star },
      ];
    case "disputed":
      return [
        { label: "View dispute", kind: "secondary" as const, icon: ArrowUpRight },
      ];
    case "refunded":
    case "cancelled":
      return [
        { label: "View receipt", kind: "secondary" as const, icon: ExternalLink },
      ];
    default:
      return [];
  }
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const CHAIN_TO_NETWORK: Record<string, string> = {
  BSC: "bsc",
  HyperEVM: "hyperliquid",
  Ethereum: "ethereum",
  Polygon: "polygon",
  Arbitrum: "arbitrum",
};

function chainToNetworkId(chain: string | undefined): string {
  if (!chain) return "bsc";
  return CHAIN_TO_NETWORK[chain] ?? chain.toLowerCase();
}
