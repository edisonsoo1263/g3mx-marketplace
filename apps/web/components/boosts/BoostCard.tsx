"use client";

import Link from "next/link";
import {
  Star,
  Clock,
  Zap,
  ShieldCheck,
  MessageCircle,
  Flame,
  Rocket,
  BadgeCheck,
  ArrowRight,
  Package,
  RotateCcw,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { GameBackdrop } from "@/components/boosts/GameBackdrop";
import { cn } from "@/lib/utils/cn";
import type { BoostListing } from "@/lib/data/boostListings";
import { getLadder, type RankTier } from "@/lib/data/ranks";
import { computeStock } from "@/lib/data/listingStock";

interface BoostCardProps {
  listing: BoostListing;
  index?: number;
  /**
   * When true (default) the whole card is a Link to /boosts/[id] (the PDP).
   * Pass false from non-interactive contexts like the seller wizard preview
   * where the listing id is a placeholder.
   */
  linkable?: boolean;
}

export interface GamifiedBadge {
  id: "fast" | "topTier" | "verifiedPro" | "newListing";
  label: string;
  tone: "cyan" | "magenta" | "lime" | "amber";
  icon: React.ComponentType<{ className?: string }>;
}

export function deriveBadges(listing: BoostListing): GamifiedBadge[] {
  const out: GamifiedBadge[] = [];
  if (listing.etaHours <= 24) {
    out.push({ id: "fast", label: "Fast", tone: "cyan", icon: Rocket });
  }
  if (
    listing.boosterRating >= 4.97 ||
    listing.rarity === "mythic" ||
    listing.rarity === "legendary"
  ) {
    out.push({ id: "topTier", label: "Top Tier", tone: "amber", icon: Star });
  }
  if (listing.ordersCompleted >= 1000) {
    out.push({
      id: "verifiedPro",
      label: "Verified Pro",
      tone: "lime",
      icon: BadgeCheck,
    });
  }
  if (listing.ordersCompleted < 100) {
    out.push({ id: "newListing", label: "New", tone: "magenta", icon: Flame });
  }
  return out.slice(0, 2);
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function BoostCard({
  listing,
  index = 0,
  linkable = true,
}: BoostCardProps) {
  const reduced = useReducedMotion();
  const ladder = getLadder(listing.game);
  const fromTier = ladder.tiers[listing.fromIdx];
  const toTier = ladder.tiers[listing.toIdx];
  const badges = deriveBadges(listing);
  const stock = computeStock(listing);

  const cardInner = (
    <SpotlightCard
      className="h-full"
      backdrop={<GameBackdrop gameSlug={listing.game} />}
    >
      <div className="relative flex flex-col h-full">
          {/* ── Header strip: badges + region ─────────────────────── */}
          <div className="flex items-center justify-between gap-2 px-5 pt-5">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              {listing.hot && (
                <PixelBadge tone="magenta">
                  <Flame className="size-3" /> Hot
                </PixelBadge>
              )}
              {badges.map((b) => (
                <PixelBadge key={b.id} tone={b.tone}>
                  <b.icon className="size-3" /> {b.label}
                </PixelBadge>
              ))}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={cn(
                  "inline-flex items-center gap-1 h-5 px-1.5 rounded text-[10px] font-mono uppercase tracking-[0.18em] border",
                  stock.tone === "low"
                    ? "border-[var(--color-neon-amber)]/40 bg-[var(--color-neon-amber)]/10 text-[var(--color-neon-amber)]"
                    : "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]",
                )}
                title="Available booking slots"
              >
                <Package className="size-2.5" />
                {stock.available} left
              </span>
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
                {listing.region}
              </span>
            </div>
          </div>

          {/* ── Title + eyebrow ───────────────────────────────────── */}
          <div className="px-5 pt-3">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
              <span>{listing.serviceType}</span>
              <span className="text-white/30">·</span>
              <span>{listing.queueType}</span>
            </div>
            <h3 className="mt-1.5 font-display text-xl font-bold text-white leading-tight line-clamp-2">
              {listing.title}
            </h3>
          </div>

          {/* ── Rank pair (the headline visual) ───────────────────── */}
          <div className="px-5 pt-4">
            <RankPair from={fromTier} to={toTier} />
          </div>

          {/* ── Booster strip ─────────────────────────────────────── */}
          <div className="mx-5 mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg bg-[var(--color-bg-deep)]/45 border border-white/5 backdrop-blur-sm">
            <BoosterAvatar seed={listing.boosterAvatarSeed} />
            <div className="leading-tight min-w-0 flex-1">
              <div className="flex items-center gap-1 text-xs">
                <ShieldCheck className="size-3 text-[var(--color-success)] shrink-0" />
                <span className="font-mono text-white truncate">
                  {listing.boosterTag}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/55 mt-0.5">
                <Star className="size-2.5 text-[var(--color-neon-amber)] fill-current" />
                <span className="font-mono">
                  {listing.boosterRating.toFixed(2)}
                </span>
                <span className="text-white/40">·</span>
                <span>{listing.ordersCompleted.toLocaleString()} orders</span>
              </div>
            </div>
          </div>

          {/* ── Stats row (inline, separators) ────────────────────── */}
          <div className="mx-5 mt-3 flex items-center justify-between gap-2 text-[11px] font-mono">
            <StatChip
              icon={<Clock className="size-3" />}
              label="ETA"
              value={fmtEta(listing.etaHours)}
            />
            <StatChip
              icon={<MessageCircle className="size-3" />}
              label="Reply"
              value={`${listing.responseMinutes}m`}
            />
            <StatChip
              icon={<Zap className="size-3" />}
              label="Mode"
              value={listing.options.priorityQueue ? "Priority" : "Standard"}
            />
          </div>

          {/* ── Price + CTA footer ────────────────────────────────── */}
          <div
            className={cn(
              "mt-auto px-5 pt-4 pb-5",
              "flex items-end justify-between gap-3",
              "border-t border-white/5",
            )}
          >
            <div className="leading-none">
              <div className="text-[10px] uppercase tracking-[0.2em] text-white/55 mb-1">
                From
              </div>
              <div className="font-display text-3xl font-black text-white tabular-nums">
                ${listing.priceUsd.toFixed(0)}
              </div>
              <div className="mt-1 flex items-center gap-2 text-[9px] font-mono uppercase tracking-[0.15em] text-white/55">
                <span
                  className="inline-flex items-center gap-0.5"
                  title="72-hour escrow protection"
                >
                  <ShieldCheck className="size-2.5 text-[var(--color-success)]" />
                  Escrow
                </span>
                <span
                  className="inline-flex items-center gap-0.5"
                  title="KYC-verified booster"
                >
                  <BadgeCheck className="size-2.5 text-[var(--color-neon-cyan)]" />
                  Verified
                </span>
                <span
                  className="inline-flex items-center gap-0.5"
                  title="Auto-refund on SLA breach"
                >
                  <RotateCcw className="size-2.5 text-[var(--color-neon-magenta)]" />
                  Refund
                </span>
              </div>
            </div>
            <span
              className={cn(
                "inline-flex items-center gap-1.5 h-9 px-4 rounded-full select-none",
                "text-xs font-semibold cursor-pointer",
                "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]",
                "transition-[filter,transform] duration-150",
                linkable && "group-hover/card:brightness-110",
              )}
            >
              View details <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </SpotlightCard>
  );

  return (
    <motion.div
      variants={cardVariants}
      initial={reduced ? false : "hidden"}
      animate="visible"
      transition={{
        duration: 0.4,
        delay: reduced ? 0 : Math.min(index, 11) * 0.05,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      {linkable ? (
        <Link
          href={`/boosts/${listing.id}`}
          className="group/card block h-full"
          aria-label={`View ${listing.title}`}
        >
          {cardInner}
        </Link>
      ) : (
        cardInner
      )}
    </motion.div>
  );
}

// ── Sub-components ───────────────────────────────────────────────

function RankPair({ from, to }: { from: RankTier; to: RankTier }) {
  return (
    <div
      className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 p-2 rounded-lg"
      style={{
        background:
          "linear-gradient(90deg, rgb(0 0 0 / 25%) 0%, rgb(0 0 0 / 35%) 100%)",
        border: "1px solid rgb(255 255 255 / 6%)",
      }}
    >
      <RankPill tier={from} variant="from" />
      <ArrowRight className="size-4 text-white/40" aria-hidden />
      <RankPill tier={to} variant="to" />
    </div>
  );
}

function RankPill({
  tier,
  variant,
}: {
  tier: RankTier;
  variant: "from" | "to";
}) {
  const isTo = variant === "to";
  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md min-w-0",
      )}
      style={
        isTo
          ? {
              color: tier.accent,
              background: `${tier.accent}1f`,
              border: `1px solid ${tier.accent}66`,
              boxShadow: `0 0 16px ${tier.accent}33`,
            }
          : {
              color: "rgb(255 255 255 / 90%)",
              background: "rgb(255 255 255 / 4%)",
              border: "1px solid rgb(255 255 255 / 10%)",
            }
      }
    >
      <span
        aria-hidden
        className="size-2 rounded-full shrink-0"
        style={{
          background: tier.accent,
          boxShadow: isTo ? `0 0 6px ${tier.accent}` : undefined,
        }}
      />
      <span className="font-mono text-xs font-semibold tracking-tight truncate">
        {tier.label}
      </span>
    </div>
  );
}

function BoosterAvatar({ seed }: { seed: string }) {
  const hue1 = hash(seed) % 360;
  const hue2 = (hue1 + 60) % 360;
  return (
    <span
      className="grid place-items-center size-9 rounded-md font-mono text-xs font-bold shrink-0"
      style={{
        background: `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 90% 60%))`,
        color: "var(--color-text-inverse)",
        boxShadow: "0 4px 12px rgb(0 0 0 / 35%)",
      }}
      aria-hidden
    >
      {seed.slice(0, 2).toUpperCase()}
    </span>
  );
}

function StatChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex-1 min-w-0 px-2 py-2 rounded-md bg-[var(--color-bg-deep)]/35 border border-white/5">
      <div className="flex items-center gap-1 text-white/55">
        <span className="text-[var(--color-neon-cyan)]">{icon}</span>
        <span className="text-[9px] uppercase tracking-[0.15em]">{label}</span>
      </div>
      <div className="text-white mt-0.5 truncate">{value}</div>
    </div>
  );
}

function fmtEta(hours: number): string {
  if (hours < 24) return `~${hours}h`;
  const d = Math.round(hours / 24);
  return `~${d}d`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
