"use client";

import { Star, Clock, Zap, ShieldCheck, MessageCircle, Flame, Rocket, BadgeCheck } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { Button } from "@/components/ui/Button";
import { GameBackdrop } from "@/components/boosts/GameBackdrop";
import type { BoostListing } from "@/lib/data/boostListings";
import { getLadder } from "@/lib/data/ranks";

interface BoostCardProps {
  listing: BoostListing;
  index?: number;
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
    out.push({ id: "fast", label: "Fast Completion", tone: "cyan", icon: Rocket });
  }
  if (listing.boosterRating >= 4.97 || listing.rarity === "mythic" || listing.rarity === "legendary") {
    out.push({ id: "topTier", label: "Top Tier", tone: "amber", icon: Star });
  }
  if (listing.ordersCompleted >= 1000) {
    out.push({ id: "verifiedPro", label: "Verified Pro", tone: "lime", icon: BadgeCheck });
  }
  if (listing.ordersCompleted < 100) {
    out.push({ id: "newListing", label: "New", tone: "magenta", icon: Flame });
  }
  return out.slice(0, 2); // keep card tidy
}

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

export function BoostCard({ listing, index = 0 }: BoostCardProps) {
  const reduced = useReducedMotion();
  const ladder = getLadder(listing.game);
  const fromTier = ladder.tiers[listing.fromIdx];
  const toTier = ladder.tiers[listing.toIdx];
  const badges = deriveBadges(listing);

  return (
    <motion.div
      variants={cardVariants}
      initial={reduced ? false : "hidden"}
      animate="visible"
      transition={{ duration: 0.4, delay: reduced ? 0 : Math.min(index, 11) * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className="h-full"
    >
    <SpotlightCard
      className="p-5 flex flex-col gap-4 h-full"
      backdrop={<GameBackdrop gameSlug={listing.game} />}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
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
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)] shrink-0 ml-2">
          {listing.region}
        </span>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
            {listing.serviceType}
          </span>
          <span className="text-xs font-mono text-[var(--color-text-muted)]">·</span>
          <span className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
            {listing.queueType}
          </span>
        </div>
        <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-text-primary)] leading-tight">
          {listing.title}
        </h3>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <RankChip tier={fromTier} />
        <span className="text-[var(--color-text-muted)]">→</span>
        <RankChip tier={toTier} highlighted />
      </div>

      {/* Booster row */}
      <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 min-w-0">
          <BoosterAvatar seed={listing.boosterAvatarSeed} />
          <div className="leading-tight min-w-0">
            <div className="flex items-center gap-1 text-xs">
              <ShieldCheck className="size-3 text-[var(--color-success)] shrink-0" />
              <span className="font-mono text-[var(--color-text-primary)] truncate">
                {listing.boosterTag}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-[var(--color-text-muted)]">
              <Star className="size-2.5 text-[var(--color-neon-amber)] fill-current" />
              <span className="font-mono">{listing.boosterRating.toFixed(2)}</span>
              <span>· {listing.ordersCompleted.toLocaleString()} orders</span>
            </div>
          </div>
        </div>
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
        <Stat icon={<Clock className="size-3" />} label="ETA" value={fmtEta(listing.etaHours)} />
        <Stat
          icon={<MessageCircle className="size-3" />}
          label="Reply"
          value={`${listing.responseMinutes}m`}
        />
        <Stat
          icon={<Zap className="size-3" />}
          label="Mode"
          value={listing.options.priorityQueue ? "Priority" : "Standard"}
        />
      </div>

      {/* Price + CTA */}
      <div className="flex items-end justify-between gap-3 mt-auto">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
            From
          </div>
          <div className="font-display text-2xl font-bold text-[var(--color-text-primary)] leading-none">
            ${listing.priceUsd.toFixed(0)}
          </div>
          <div className="text-[10px] font-mono text-[var(--color-text-muted)] mt-0.5">
            ≈ {(listing.priceUsd / 600).toFixed(4)} ETH
          </div>
        </div>
        <Button size="sm">Buy now</Button>
      </div>
    </SpotlightCard>
    </motion.div>
  );
}

function RankChip({ tier, highlighted }: { tier: { label: string; accent: string }; highlighted?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded font-mono"
      style={
        highlighted
          ? {
              color: tier.accent,
              background: `${tier.accent}1a`,
              border: `1px solid ${tier.accent}55`,
              boxShadow: `0 0 12px ${tier.accent}30`,
            }
          : {
              color: "var(--color-text-secondary)",
              background: "var(--color-bg-panel-elevated)",
              border: "1px solid var(--color-border-subtle)",
            }
      }
    >
      <span
        className="size-1.5 rounded-full"
        style={{ background: tier.accent }}
      />
      {tier.label}
    </span>
  );
}

function BoosterAvatar({ seed }: { seed: string }) {
  // Deterministic gradient from the seed
  const hue1 = hash(seed) % 360;
  const hue2 = (hue1 + 60) % 360;
  return (
    <span
      className="grid place-items-center size-8 rounded-md font-mono text-xs font-bold shrink-0"
      style={{
        background: `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 90% 60%))`,
        color: "var(--color-text-inverse)",
      }}
      aria-hidden
    >
      {seed.slice(0, 2).toUpperCase()}
    </span>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="px-2 py-1.5 rounded-md bg-[var(--color-bg-panel-elevated)]/60 border border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-1 text-[var(--color-text-muted)]">
        <span className="text-[var(--color-neon-cyan)]">{icon}</span>
        <span className="text-[9px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-[var(--color-text-primary)] mt-0.5">{value}</div>
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
