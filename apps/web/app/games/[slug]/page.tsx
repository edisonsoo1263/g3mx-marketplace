"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Coins,
  Gamepad2,
  Globe2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { getPublicGame } from "@/lib/api/games-client";
import { pickGameName, type Game } from "@/lib/types/games";
import { cn } from "@/lib/utils/cn";

/**
 * Public game detail page — overview + service-availability blocks. Seller
 * listings integration is a placeholder for now; will FK to games.id once
 * the seller gigs table exists.
 */
export default function GameDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params?.slug;

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    getPublicGame(slug)
      .then((g) => {
        if (!cancelled) setGame(g);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof Error && /not found|404/i.test(err.message)) {
          setNotFound(true);
        } else {
          setNotFound(true);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" /> Back
        </button>

        {loading ? (
          <SkeletonState />
        ) : notFound || !game ? (
          <NotFound />
        ) : (
          <article className="space-y-10">
            <header className="space-y-3">
              <PixelBadge tone="cyan">
                <Gamepad2 className="size-3" /> {game.category}
              </PixelBadge>
              <h1
                className="font-display font-black tracking-tight text-white"
                style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
              >
                {pickGameName(game.name)}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                {game.publisher && (
                  <>
                    <span>{game.publisher}</span>
                    <span className="text-white/30">·</span>
                  </>
                )}
                <span>{game.platforms.join(", ")}</span>
                {game.region_focus.length > 0 && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Globe2 className="size-3.5" />
                      {game.region_focus.join(", ")}
                    </span>
                  </>
                )}
              </div>
            </header>

            {/* Services available */}
            <section className="space-y-3">
              <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/55">
                Available services
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ServiceCard
                  title="Boosting"
                  icon={Trophy}
                  enabled={game.services.boosting.enabled}
                  body="Rank climbs, placement matches, win packs — verified boosters take your account up the ladder."
                />
                <ServiceCard
                  title="Account trading"
                  icon={Users}
                  enabled={game.services.account_trading.enabled}
                  body="Buy or sell high-rank, rare-skin, or starter accounts with on-platform escrow."
                />
                <ServiceCard
                  title="Top-up"
                  icon={Coins}
                  enabled={game.services.top_up.enabled}
                  body={
                    game.services.top_up.enabled && game.services.top_up.currency_name
                      ? `In-game ${game.services.top_up.currency_name}, delivered at discounted rates vs. official top-up.`
                      : "In-game currency delivery, delivered at discounted rates vs. official top-up."
                  }
                />
              </div>
            </section>

            {/* Listings placeholder */}
            <section className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 md:p-14 text-center">
              <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
                <Sparkles className="size-6 text-[var(--color-neon-cyan)]" />
              </div>
              <h2 className="font-display text-xl font-bold text-white">
                Seller listings — coming soon
              </h2>
              <p className="mt-2 text-white/65 max-w-md mx-auto text-sm">
                The seller gig database hasn&apos;t been wired to this catalog
                yet. Existing boost listings live on /boosts.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/boosts"
                  className={cn(
                    "inline-flex items-center gap-2 h-11 px-5 rounded-full",
                    "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
                    "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
                    "transition-[filter,transform] duration-150",
                  )}
                >
                  Browse boosts
                </Link>
                <Link
                  href="/sell/onboarding"
                  className="text-xs font-mono uppercase tracking-[0.3em] text-white/65 hover:text-white transition-colors"
                >
                  Or list your service →
                </Link>
              </div>
            </section>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}

function ServiceCard({
  title,
  icon: Icon,
  enabled,
  body,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  body: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        enabled
          ? "border-[var(--color-neon-cyan)]/30 bg-[var(--color-neon-cyan)]/[0.04]"
          : "border-white/10 bg-white/[0.02] opacity-65",
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            "grid place-items-center size-8 rounded-full border",
            enabled
              ? "bg-[var(--color-neon-cyan)]/15 border-[var(--color-neon-cyan)]/40 text-[var(--color-neon-cyan)]"
              : "bg-white/5 border-white/10 text-white/40",
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">
            {enabled ? "Available" : "Not offered"}
          </div>
        </div>
      </div>
      <p className="text-xs text-white/70 leading-relaxed">{body}</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <h2 className="font-display text-xl font-bold text-white">Game not found</h2>
      <p className="mt-2 text-white/70 text-sm">
        That game either doesn&apos;t exist or isn&apos;t live yet. Check the
        catalog for everything we currently support.
      </p>
      <div className="mt-6">
        <Link
          href="/games"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-full bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)] text-xs font-semibold hover:brightness-110 active:scale-[0.98] transition-[filter,transform] cursor-pointer"
        >
          Browse catalog
        </Link>
      </div>
    </div>
  );
}

function SkeletonState() {
  return (
    <div className="space-y-6">
      <div className="h-12 w-2/3 rounded-md bg-[var(--color-bg-panel)]/40 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[140px] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
