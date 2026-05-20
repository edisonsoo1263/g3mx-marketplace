"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { ChevronLeft, Sparkles, ArrowRight, Gamepad2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
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
import { useLocale } from "@/hooks/useLocale";
import { pickGameName } from "@/lib/types/games";

/**
 * Per-Game Boosts page — replaces the legacy state-driven /boosts page
 * for a specific game. The slug is canonical; no in-page game switcher,
 * users go back to /boosts/games to pick a different title.
 *
 * Grid:
 *   - 1 col mobile
 *   - 2 cols sm
 *   - 3 cols md
 *   - 4 cols lg
 *   - 5 cols 2xl  (the spec's "max 5 per row" cap)
 *
 * Suspense wraps the content because useSearchParams() forces CSR bailout
 * for prerender — same pattern the rest of the app uses.
 */
export default function PerGameBoostsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--color-bg-deep)]" aria-hidden />
      }
    >
      <PerGameBoostsContent />
    </Suspense>
  );
}

function PerGameBoostsContent() {
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const { games: dbGames } = useDbGames();
  const { t } = useLocale();

  const gameSlug = params.slug;
  const game = dbGames.find((g) => g.slug === gameSlug);
  // Before the games list resolves we'd otherwise render the raw URL slug
  // ("valorant") and visibly swap to the proper-cased DB name ("Valorant")
  // ~1s later. titleCaseSlug gives us a stable, capitalised first paint
  // that matches the DB name closely enough to hide the swap for most
  // slugs (short codes like "cs2" still flicker briefly).
  const gameName = game ? pickGameName(game.name) : titleCaseSlug(gameSlug);
  const gameHasLadder = hasLadder(gameSlug);

  const initialQuery = useMemo(
    () => searchParams.get("q") ?? "",
    [searchParams],
  );

  const [{ fromIdx, toIdx }, setRanks] = useState(() => {
    if (!hasLadder(gameSlug)) return { fromIdx: 0, toIdx: 0 };
    const ladder = getLadder(gameSlug);
    return { fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) };
  });
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "All">(
    "All",
  );
  const [query, setQuery] = useState(initialQuery);

  // Keep query in sync if the user fires a fresh ?q= search while already on
  // this route (e.g. from the global Navbar search bar).
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const [sort, setSort] = useState<SortOption>("popular");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const allListings = useListings();

  function resetFilters() {
    setQuery("");
    setServiceFilter("All");
    if (gameHasLadder) {
      const ladder = getLadder(gameSlug);
      setRanks({ fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) });
    }
  }

  const visible = useMemo(
    () =>
      sortListings(
        applyFilters(
          allListings,
          gameSlug,
          fromIdx,
          toIdx,
          serviceFilter,
          query,
          gameHasLadder,
        ),
        sort,
      ),
    [
      allListings,
      gameSlug,
      fromIdx,
      toIdx,
      serviceFilter,
      query,
      sort,
      gameHasLadder,
    ],
  );

  const totalForGame = useMemo(
    () => allListings.filter((l) => l.game === gameSlug).length,
    [allListings, gameSlug],
  );

  return (
    <>
      <Navbar />
      <main>
        {/* Back link + page header */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 md:pt-10"
          aria-labelledby="per-game-heading"
        >
          <Link
            href="/boosts/games"
            className="inline-flex items-center gap-1 text-sm text-white/65 hover:text-white transition-colors mb-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] rounded"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {t("boostsGame.backToAll")}
          </Link>
          <h1
            id="per-game-heading"
            className="font-display text-3xl md:text-4xl font-black text-white"
          >
            {gameName} {t("boostsGame.titleSuffix")}
          </h1>
          <p className="mt-1 text-sm text-white/55">
            {totalForGame === 1
              ? t("boostsGame.subtitleSingle")
              : t("boostsGame.subtitle", { count: totalForGame })}
          </p>
        </section>

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

        {/* Game accent banner */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6">
          <ActiveGameBanner gameSlug={gameSlug} count={visible.length} />
        </section>

        {/* Listings grid — max 5 per row */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 pb-16"
          aria-label={`${gameName} boost listings`}
        >
          {visible.length === 0 ? (
            <EmptyState
              gameName={gameName}
              onReset={resetFilters}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
              {visible.map((l, i) => (
                <BoostCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          )}
        </section>

        <RecentlyCompletedTicker />
      </main>
      <Footer />

      {/* Rank picker drawer — only for games with a real ladder */}
      {gameHasLadder && (
        <ConfiguratorDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <BoostConfigurator
            gameSlug={gameSlug}
            fromIdx={fromIdx}
            toIdx={toIdx}
            onChange={setRanks}
            onCommit={() => setDrawerOpen(false)}
          />
        </ConfiguratorDrawer>
      )}
    </>
  );
}

interface EmptyStateProps {
  gameName: string;
  onReset: () => void;
}

function EmptyState({ gameName, onReset }: EmptyStateProps) {
  const { t } = useLocale();
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 md:p-14 text-center">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-4">
        <Gamepad2
          className="size-6 text-[var(--color-text-muted)]"
          aria-hidden
        />
      </div>
      <h3 className="font-display text-xl font-bold text-white">
        {t("boostsGame.empty.title", { gameName })}
      </h3>
      <p className="mt-2 text-sm md:text-base text-white/65 max-w-md mx-auto">
        {t("boostsGame.empty.body")}
      </p>
      <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-2">
        <Button variant="secondary" size="sm" onClick={onReset}>
          <Sparkles className="size-4" /> {t("boosts.empty.reset")}
        </Button>
        <Link href="/boosts/games">
          <Button variant="secondary" size="sm">
            {t("boostsGame.empty.browse")}
          </Button>
        </Link>
        <Link href="/sell/onboarding">
          <Button size="sm">
            {t("boostsGame.empty.list")} <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ── Filter / sort logic (unchanged from legacy /boosts/page.tsx) ──

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
    if (applyLadder && (l.toIdx < fromIdx || l.fromIdx > toIdx)) return false;
    if (serviceFilter !== "All" && l.serviceType !== serviceFilter) return false;
    if (q) {
      const hay = `${l.title} ${l.serviceType} ${l.boosterTag}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

/**
 * Capitalises each dash- or underscore-separated word in a slug so it
 * reads like a human name even before the canonical DB name resolves.
 * "league-of-legends" → "League Of Legends"
 * "valorant"          → "Valorant"
 * "cs2"               → "Cs2"   (slight mismatch with the real "Counter-Strike 2")
 */
function titleCaseSlug(slug: string): string {
  return slug
    .split(/[-_]/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function sortListings(
  listings: BoostListing[],
  sort: SortOption,
): BoostListing[] {
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
          Number(b.hot) - Number(a.hot) ||
          b.ordersCompleted - a.ordersCompleted,
      );
  }
}
