"use client";

import { CheckCircle2 } from "lucide-react";
import { recentlyCompleted, type CompletedOrder } from "@/lib/data/boostListings";
import { games } from "@/lib/data/catalog";
import { getLadder } from "@/lib/data/ranks";

export function RecentlyCompletedTicker() {
  // Hide entirely until there are actual completed orders to show.
  if (recentlyCompleted.length === 0) return null;

  const items = [...recentlyCompleted, ...recentlyCompleted];

  return (
    <section className="relative py-12 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="relative inline-flex">
            <span
              aria-hidden
              className="absolute inset-0 rounded-full bg-[var(--color-success)]/40"
              style={{ animation: "pulse-glow 2s ease-out infinite" }}
            />
            <CheckCircle2 className="relative size-4 text-[var(--color-success)]" />
          </span>
          <h2 className="text-sm font-mono uppercase tracking-[0.3em] text-[var(--color-text-secondary)]">
            Live · Recently completed
          </h2>
        </div>

        <div className="overflow-hidden mask-fade-x">
          <div
            className="flex gap-3 whitespace-nowrap will-change-transform"
            style={{ animation: "ticker 40s linear infinite" }}
          >
            {items.map((o, i) => (
              <CompletedChip key={`${o.id}-${i}`} order={o} />
            ))}
          </div>
        </div>
      </div>
      <style jsx>{`
        .mask-fade-x {
          mask-image: linear-gradient(
            to right,
            transparent,
            black 8%,
            black 92%,
            transparent
          );
        }
      `}</style>
    </section>
  );
}

function CompletedChip({ order }: { order: CompletedOrder }) {
  const ladder = getLadder(order.game);
  const fromTier = ladder.tiers.find((t) => t.id === order.fromRankId);
  const toTier = ladder.tiers.find((t) => t.id === order.toRankId);
  const game = games.find((g) => g.slug === order.game);

  return (
    <div
      className="shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-full glass-panel"
      style={{ borderColor: "var(--color-border-subtle)" }}
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: game?.accent, boxShadow: `0 0 8px ${game?.accent}` }}
      />
      <span className="text-xs font-mono text-[var(--color-text-muted)]">
        {order.hoursAgo === 0 ? "just now" : `${order.hoursAgo}h ago`}
      </span>
      <span className="text-xs text-[var(--color-text-secondary)]">
        <span className="font-mono text-[var(--color-text-primary)]">
          {order.boosterTag}
        </span>{" "}
        delivered{" "}
        <span style={{ color: fromTier?.accent }}>{fromTier?.label}</span>
        <span className="text-[var(--color-text-muted)]"> → </span>
        <span style={{ color: toTier?.accent }}>{toTier?.label}</span>
      </span>
      <span className="text-xs font-mono text-[var(--color-text-muted)]">
        · {order.durationHours}h · ${order.priceUsd}
      </span>
    </div>
  );
}
