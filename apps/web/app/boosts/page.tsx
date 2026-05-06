"use client";

import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { BoostsPageHeader } from "@/components/boosts/BoostsPageHeader";
import { GameTabs } from "@/components/boosts/GameTabs";
import { HeroSearch } from "@/components/boosts/HeroSearch";
import { QuickFilterPills } from "@/components/boosts/QuickFilterPills";
import { BoostConfigurator } from "@/components/boosts/BoostConfigurator";
import { BoostCard } from "@/components/boosts/BoostCard";
import { BoostsResultsHeader } from "@/components/boosts/BoostsResultsHeader";
import { RecentlyCompletedTicker } from "@/components/boosts/RecentlyCompletedTicker";
import { Button } from "@/components/ui/Button";
import {
  type BoostListing,
  type ServiceType,
} from "@/lib/data/boostListings";
import { getLadder, type SortOption } from "@/lib/data/ranks";
import { useListings } from "@/hooks/useListings";

const DEFAULT_GAME = "valorant";

export default function BoostsPage() {
  const [game, setGame] = useState<string>(DEFAULT_GAME);
  const [{ fromIdx, toIdx }, setRanks] = useState(() => {
    const ladder = getLadder(DEFAULT_GAME);
    return { fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) };
  });
  const [serviceFilter, setServiceFilter] = useState<ServiceType | "All">("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortOption>("popular");

  // Merged feed: seller-published listings (newest first) + seed catalog.
  // Reactively re-renders when a listing is published in any tab.
  const allListings = useListings();

  function changeGame(slug: string) {
    setGame(slug);
    const ladder = getLadder(slug);
    setRanks({ fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) });
  }

  function resetFilters() {
    setQuery("");
    setServiceFilter("All");
    const ladder = getLadder(game);
    setRanks({ fromIdx: 0, toIdx: Math.min(ladder.tiers.length - 1, 4) });
  }

  const visible = useMemo(
    () => sortListings(applyFilters(allListings, game, fromIdx, toIdx, serviceFilter, query), sort),
    [allListings, game, fromIdx, toIdx, serviceFilter, query, sort],
  );

  const totalForGame = useMemo(
    () => allListings.filter((l) => l.game === game).length,
    [allListings, game],
  );

  return (
    <>
      <Navbar />
      <main>
        <BoostsPageHeader />

        {/* Hero search bar */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-8">
          <HeroSearch
            query={query}
            onQueryChange={setQuery}
            onPickGame={changeGame}
            onPickServiceType={(s) => setServiceFilter(s as ServiceType)}
          />
        </section>

        {/* Game tabs (sticky) */}
        <GameTabs active={game} onChange={changeGame} />

        {/* Service-type quick pills */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-3">
            Service type
          </div>
          <QuickFilterPills active={serviceFilter} onChange={setServiceFilter} />
        </section>

        {/* Boost Configurator — the centerpiece */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <BoostConfigurator
            gameSlug={game}
            fromIdx={fromIdx}
            toIdx={toIdx}
            onChange={setRanks}
          />
        </section>

        {/* Listings grid */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
          <BoostsResultsHeader
            count={visible.length}
            totalCount={totalForGame}
            sort={sort}
            onSortChange={setSort}
          />

          {visible.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {visible.map((l, i) => (
                <BoostCard key={l.id} listing={l} index={i} />
              ))}
            </div>
          )}
        </section>

        <RecentlyCompletedTicker />
      </main>
      <Footer />
    </>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 text-center">
      <div className="mx-auto grid place-items-center size-12 rounded-full bg-[var(--color-bg-panel-elevated)] mb-4">
        <Search className="size-5 text-[var(--color-text-muted)]" />
      </div>
      <h3 className="font-display text-lg font-semibold text-[var(--color-text-primary)]">
        No boosters match these filters
      </h3>
      <p className="mt-1 text-base text-[var(--color-text-secondary)] max-w-sm mx-auto">
        Try widening your rank range, switching service type, or clearing the search.
      </p>
      <div className="mt-5 inline-flex gap-2">
        <Button variant="secondary" size="sm" onClick={onReset}>
          <Sparkles className="size-4" /> Reset all
        </Button>
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
): BoostListing[] {
  const q = query.trim().toLowerCase();
  return listings.filter((l) => {
    if (l.game !== game) return false;
    if (l.toIdx < fromIdx || l.fromIdx > toIdx) return false;
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
          Number(b.hot) - Number(a.hot) ||
          b.ordersCompleted - a.ordersCompleted,
      );
  }
}
