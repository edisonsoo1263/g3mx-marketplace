"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  Clock,
  HelpCircle,
  MessageSquare,
  Package,
  Plus,
  ShieldCheck,
  Star,
  Tv,
  Wallet,
  Zap,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { Button } from "@/components/ui/Button";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { GameBackdrop } from "@/components/boosts/GameBackdrop";
import { CheckoutDrawer } from "@/components/boosts/CheckoutDrawer";
import { useAuth } from "@/hooks/useAuth";
import { useListings } from "@/hooks/useListings";
import { useListingReviews } from "@/hooks/useListingReviews";
import { useSellerRating } from "@/hooks/useSellerRating";
import { ReviewForm } from "@/components/boosts/ReviewForm";
import { games } from "@/lib/data/catalog";
import { getLadder } from "@/lib/data/ranks";
import { gameMeta } from "@/lib/data/userOrders";
import { computeStock } from "@/lib/data/listingStock";
import { summarize } from "@/lib/types/reviews";
import { cn } from "@/lib/utils/cn";
import type { BoostListing } from "@/lib/data/boostListings";

/**
 * Product Detail Page (PDP) for a boost listing.
 *
 * Layout (desktop): two-column. Both rails scroll naturally with the page —
 * the right rail aligns top with the left at the start and moves up with
 * the rest of the content as the user reads.
 *   Left: media gallery → service scope → specs → add-ons → seller →
 *         Q&A → reviews
 *   Right: price card with stock, guarantees, Buy Now
 *
 * Listing data is read client-side via useListings(). When backend pagination
 * lands this becomes a server component fetching from Supabase by id.
 */
export default function BoostPDPPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const listings = useListings();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeAddons, setActiveAddons] = useState<Record<string, boolean>>({});

  const listing = useMemo(
    () => listings.find((l) => l.id === params.id) ?? null,
    [listings, params.id],
  );

  if (listings.length > 0 && !listing) {
    return <NotFoundState onBack={() => router.push("/boosts")} />;
  }
  if (!listing) {
    return <SkeletonState />;
  }

  const ladder = getLadder(listing.game);
  const fromTier = ladder.tiers[listing.fromIdx];
  const toTier = ladder.tiers[listing.toIdx];
  const game = games.find((g) => g.slug === listing.game);
  const meta = gameMeta(listing.game);

  const addons = buildAddons(listing);
  const totalAddOns = addons
    .filter((a) => activeAddons[a.id])
    .reduce((sum, a) => sum + a.priceUsd, 0);
  const totalPrice = listing.priceUsd + totalAddOns;

  const qa = mockQA(listing);
  const stock = computeStock(listing);

  return (
    <>
      <Navbar />
      <main className="relative">
        <BoostBackdrop accent={meta.accent} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-xs font-mono uppercase tracking-[0.22em] text-white/55">
            <Link
              href="/boosts"
              className="inline-flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <ArrowLeft className="size-3.5" /> Boosts
            </Link>
            <span className="text-white/25">/</span>
            <span className="text-white/85 truncate">{listing.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Left column — order-2 on mobile so the Buy Now rail appears
                above it; lg+ returns to natural document order. */}
            <div className="order-2 lg:order-none lg:col-span-7 xl:col-span-8 space-y-8">
              <ProductHeader listing={listing} game={game} />
              <MediaGallery listing={listing} />
              <ServiceScope
                listing={listing}
                fromTierLabel={fromTier?.label ?? "—"}
                toTierLabel={toTier?.label ?? "—"}
              />
              <SpecsBlock listing={listing} />
              <AddonsBlock
                addons={addons}
                active={activeAddons}
                onToggle={(id) =>
                  setActiveAddons((a) => ({ ...a, [id]: !a[id] }))
                }
              />
              <SellerBlock listing={listing} />
              <QABlock items={qa} />
              <ReviewsBlock listing={listing} />
            </div>

            {/* Right rail — on mobile this lifts above the title so buyers
                see price + Buy Now first. On lg+ it scrolls naturally with
                the page on the right side. */}
            <aside className="order-1 lg:order-none lg:col-span-5 xl:col-span-4">
              <div className="space-y-4">
                <PriceCard
                  listing={listing}
                  totalPrice={totalPrice}
                  totalAddOns={totalAddOns}
                  stock={stock}
                  onBuy={() => setCheckoutOpen(true)}
                />
                <GuaranteesCard listing={listing} />
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      {/* Checkout */}
      <CheckoutDrawer
        listing={checkoutOpen ? listing : null}
        onClose={() => setCheckoutOpen(false)}
      />
    </>
  );
}

// ── Backdrop ──────────────────────────────────────────────────────

function BoostBackdrop({ accent }: { accent: string }) {
  const colorByAccent: Record<string, string> = {
    cyan: "var(--color-neon-cyan)",
    magenta: "var(--color-neon-magenta)",
    violet: "var(--color-neon-violet)",
    amber: "var(--color-neon-amber)",
  };
  const c = colorByAccent[accent] ?? "var(--color-neon-cyan)";
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-10 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 80% 40% at 50% 0%, ${c}1f 0%, transparent 60%)`,
      }}
    />
  );
}

// ── Header ────────────────────────────────────────────────────────

function ProductHeader({
  listing,
  game,
}: {
  listing: BoostListing;
  game: typeof games[number] | undefined;
}) {
  return (
    <header className="space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <PixelBadge tone="cyan">
          <Package className="size-3" /> {listing.serviceType}
        </PixelBadge>
        {game && (
          <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-full border border-white/15 bg-[var(--color-bg-deep)]/80 text-[10px] font-mono uppercase tracking-[0.18em] text-white">
            <span
              aria-hidden
              className="size-1.5 rounded-full"
              style={{ background: game.accent, boxShadow: `0 0 6px ${game.accent}` }}
            />
            {game.name}
          </span>
        )}
        {listing.hot && (
          <PixelBadge tone="magenta">
            <Zap className="size-3" /> HOT
          </PixelBadge>
        )}
      </div>
      <h1
        className="font-display font-black text-white tracking-tight"
        style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)", lineHeight: 1.05 }}
      >
        {listing.title}
      </h1>
      <div className="flex items-center gap-3 text-sm">
        <div className="inline-flex items-center gap-1.5 text-white">
          <Star className="size-3.5 fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]" />
          <span className="font-mono tabular-nums">
            {listing.boosterRating.toFixed(2)}
          </span>
          <span className="text-white/55">
            · {listing.ordersCompleted.toLocaleString()} completed
          </span>
        </div>
      </div>
    </header>
  );
}

// ── Media Gallery ─────────────────────────────────────────────────

function MediaGallery({ listing }: { listing: BoostListing }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const slides = 4; // we render the cover backdrop with different framings

  return (
    <section>
      <div
        className={cn(
          "relative aspect-[16/9] rounded-2xl overflow-hidden",
          "border border-white/10 bg-[var(--color-bg-deep)]",
        )}
      >
        <div
          aria-hidden
          className="absolute inset-0 transition-transform duration-500"
          style={{
            transform: `scale(${1 + activeIndex * 0.05}) translate(${(activeIndex - 1) * 1.5}%, 0)`,
          }}
        >
          <GameBackdrop gameSlug={listing.game} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/70">
            Frame {activeIndex + 1} / {slides}
          </span>
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
            {listing.region} · {listing.queueType}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mt-2">
        {Array.from({ length: slides }).map((_, i) => (
          <button
            key={i}
            type="button"
            aria-label={`View frame ${i + 1}`}
            onClick={() => setActiveIndex(i)}
            className={cn(
              "relative aspect-video rounded-lg overflow-hidden cursor-pointer",
              "border transition-[border-color,transform] duration-200",
              i === activeIndex
                ? "border-[var(--color-neon-cyan)]"
                : "border-white/10 hover:border-white/30 hover:-translate-y-0.5",
            )}
          >
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ transform: `scale(${1 + i * 0.04})` }}
            >
              <GameBackdrop gameSlug={listing.game} />
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── Service Scope ─────────────────────────────────────────────────

function ServiceScope({
  listing,
  fromTierLabel,
  toTierLabel,
}: {
  listing: BoostListing;
  fromTierLabel: string;
  toTierLabel: string;
}) {
  const items = [
    { label: "Climb", value: `${fromTierLabel} → ${toTierLabel}` },
    { label: "Region", value: listing.region },
    { label: "Queue", value: listing.queueType },
    { label: "Estimated time", value: `~${listing.etaHours}h` },
    { label: "Reply time", value: `< ${listing.responseMinutes} min` },
    { label: "Service type", value: listing.serviceType },
  ];

  return (
    <Section title="Service scope" subtitle="Exactly what you're buying">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {items.map((it) => (
          <div
            key={it.label}
            className="flex items-start justify-between gap-3 px-4 py-3 rounded-lg border border-white/10 bg-[var(--color-bg-panel-elevated)]/40"
          >
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/60">
              {it.label}
            </span>
            <span className="text-sm font-semibold text-white text-right">
              {it.value}
            </span>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ── Specs ─────────────────────────────────────────────────────────

function SpecsBlock({ listing }: { listing: BoostListing }) {
  const specs: Array<{ label: string; value: string; hint?: string }> = [
    {
      label: "Account access",
      value: listing.options.offlineMode ? "Offline mode supported" : "Online only",
      hint: listing.options.offlineMode
        ? "Booster appears offline to your friends list."
        : "Friends will see the active session.",
    },
    {
      label: "Stream-along",
      value: listing.options.streamSession ? "Available on request" : "Not offered",
      hint: listing.options.streamSession
        ? "Watch the booster play live during the climb."
        : undefined,
    },
    {
      label: "Priority queue",
      value: listing.options.priorityQueue ? "Eligible" : "Standard queue",
      hint: listing.options.priorityQueue
        ? "Boost starts within 1 hour of acceptance."
        : undefined,
    },
    {
      label: "Verification",
      value: "KYC verified booster",
      hint: "Identity verified before listing approval.",
    },
  ];

  return (
    <Section title="Specifications" subtitle="Technical details and platform options">
      <ul className="divide-y divide-white/5 rounded-2xl border border-white/10 bg-[var(--color-bg-panel)]/60 overflow-hidden">
        {specs.map((s) => (
          <li key={s.label} className="px-4 py-3 sm:px-5 sm:py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="text-sm text-white/70">{s.label}</div>
              <div className="text-sm font-semibold text-white text-right">
                {s.value}
              </div>
            </div>
            {s.hint && (
              <div className="mt-1 text-xs text-white/50 leading-relaxed">
                {s.hint}
              </div>
            )}
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ── Add-ons ───────────────────────────────────────────────────────

interface AddOn {
  id: string;
  label: string;
  description: string;
  priceUsd: number;
  icon: React.ComponentType<{ className?: string }>;
}

function buildAddons(listing: BoostListing): AddOn[] {
  // Derive optional upsells from the listing's *unsupported* options + a
  // baseline insurance bundle.
  const out: AddOn[] = [];
  if (!listing.options.priorityQueue) {
    out.push({
      id: "priority",
      label: "Priority start",
      description: "Booster begins within 1 hour of acceptance.",
      priceUsd: Math.round(listing.priceUsd * 0.15),
      icon: Zap,
    });
  }
  if (!listing.options.streamSession) {
    out.push({
      id: "stream",
      label: "Stream-along",
      description: "Watch the booster play live during the climb.",
      priceUsd: 9,
      icon: Tv,
    });
  }
  if (!listing.options.offlineMode) {
    out.push({
      id: "offline",
      label: "Offline mode",
      description: "Booster appears offline to your friends list.",
      priceUsd: 5,
      icon: ShieldCheck,
    });
  }
  out.push({
    id: "insurance",
    label: "Boost insurance",
    description: "Free re-do if the booster falls below SLA.",
    priceUsd: 4,
    icon: BadgeCheck,
  });
  return out;
}

function AddonsBlock({
  addons,
  active,
  onToggle,
}: {
  addons: AddOn[];
  active: Record<string, boolean>;
  onToggle: (id: string) => void;
}) {
  if (addons.length === 0) return null;
  return (
    <Section
      title="Add-ons & upsells"
      subtitle="Optional extras layered on top of the base service"
    >
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {addons.map((a) => {
          const isActive = !!active[a.id];
          const Icon = a.icon;
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => onToggle(a.id)}
                aria-pressed={isActive}
                className={cn(
                  "w-full text-left flex items-start gap-3 px-3 py-3 rounded-xl cursor-pointer",
                  "border transition-[border-color,background-color]",
                  isActive
                    ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10"
                    : "border-white/10 bg-[var(--color-bg-panel-elevated)]/40 hover:border-white/30",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid place-items-center size-9 rounded-lg shrink-0",
                    isActive
                      ? "bg-[var(--color-neon-cyan)]/20 text-[var(--color-neon-cyan)]"
                      : "bg-[var(--color-bg-deep)] text-white/65",
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="text-sm font-semibold text-white">
                      {a.label}
                    </div>
                    <div className="text-sm font-mono tabular-nums text-white shrink-0">
                      +${a.priceUsd}
                    </div>
                  </div>
                  <div className="mt-0.5 text-xs text-white/60 leading-relaxed">
                    {a.description}
                  </div>
                </div>
                <span
                  aria-hidden
                  className={cn(
                    "grid place-items-center size-5 rounded-md shrink-0 self-center",
                    isActive
                      ? "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]"
                      : "border border-white/20 bg-transparent",
                  )}
                >
                  {isActive && <Check className="size-3" />}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

// ── Seller ────────────────────────────────────────────────────────

function SellerBlock({ listing }: { listing: BoostListing }) {
  const handle = listing.boosterTag.replace(/^@/, "");
  const since = "2024"; // placeholder until we track real signup dates

  // Real cross-listing rating for this seller. Falls back to the listing's
  // hardcoded boosterRating when the seller has no reviews yet (legacy seed).
  const { summary } = useSellerRating(listing.boosterAvatarSeed || null);
  const realCount = summary.count;
  const displayRating = realCount > 0 ? summary.average : listing.boosterRating;
  const displayCount = realCount > 0 ? realCount : listing.ordersCompleted;
  const displayCountLabel = realCount > 0 ? "reviews" : "orders";

  return (
    <Section title="Seller profile" subtitle="Who you're buying from">
      <div className="rounded-2xl border border-white/10 bg-[var(--color-bg-panel)]/60 p-4 sm:p-5">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="grid place-items-center size-14 rounded-full font-display text-lg font-black text-white shrink-0"
            style={{
              background: `linear-gradient(135deg, hsl(${hash(handle) % 360} 80% 55%), hsl(${(hash(handle) + 60) % 360} 90% 60%))`,
            }}
          >
            {handle.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-semibold text-white">
                @{handle}
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 h-5 rounded text-[10px] font-mono uppercase tracking-[0.18em] bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/40">
                <BadgeCheck className="size-3" /> Verified
              </span>
            </div>
            <div className="mt-1 text-xs text-white/65">
              <Star className="inline size-3 fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)] mr-1" />
              <span className="font-mono tabular-nums">
                {displayRating.toFixed(2)}
              </span>
              <span className="text-white/35 mx-1.5">·</span>
              <span>
                {displayCount.toLocaleString()} {displayCountLabel}
              </span>
              <span className="text-white/35 mx-1.5">·</span>
              <span>Member since {since}</span>
            </div>
          </div>
          <Link
            href="#"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-mono uppercase tracking-[0.22em] text-white/65 hover:text-white transition-colors"
            onClick={(e) => e.preventDefault()}
          >
            View profile <ArrowRight className="size-3" />
          </Link>
        </div>
      </div>
    </Section>
  );
}

// ── Q&A ───────────────────────────────────────────────────────────

interface QAItem {
  id: string;
  q: string;
  a: string;
  by: string;
  at: string;
}

function mockQA(listing: BoostListing): QAItem[] {
  const handle = listing.boosterTag.replace(/^@/, "");
  return [
    {
      id: "qa1",
      q: "Can the booster play during my time zone, or will it run 24/7?",
      a: `I usually queue during your evenings to keep the friends list quiet — schedules can be coordinated in chat after order placement.`,
      by: handle,
      at: "2 days ago",
    },
    {
      id: "qa2",
      q: "Do you accept payment in HYPE on HyperEVM?",
      a: "Yes. Both BSC USDT and HYPE on HyperEVM are supported at checkout. Funds are held in escrow until you sign off on the boost.",
      by: handle,
      at: "5 days ago",
    },
    {
      id: "qa3",
      q: "What happens if you don't hit the SLA?",
      a: "Automatic refund + you keep any rank progress made. The platform's escrow handles the release.",
      by: handle,
      at: "1 week ago",
    },
  ];
}

function QABlock({ items }: { items: QAItem[] }) {
  return (
    <Section
      title="Community Q&A"
      subtitle="Questions buyers asked the seller"
      actionSlot={
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-[0.22em] text-white/65 hover:text-white transition-colors cursor-pointer"
        >
          <Plus className="size-3.5" /> Ask a question
        </button>
      }
    >
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-white/10 bg-[var(--color-bg-panel)]/50 p-4 sm:p-5"
          >
            <div className="flex items-start gap-2.5">
              <HelpCircle className="size-4 text-[var(--color-neon-cyan)] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-white">
                  {item.q}
                </div>
                <div className="mt-2 text-sm text-white/80 leading-relaxed">
                  {item.a}
                </div>
                <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.2em] text-white/45">
                  Answered by @{item.by} · {item.at}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}

// ── Reviews ───────────────────────────────────────────────────────

function ReviewsBlock({ listing }: { listing: BoostListing }) {
  const { user, isAuthenticated } = useAuth();
  const { reviews, loading, refetch } = useListingReviews(listing.id);

  const summary = summarize(reviews);
  const distribution = ([5, 4, 3, 2, 1] as const).map((star) => ({
    star,
    count: summary.distribution[star] ?? 0,
  }));
  const max = Math.max(...distribution.map((d) => d.count), 1);

  // Can the current user post a review?
  const isOwnListing =
    isAuthenticated &&
    user?.id != null &&
    user.id === listing.boosterAvatarSeed;
  const alreadyReviewed =
    isAuthenticated &&
    user?.id != null &&
    reviews.some((r) => r.buyer_user_id === user.id);
  const canReview = isAuthenticated && !isOwnListing && !alreadyReviewed;

  return (
    <Section
      title="Reviews"
      subtitle={
        loading
          ? "Loading reviews…"
          : `${summary.count} verified review${summary.count === 1 ? "" : "s"} from buyers`
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="md:col-span-1 rounded-2xl border border-white/10 bg-[var(--color-bg-panel)]/60 p-5 text-center">
          <div className="font-display text-5xl font-black text-white tabular-nums">
            {summary.count > 0 ? summary.average.toFixed(2) : "—"}
          </div>
          <div className="mt-1 flex items-center justify-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={cn(
                  "size-4",
                  s <= Math.round(summary.average)
                    ? "fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]"
                    : "text-white/20",
                )}
              />
            ))}
          </div>
          <div className="mt-2 text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
            {summary.count > 0
              ? `From ${summary.count} review${summary.count === 1 ? "" : "s"}`
              : "Be the first to review"}
          </div>
        </div>
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[var(--color-bg-panel)]/60 p-5 space-y-2">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3">
              <span className="text-[11px] font-mono text-white/65 w-6 tabular-nums">
                {d.star}★
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full bg-[var(--color-neon-amber)]"
                  style={{
                    width: `${(d.count / max) * 100}%`,
                    boxShadow: "0 0 8px var(--color-neon-amber)",
                  }}
                />
              </div>
              <span className="text-[11px] font-mono text-white/55 tabular-nums w-6 text-right">
                {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write-a-review form */}
      {canReview && (
        <div className="mb-4">
          <ReviewForm
            listingId={listing.id}
            sellerUserId={listing.boosterAvatarSeed}
            onSubmitted={() => void refetch()}
          />
        </div>
      )}

      {/* Disabled-state notes */}
      {isOwnListing && (
        <div className="mb-4 text-xs text-white/55 italic">
          You can&apos;t leave a review on your own listing.
        </div>
      )}
      {!isAuthenticated && reviews.length > 0 && (
        <div className="mb-4 text-xs text-white/55">
          Sign in to leave a review.
        </div>
      )}
      {alreadyReviewed && (
        <div className="mb-4 inline-flex items-center gap-1.5 text-xs text-[var(--color-success)]">
          <BadgeCheck className="size-3.5" />
          You&apos;ve already reviewed this listing.
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-8 text-center">
          <p className="text-sm text-white/65">
            No reviews yet — first verified buyer to post gets the top spot.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {reviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-white/10 bg-[var(--color-bg-panel)]/50 p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    aria-hidden
                    className="grid place-items-center size-8 rounded-full font-semibold text-white shrink-0"
                    style={{
                      background: `linear-gradient(135deg, hsl(${hash(r.buyer_user_id) % 360} 80% 55%), hsl(${(hash(r.buyer_user_id) + 60) % 360} 90% 60%))`,
                    }}
                  >
                    {shortBuyerLabel(r.buyer_user_id).charAt(0).toUpperCase()}
                  </span>
                  <div className="leading-tight min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {shortBuyerLabel(r.buyer_user_id)}
                    </div>
                    <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45 mt-0.5">
                      {formatRelativeReview(r.created_at)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      className={cn(
                        "size-3.5",
                        s <= r.rating
                          ? "fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]"
                          : "text-white/20",
                      )}
                    />
                  ))}
                </div>
              </div>
              {r.title && (
                <div className="mt-2 text-sm font-semibold text-white">
                  {r.title}
                </div>
              )}
              <p className="mt-1 text-sm text-white/85 leading-relaxed">
                {r.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

/** Convert a Privy did to a short, anonymised display handle. */
function shortBuyerLabel(privyId: string): string {
  // did:privy:abc123 → @abc123
  const last = privyId.split(":").pop() ?? privyId;
  return `@${last.slice(0, 8)}`;
}

function formatRelativeReview(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  const m = Math.floor(ms / 60_000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString();
}

// ── Right rail: price + guarantees ────────────────────────────────

function PriceCard({
  listing,
  totalPrice,
  totalAddOns,
  stock,
  onBuy,
}: {
  listing: BoostListing;
  totalPrice: number;
  totalAddOns: number;
  stock: { available: number; tone: "ok" | "low" };
  onBuy: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/85 backdrop-blur-md",
        "p-5 sm:p-6 space-y-4",
        "shadow-[0_24px_48px_rgb(0_0_0/35%)]",
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <div className="leading-none">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-1.5">
            From
          </div>
          <div className="font-display text-4xl font-black text-white tabular-nums">
            ${totalPrice.toFixed(2)}
          </div>
          {totalAddOns > 0 && (
            <div className="mt-1 text-[11px] font-mono text-white/55">
              base ${listing.priceUsd.toFixed(2)} + add-ons ${totalAddOns}
            </div>
          )}
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[10px] font-mono uppercase tracking-[0.2em] border",
            stock.tone === "low"
              ? "border-[var(--color-neon-amber)]/40 bg-[var(--color-neon-amber)]/10 text-[var(--color-neon-amber)]"
              : "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]",
          )}
        >
          <Package className="size-3" />
          {stock.available} in stock
        </span>
      </div>

      <Button onClick={onBuy} size="lg" className="w-full">
        Buy now <ArrowRight className="size-4" />
      </Button>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
        <MicroStat
          icon={Clock}
          label="ETA"
          value={`~${listing.etaHours}h`}
          accent="var(--color-neon-cyan)"
        />
        <MicroStat
          icon={MessageSquare}
          label="Reply"
          value={`<${listing.responseMinutes}m`}
          accent="var(--color-neon-magenta)"
        />
        <MicroStat
          icon={Wallet}
          label="Region"
          value={listing.region}
          accent="var(--color-neon-amber)"
        />
      </div>
    </div>
  );
}

function MicroStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <Icon className="size-3.5 mx-auto" style={{ color: accent }} />
      <div className="mt-1 text-[10px] font-mono uppercase tracking-[0.18em] text-white/55">
        {label}
      </div>
      <div className="mt-0.5 text-xs font-semibold text-white">{value}</div>
    </div>
  );
}

function GuaranteesCard({ listing }: { listing: BoostListing }) {
  const items: Array<{ icon: React.ComponentType<{ className?: string }>; label: string; sub: string }> = [
    {
      icon: ShieldCheck,
      label: "72-hour escrow",
      sub: "Funds release only after you sign off",
    },
    {
      icon: BadgeCheck,
      label: "KYC-verified booster",
      sub: "Identity confirmed before listing approval",
    },
    {
      icon: Clock,
      label: "Auto-refund on SLA breach",
      sub: `If the boost misses ${listing.etaHours}h ETA`,
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-[var(--color-bg-panel)]/50 p-4 sm:p-5">
      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-3">
        Service guarantees
      </div>
      <ul className="space-y-2.5">
        {items.map((it) => (
          <li key={it.label} className="flex items-start gap-2.5">
            <span
              aria-hidden
              className="grid place-items-center size-7 rounded-md bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30 shrink-0"
            >
              <it.icon className="size-3.5 text-[var(--color-neon-cyan)]" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">{it.label}</div>
              <div className="text-[11px] text-white/60 mt-0.5">{it.sub}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────

function Section({
  title,
  subtitle,
  actionSlot,
  children,
}: {
  title: string;
  subtitle?: string;
  actionSlot?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h2 className="font-display text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <div className="text-xs text-white/55 mt-0.5">{subtitle}</div>
          )}
        </div>
        {actionSlot}
      </div>
      {children}
    </section>
  );
}

// ── Skeleton + Not Found ───────────────────────────────────────────

function SkeletonState() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
          <div className="aspect-[16/9] rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-32 rounded-2xl bg-white/5 animate-pulse" />
        </div>
        <div className="lg:col-span-4 space-y-4">
          <div className="h-72 rounded-2xl bg-white/5 animate-pulse" />
          <div className="h-48 rounded-2xl bg-white/5 animate-pulse" />
        </div>
      </main>
      <Footer />
    </>
  );
}

function NotFoundState({ onBack }: { onBack: () => void }) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="rounded-2xl border border-white/10 bg-[var(--color-bg-panel)]/60 p-12">
          <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-white/10 mb-5">
            <Package className="size-6 text-white/65" />
          </div>
          <h1 className="font-display text-2xl font-bold text-white">
            Listing not found
          </h1>
          <p className="mt-2 text-sm text-white/65 max-w-md mx-auto">
            This listing may have been removed by the seller, or the link
            you followed is out of date.
          </p>
          <div className="mt-6">
            <Button onClick={onBack}>
              <ArrowLeft className="size-4" /> Back to marketplace
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── Helpers ────────────────────────────────────────────────────────

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
