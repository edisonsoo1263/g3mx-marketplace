"use client";

import { ChevronRight, MessageSquare, Star, Tv, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  formatCountdown,
  formatOrderId,
  formatPrice,
  formatRelativeTime,
  type Order,
} from "@/lib/data/orders";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface Props {
  order: Order;
  onOpen: (order: Order) => void;
}

const ACCENT_COLOR: Record<Order["service"]["accent"], string> = {
  cyan: "var(--color-neon-cyan)",
  magenta: "var(--color-neon-magenta)",
  violet: "var(--color-neon-violet)",
  amber: "var(--color-neon-amber)",
};

export function OrderCard({ order, onOpen }: Props) {
  const accent = ACCENT_COLOR[order.service.accent];
  const progressPct = Math.round(order.ranks.progress * 100);
  const isInProgress = order.status === "in_progress";
  const placedAgo = formatRelativeTime(order.sla.placedAt);

  // Compute the "live ETA" countdown — when boost is active and SLA is in-flight
  const etaText = (() => {
    if (
      isInProgress &&
      order.sla.startedAt &&
      progressPct < 100
    ) {
      const startedAt = new Date(order.sla.startedAt).getTime();
      const dueAt = startedAt + order.sla.etaHours * 60 * 60 * 1000;
      return formatCountdown(new Date(dueAt).toISOString());
    }
    if (order.status === "review" && order.sla.autoReleaseAt) {
      return `Auto-release ${formatCountdown(order.sla.autoReleaseAt)}`;
    }
    if (order.status === "accepted") return "Starting soon";
    if (order.status === "completed") return "Delivered";
    return null;
  })();

  return (
    <button
      type="button"
      onClick={() => onOpen(order)}
      className={cn(
        "group relative w-full text-left",
        "rounded-2xl border border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-panel)]/70 hover:bg-[var(--color-bg-panel)]",
        "p-4 sm:p-5 cursor-pointer transition-[border-color,background-color,transform]",
        "hover:border-[var(--color-border-strong)] hover:-translate-y-0.5",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)]/60",
      )}
    >
      {/* Top row: cover + game/type + status */}
      <div className="flex items-start gap-4">
        <span
          aria-hidden
          className="grid place-items-center size-12 sm:size-14 rounded-xl shrink-0 text-2xl sm:text-3xl"
          style={{
            background: `${accent}1f`,
            border: `1px solid ${accent}55`,
            boxShadow: `0 0 24px ${accent}25`,
          }}
        >
          {order.service.coverEmoji}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
                {order.service.game} · {order.service.type}
              </div>
              <div className="mt-1 text-sm sm:text-base font-semibold text-white truncate">
                {order.service.title}
              </div>
              <div className="mt-1 text-xs text-white/65">
                <span className="font-mono">{order.ranks.from}</span>
                <span className="mx-1.5 text-white/40">→</span>
                <span className="font-mono text-white">{order.ranks.to}</span>
              </div>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
      </div>

      {/* Progress bar (only if relevant) */}
      {(isInProgress || order.status === "accepted" || order.status === "review") && (
        <div className="mt-4">
          <div className="h-1.5 rounded-full overflow-hidden bg-[var(--color-bg-panel-elevated)]">
            <div
              className="h-full transition-[width] duration-[var(--duration-slow,_500ms)]"
              style={{
                width: `${Math.max(2, progressPct)}%`,
                background: `linear-gradient(90deg, ${accent}, var(--color-neon-cyan))`,
                boxShadow: `0 0 8px ${accent}`,
              }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-white/55">
            <span>{progressPct}%</span>
            {etaText && <span className="text-white/70">{etaText}</span>}
          </div>
        </div>
      )}

      {/* Bottom row: booster + options + price + cta */}
      <div className="mt-4 pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden
            className="grid place-items-center size-7 rounded-full shrink-0 text-xs font-semibold"
            style={{
              background: `linear-gradient(135deg, hsl(${hash(order.booster.handle) % 360} 80% 55%), hsl(${(hash(order.booster.handle) + 60) % 360} 90% 60%))`,
            }}
          >
            {order.booster.handle.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-xs font-medium text-white truncate">
              @{order.booster.handle}
            </div>
            <div className="flex items-center gap-1 text-[10px] text-white/55">
              <Star
                className="size-2.5 fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]"
              />
              <span className="font-mono tabular-nums">
                {order.booster.rating.toFixed(2)}
              </span>
              <span className="text-white/30">·</span>
              <span>{order.booster.totalCompleted} done</span>
            </div>
          </div>

          {/* Option chips, only the active ones */}
          <div className="hidden md:flex items-center gap-1 ml-3 shrink-0">
            {order.options.streamAlong && (
              <Chip icon={Tv} label="Stream" />
            )}
            {order.options.priority && (
              <Chip icon={Zap} label="Priority" />
            )}
            {order.unreadMessages > 0 && (
              <Chip
                icon={MessageSquare}
                label={`${order.unreadMessages} new`}
                tone="amber"
              />
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right leading-tight">
            <div className="text-sm font-semibold text-white tabular-nums font-mono">
              {formatPrice(order.pricing.amount, order.pricing.currency)}
            </div>
            <div className="text-[10px] font-mono text-white/45">
              {formatOrderId(order.id)}
            </div>
          </div>
          <ChevronRight
            className="size-4 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white/70"
          />
        </div>
      </div>

      {/* Footnote: when placed */}
      <div className="mt-2 text-[10px] font-mono text-white/35">
        Placed {placedAgo}
      </div>
    </button>
  );
}

function Chip({
  icon: Icon,
  label,
  tone = "default",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  tone?: "default" | "amber";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 h-5 rounded-full text-[10px] font-medium border",
        tone === "amber"
          ? "border-[var(--color-neon-amber)]/40 bg-[var(--color-neon-amber)]/10 text-[var(--color-neon-amber)]"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 text-white/70",
      )}
    >
      <Icon className="size-2.5" />
      {label}
    </span>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
