"use client";

import Link from "next/link";
import {
  Star,
  Clock,
  Flame,
  Rocket,
  BadgeCheck,
  ShieldCheck,
  Package,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import Tilt from "react-parallax-tilt";
import { GameBackdrop } from "@/components/boosts/GameBackdrop";
import { cn } from "@/lib/utils/cn";
import { useLocale } from "@/hooks/useLocale";
import type { BoostListing } from "@/lib/data/boostListings";
import { getLadder } from "@/lib/data/ranks";
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
  /** i18n dictionary key — must be resolved via useLocale().t() at render. */
  labelKey: string;
  tone: "cyan" | "magenta" | "lime" | "amber";
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Picks at most one headline badge per card. Priority order matches the
 * old multi-badge version, but the redesigned card only surfaces the
 * top-ranked one to keep the image clean.
 */
export function deriveBadges(listing: BoostListing): GamifiedBadge[] {
  const out: GamifiedBadge[] = [];
  if (
    listing.boosterRating >= 4.97 ||
    listing.rarity === "mythic" ||
    listing.rarity === "legendary"
  ) {
    out.push({
      id: "topTier",
      labelKey: "boostCard.badge.topTier",
      tone: "amber",
      icon: Star,
    });
  }
  if (listing.etaHours <= 24) {
    out.push({
      id: "fast",
      labelKey: "boostCard.badge.fast",
      tone: "cyan",
      icon: Rocket,
    });
  }
  if (listing.ordersCompleted >= 1000) {
    out.push({
      id: "verifiedPro",
      labelKey: "boostCard.badge.verifiedPro",
      tone: "lime",
      icon: BadgeCheck,
    });
  }
  if (listing.ordersCompleted < 100) {
    out.push({
      id: "newListing",
      labelKey: "boostCard.badge.new",
      tone: "magenta",
      icon: Flame,
    });
  }
  return out;
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/**
 * BoostCard — product-style grid tile.
 *
 * Layout:
 *   ┌──────────────────────┐
 *   │  [headline badge]    │
 *   │                      │
 *   │     COVER IMAGE      │   square aspect ratio
 *   │                      │
 *   │  [stock pill]        │   only when stock is low
 *   ├──────────────────────┤
 *   │  Title (2 lines max) │
 *   │  [Service tag]       │
 *   │  $PRICE              │   accent-coloured, big
 *   │  ★ rating · X sold   │
 *   │  ETA · Region        │
 *   └──────────────────────┘
 *
 * Replaces the older dense layout (rank pills, booster strip, escrow
 * chips) — those details live on the listing PDP. The grid card is now
 * scannable at 5-per-row density.
 */
export function BoostCard({
  listing,
  index = 0,
  linkable = true,
}: BoostCardProps) {
  const reduced = useReducedMotion();
  const { t } = useLocale();
  const ladder = getLadder(listing.game);
  const fromTier = ladder.tiers[listing.fromIdx];
  const toTier = ladder.tiers[listing.toIdx];
  // Guard against listings whose stored rank indices are outside this
  // game's current ladder (catalog trim, slug rename, etc.). RankPill
  // inside the PDP would crash on tier.accent / tier.label.
  if (!fromTier || !toTier) return null;

  const badges = deriveBadges(listing);
  const primaryBadge = badges[0];
  const stock = computeStock(listing);
  const primaryCover = listing.coverImages?.[0];

  const cardInner = (
    <article
      className={cn(
        "group/card relative h-full flex flex-col overflow-hidden",
        "rounded-xl border border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-panel)]",
        "transition-[border-color,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        // Tilt's scale (1.05) replaces the old hover:-translate-y-0.5 lift;
        // border-glow and shadow stay so non-tilt browsers still feel alive.
        "hover:border-[var(--color-neon-cyan)]/50",
        "hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.6)]",
      )}
    >
      {/* ── Cover image ─────────────────────────────────────────── */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-panel-elevated)]">
        {primaryCover ? (
          <>
            {/* Seller-uploaded cover (data URL or remote URL — skips
                next/image so data URLs don't get re-encoded). */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={primaryCover}
              alt={listing.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover/card:scale-[1.04]"
            />
          </>
        ) : (
          <GameBackdrop gameSlug={listing.game} />
        )}

        {/* HOT ribbon (takes top-left if listing.hot is on) */}
        {listing.hot && (
          <span
            className={cn(
              "absolute top-2 left-2 inline-flex items-center gap-1 px-2 h-6 rounded-md",
              "text-[10px] font-mono font-bold uppercase tracking-[0.12em]",
              "bg-[var(--color-neon-magenta)] text-white",
              "shadow-[0_4px_14px_-4px_rgba(0,0,0,0.5)]",
            )}
          >
            <Flame className="size-3" aria-hidden />
            {t("boostCard.badge.hot")}
          </span>
        )}

        {/* Headline badge — only when not already showing HOT */}
        {!listing.hot && primaryBadge && (
          <span
            className={cn(
              "absolute top-2 left-2 inline-flex items-center gap-1 px-2 h-6 rounded-md",
              "text-[10px] font-mono font-bold uppercase tracking-[0.12em]",
              "shadow-[0_4px_14px_-4px_rgba(0,0,0,0.5)]",
              primaryBadge.tone === "cyan" &&
                "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]",
              primaryBadge.tone === "magenta" &&
                "bg-[var(--color-neon-magenta)] text-white",
              primaryBadge.tone === "lime" &&
                "bg-[var(--color-success)] text-[var(--color-text-inverse)]",
              primaryBadge.tone === "amber" &&
                "bg-[var(--color-neon-amber)] text-[var(--color-text-inverse)]",
            )}
          >
            <primaryBadge.icon className="size-3" aria-hidden />
            {t(primaryBadge.labelKey)}
          </span>
        )}

        {/* Stock pill (bottom-right, only when running low) */}
        {stock.tone === "low" && (
          <span
            className={cn(
              "absolute bottom-2 right-2 inline-flex items-center gap-1 px-1.5 h-5 rounded",
              "text-[9px] font-mono font-bold uppercase tracking-[0.12em]",
              "bg-black/70 text-[var(--color-neon-amber)]",
              "border border-[var(--color-neon-amber)]/40 backdrop-blur-sm",
            )}
            title={t("boostCard.stockTitle")}
          >
            <Package className="size-2.5" aria-hidden />
            {t("boostCard.stockLeft", { count: stock.available })}
          </span>
        )}
      </div>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 px-3 pt-2.5 pb-3 gap-1.5">
        {/* Title — reserved height keeps cards aligned in a grid even
            when titles wrap to 1 vs 2 lines. */}
        <h3 className="text-[13px] sm:text-sm font-medium text-white/95 line-clamp-2 leading-snug min-h-[2.6em]">
          {listing.title}
        </h3>

        {/* Service type tag */}
        <div>
          <span
            className={cn(
              "inline-flex items-center px-1.5 py-0.5 rounded",
              "text-[9px] font-mono font-semibold uppercase tracking-[0.14em]",
              "border border-[var(--color-neon-cyan)]/30",
              "text-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/5",
            )}
          >
            {listing.serviceType}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1 mt-0.5">
          <span
            className="font-display text-xl sm:text-2xl font-black tabular-nums leading-none"
            style={{
              color: "var(--color-neon-cyan)",
              textShadow: "0 0 18px oklch(78% 0.18 200 / 28%)",
            }}
          >
            ${listing.priceUsd.toFixed(0)}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-white/40">
            USDC
          </span>
        </div>

        {/* Rating + sold count */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/60">
          <span className="inline-flex items-center gap-0.5">
            <Star
              className="size-3 fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]"
              aria-hidden
            />
            <span className="tabular-nums">
              {listing.boosterRating.toFixed(1)}
            </span>
          </span>
          <span aria-hidden className="text-white/25">
            ·
          </span>
          <span className="truncate">
            {t("boostCard.orders", {
              count: listing.ordersCompleted.toLocaleString(),
            })}
          </span>
        </div>

        {/* ETA + Region — pushed to bottom to keep card heights aligned */}
        <div className="flex items-center gap-1.5 text-[10px] text-white/45 mt-auto pt-1">
          <Clock className="size-2.5 shrink-0" aria-hidden />
          <span className="tabular-nums">{fmtEta(listing.etaHours)}</span>
          <span aria-hidden className="text-white/25">
            ·
          </span>
          <span className="font-mono uppercase tracking-[0.15em] truncate">
            {listing.region}
          </span>
          {/* Inline escrow assurance — single chip instead of three */}
          <span
            aria-label={t("boostCard.chip.escrowTitle")}
            title={t("boostCard.chip.escrowTitle")}
            className="ml-auto inline-flex items-center gap-0.5 text-[var(--color-success)]/85"
          >
            <ShieldCheck className="size-2.5" aria-hidden />
          </span>
        </div>
      </div>
    </article>
  );

  const linkContent = linkable ? (
    <Link
      href={`/boosts/${listing.id}`}
      className={cn(
        "group/card block h-full rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]",
      )}
      aria-label={t("boostCard.ariaView", { title: listing.title })}
    >
      {cardInner}
    </Link>
  ) : (
    cardInner
  );

  return (
    <motion.div
      variants={cardVariants}
      initial={reduced ? false : "hidden"}
      animate="visible"
      transition={{
        duration: 0.35,
        delay: reduced ? 0 : Math.min(index, 11) * 0.04,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="h-full"
    >
      {reduced ? (
        // Motion-sensitive users get a static card. WCAG 2.3.3.
        linkContent
      ) : (
        <Tilt
          tiltMaxAngleX={15}
          tiltMaxAngleY={15}
          glareEnable
          glareMaxOpacity={0.25}
          glareColor="#ffffff"
          glarePosition="all"
          glareBorderRadius="12px"
          scale={1.05}
          perspective={1000}
          transitionSpeed={400}
          className="h-full"
        >
          {linkContent}
        </Tilt>
      )}
    </motion.div>
  );
}

function fmtEta(hours: number): string {
  if (hours < 24) return `~${hours}h`;
  const d = Math.round(hours / 24);
  return `~${d}d`;
}
