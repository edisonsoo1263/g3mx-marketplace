"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { BoostsPageHeader } from "@/components/boosts/BoostsPageHeader";
import { DbGameShowcase } from "@/components/boosts/DbGameShowcase";
import { ActiveGameBanner } from "@/components/boosts/ActiveGameBanner";
import { BoostsToolbar } from "@/components/boosts/BoostsToolbar";
import { BoostConfigurator } from "@/components/boosts/BoostConfigurator";
import { ConfiguratorDrawer } from "@/components/boosts/ConfiguratorDrawer";
import { BoostCard } from "@/components/boosts/BoostCard";
import { RecentlyCompletedTicker } from "@/components/boosts/RecentlyCompletedTicker";
import { Button } from "@/components/ui/Button";
import { type BoostListing, type ServiceType } from "@/lib/data/boostListings";
import { getLadder, hasLadder, type SortOption } from "@/lib/data/ranks";
import { useListings } from "@/hooks/useListings";
import { useDbGames } from "@/hooks/useDbGames";
import { pickGameName } from "@/lib/types/games";

const DEFAULT_GAME = "valorant";

/**
 * useSearchParams() forces this route into client-side rendering during
 * prerender, so Next.js 15 requires a Suspense boundary wrapping any
 * component that calls it. Splitting the page into a thin default export
 * + an inner BoostsPageContent satisfies that requirement.
 */
export default function BoostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg-deep)]" aria-hidden />
      }
    >
      <BoostsPageContent />
    </Suspense>
  );
}

function BoostsPageContent() {
  const searchParams = useSearchParams();
  const { games: dbGames } = useDbGames();

  // Pre-select the game when arriving via /boosts?game=<slug> from the hero
  // game pills. Falls back to the default if the param is missing.
  const initialGame = useMemo(() => {
    const param = searchParams.get("game");
    return param || DEFAULT_GAME;
  }, [searchParams]);

  const [game, setGame] = useState<string>(initialGame);
  const [{ fromIdx, toIdx }, setRanks] = useState(() => {
    const ladder = getLadder(initialGame);
    return { fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) };
  });
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "All">("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Merged feed: seller-published listings (newest first) + seed catalog.
  const allListings = useListings();
  const gameHasLadder = hasLadder(game);

  function changeGame(slug: string) {
    setGame(slug);
    if (hasLadder(slug)) {
      const ladder = getLadder(slug);
      setRanks({ fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) });
    } else {
      // Reset to an inert range — downstream filter still works but the
      // configurator UI is hidden because the ladder isn't meaningful here.
      setRanks({ fromIdx: 0, toIdx: 0 });
    }
  }

  function resetFilters() {
    setQuery("");
    setServiceFilter("All");
    if (gameHasLadder) {
      const ladder = getLadder(game);
      setRanks({ fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) });
    }
  }

  // Live count of listings per game — drives the badge on each game card.
  const countsByGame = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const l of allListings) {
      counts[l.game] = (counts[l.game] ?? 0) + 1;
    }
    return counts;
  }, [allListings]);

  const visible = useMemo(
    () =>
      sortListings(
        applyFilters(
          allListings,
          game,
          fromIdx,
          toIdx,
          serviceFilter,
          query,
          gameHasLadder,
        ),
        sort,
      ),
    [allListings, game, fromIdx, toIdx, serviceFilter, query, sort, gameHasLadder],
  );

  const totalForGame = countsByGame[game] ?? 0;
  const activeGameName =
    dbGames.find((g) => g.slug === game)?.name &&
    pickGameName(dbGames.find((g) => g.slug === game)!.name);

  return (
    <>
      <Navbar />
      <main>
        <BoostsPageHeader />

        {/* DB-driven game picker with search + category filters + lazy icons */}
        <DbGameShowcase
          active={game}
          onChange={changeGame}
          countsByGame={countsByGame}
        />

        {/* Sticky filter bar */}
        <div className="mt-6">
          <BoostsToolbar
            query={query}
            onQueryChange={setQuery}
            serviceFilter={serviceFilter}
            onServiceFilterChange={setServiceFilter}
            sort={sort}
            onSortChange={setSort}
            onCustomize={() => gameHasLadder && setDrawerOpen(true)}
            resultCount={visible.length}
            totalCount={totalForGame}
          />
        </div>

        {/* Active-game accent banner */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <ActiveGameBanner gameSlug={game} count={visible.length} />
        </section>

        {/* Listings grid — main attraction */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 pb-16">
          {visible.length === 0 ? (
            <EmptyState
              gameName={activeGameName ?? "this game"}
              gameSlug={game}
              hasLadder={gameHasLadder}
              onReset={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {visible.map((l, i) => (
                <BoostCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          )}
        </section>

        <RecentlyCompletedTicker />
      </main>
      <Footer />

      {/* Customize-boost drawer — only mounted for games with a real ladder */}
      {gameHasLadder && (
        <ConfiguratorDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <BoostConfigurator
            gameSlug={game}
            fromIdx={fromIdx}
            toIdx={toIdx}
            onChange={setRanks}
          />
        </ConfiguratorDrawer>
      )}
    </>
  );
}

interface EmptyStateProps {
  gameName: string;
  gameSlug: string;
  hasLadder: boolean;
  onReset: () => void;
}

function EmptyState({ gameName, gameSlug, hasLadder: ladder, onReset }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 md:p-14 text-center">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-4">
        <Search className="size-6 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="font-display text-xl font-bold text-white">
        No {gameName} boosts match these filters yet
      </h3>
      <p className="mt-2 text-sm md:text-base text-white/65 max-w-md mx-auto">
        {ladder
          ? "Try widening your search, or be the first booster to list — your service shows up here immediately and gets a featured slot during open beta."
          : "We just added this game to the catalog — no sellers have listed against it yet. Be the first and grab the featured slot during open beta."}
      </p>
      <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
        {ladder && (
          <Button variant="secondary" size="sm" onClick={onReset}>
            <Sparkles className="size-4" /> Reset filters
          </Button>
        )}
        <Link href={`/games/${gameSlug}`}>
          <Button variant="secondary" size="sm">
            View game details
          </Button>
        </Link>
        <Link href="/sell/onboarding">
          <Button size="sm">
            List your service <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Filter / sort logic ───────────────────────────────────────

function applyFilters(
  listings: BoostListing[],
  game: string,
  fromIdx: number,
  toIdx: number,
  serviceFilter: ServiceType | "All",
  query: string,
  applyLadder: boolean,
): BoostListing[] {
  const q = query.trim().toLowerCase();
  return listings.filter((l) => {
    if (l.game !== game) return false;
    // Skip the rank-pair filter for games that don't have a meaningful ladder
    if (applyLadder && (l.toIdx < fromIdx || l.fromIdx > toIdx)) return false;
    if (serviceFilter !== "All" && l.serviceType !== serviceFilter) return false;
    if (q) {
      const hay = `${l.title} ${l.serviceType} ${l.boosterTag}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function sortListings(listings: BoostListing[], sort: SortOption): BoostListing[] {
  const arr = [...listings];
  switch (sort) {
    case "price_asc":
      return arr.sort((a, b) => a.priceUsd - b.priceUsd);
    case "price_desc":
      return arr.sort((a, b) => b.priceUsd - a.priceUsd);
    case "rating":
      return arr.sort((a, b) => b.boosterRating - a.boosterRating);
    case "eta":
      return arr.sort((a, b) => a.etaHours - b.etaHours);
    case "popular":
    default:
      return arr.sort(
        (a, b) =>
          Number(b.hot) - Number(a.hot) || b.ordersCompleted - a.ordersCompleted,
      );
  }
}
