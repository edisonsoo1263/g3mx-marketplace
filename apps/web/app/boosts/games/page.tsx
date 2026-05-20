"use client";

import { useMemo, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { Search, X, Clock, ChevronDown } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { useDbGames } from "@/hooks/useDbGames";
import { useListings } from "@/hooks/useListings";
import { useLocale } from "@/hooks/useLocale";
import { pickGameName, type Game } from "@/lib/types/games";
import { games as staticGames } from "@/lib/data/catalog";
import { cn } from "@/lib/utils/cn";

// Prefer DB icon_url; otherwise use the shipped `cardImage` from the static
// catalog so headline titles render artwork without an admin upload step.
function resolveGameImage(game: Game): string | null {
  if (game.icon_url) return game.icon_url;
  const ship = staticGames.find((g) => g.slug === game.slug);
  return ship?.cardImage ?? null;
}

type SortMode = "popular" | "alphabetical" | "priceAsc" | "priceDesc";

interface GameStats {
  count: number;
  minPrice: number | null;
}

/**
 * Main Boosts page — the 39-game grid at /boosts/games.
 *
 * Shows every active, non-deleted game. Games with zero live listings
 * still appear but render with reduced opacity + a "Coming soon" badge
 * (per the redesign spec: "Display all 39 games").
 *
 * Grid breakpoints — caps at 5 columns per the spec, with graceful
 * collapse at smaller viewports:
 *   2 cols mobile · 3 sm · 4 md · 5 xl
 *
 * Sort dropdown:
 *   - Most popular (most listings, tie-break by priority_tier)
 *   - A–Z          (alphabetical by localized display name)
 *   - Price: Low to High  (by cheapest listing per game)
 *   - Price: High to Low  (by cheapest listing, reversed)
 */
export default function MainBoostsPage() {
  const { games, loading } = useDbGames();
  const allListings = useListings();
  const { t } = useLocale();
  const [sort, setSort] = useState<SortMode>("popular");
  const [search, setSearch] = useState("");

  // Roll up listing count + cheapest price per game in one pass.
  const statsByGame = useMemo<Map<string, GameStats>>(() => {
    const map = new Map<string, GameStats>();
    for (const l of allListings) {
      const existing = map.get(l.game) ?? { count: 0, minPrice: null };
      existing.count += 1;
      if (existing.minPrice === null || l.priceUsd < existing.minPrice) {
        existing.minPrice = l.priceUsd;
      }
      map.set(l.game, existing);
    }
    return map;
  }, [allListings]);

  const visibleGames = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? games.filter((g) => {
          const hay = `${pickGameName(g.name)} ${g.slug} ${g.publisher ?? ""}`
            .toLowerCase();
          return hay.includes(q);
        })
      : [...games];

    switch (sort) {
      case "priceAsc":
        return filtered.sort((a, b) => {
          const ap = statsByGame.get(a.slug)?.minPrice;
          const bp = statsByGame.get(b.slug)?.minPrice;
          // 0-listing games sink to the bottom of any price sort —
          // sorting nothing by price is meaningless.
          if (ap === null || ap === undefined) return 1;
          if (bp === null || bp === undefined) return -1;
          return ap - bp;
        });
      case "priceDesc":
        return filtered.sort((a, b) => {
          const ap = statsByGame.get(a.slug)?.minPrice;
          const bp = statsByGame.get(b.slug)?.minPrice;
          if (ap === null || ap === undefined) return 1;
          if (bp === null || bp === undefined) return -1;
          return bp - ap;
        });
      case "alphabetical":
        return filtered.sort((a, b) =>
          pickGameName(a.name).localeCompare(pickGameName(b.name)),
        );
      case "popular":
      default:
        return filtered.sort((a, b) => {
          const aCount = statsByGame.get(a.slug)?.count ?? 0;
          const bCount = statsByGame.get(b.slug)?.count ?? 0;
          if (bCount !== aCount) return bCount - aCount;
          // Tie-break: Tier 1 (MVP) games before Tier 2, etc.
          return a.priority_tier - b.priority_tier;
        });
    }
  }, [games, statsByGame, sort, search]);

  return (
    <>
      <Navbar />
      <main>
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 md:pt-10"
          aria-labelledby="browse-heading"
        >
          <header className="mb-6">
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-neon-cyan)] mb-2">
              G3MX Boosts
            </div>
            <h1
              id="browse-heading"
              className="font-display text-3xl md:text-4xl font-black text-white"
            >
              {t("boostsBrowse.title")}
            </h1>
            <p className="mt-1 text-sm text-white/55">
              {t("boostsBrowse.subtitle", { count: games.length })}
            </p>
          </header>

          {/* Filter row: search + sort */}
          <div className="flex items-center gap-3 flex-wrap mb-6">
            <SearchInput value={search} onChange={setSearch} />
            <SortDropdown value={sort} onChange={setSort} />
          </div>
        </section>

        {/* Games grid — max 5 per row at xl */}
        <section
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16"
          aria-label="All games"
        >
          {loading ? (
            <SkeletonGrid />
          ) : visibleGames.length === 0 ? (
            <NoResults search={search} onClear={() => setSearch("")} />
          ) : (
            <ul
              role="list"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
            >
              {visibleGames.map((g) => (
                <li key={g.id}>
                  <GameCard
                    game={g}
                    stats={statsByGame.get(g.slug) ?? { count: 0, minPrice: null }}
                  />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

// ── Game card ───────────────────────────────────────────────────

interface GameCardProps {
  game: Game;
  stats: GameStats;
}

/**
 * GameCard — 3D-tilt product tile.
 *
 * Layout target (xl 5-col grid renders ~230px wide naturally):
 *   - 230px max card width, capped via max-w
 *   - 4:3 image area (172px at 230px width)
 *   - 12px / 14px body padding
 *   - Genre tag → 10px uppercase, 1.5px letter-spacing
 *   - Title → 15px / 500 weight
 *   - Meta row → 11px, price in #f59e0b
 *
 * 3D effect (skipped under prefers-reduced-motion):
 *   - Parent has perspective: 1000px
 *   - Inner card preserves 3D, rotates ±12deg on mousemove
 *   - Scale 1.04 on hover, shadow offsets opposite of tilt
 *   - Title floats 30px forward, tag 20px (parallax depth)
 *   - Gloss overlay tracks cursor via CSS vars --mx / --my
 */
function GameCard({ game, stats }: GameCardProps) {
  const { t } = useLocale();
  const reduced = useReducedMotion();
  const wrapperRef = useRef<HTMLAnchorElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);

  const name = pickGameName(game.name);
  const hasListings = stats.count > 0;
  const initial = name.charAt(0).toUpperCase();
  const cardImage = resolveGameImage(game);

  function handleMouseMove(e: MouseEvent<HTMLAnchorElement>) {
    if (reduced || !wrapperRef.current || !cardRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;
    const cx = w / 2;
    const cy = h / 2;

    // Normalised cursor offset from center, -1 (left/top) to 1 (right/bottom)
    const dx = (x - cx) / cx;
    const dy = (y - cy) / cy;

    // Tilt: ±12deg max. Y-axis tilt follows horizontal cursor;
    // X-axis tilt is inverted so the top edge dips when the cursor
    // is above center (matches natural "lean toward the cursor").
    const rotateY = dx * 12;
    const rotateX = -dy * 12;

    // Shadow shifts opposite to tilt direction so the card feels
    // illuminated from the cursor side.
    const shadowX = -dx * 18;
    const shadowY = -dy * 18 + 14;

    cardRef.current.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(1.04)`;
    cardRef.current.style.boxShadow = `${shadowX.toFixed(0)}px ${shadowY.toFixed(0)}px 32px rgba(0,0,0,0.55)`;

    if (glossRef.current) {
      glossRef.current.style.setProperty(
        "--mx",
        `${((x / w) * 100).toFixed(1)}%`,
      );
      glossRef.current.style.setProperty(
        "--my",
        `${((y / h) * 100).toFixed(1)}%`,
      );
    }
  }

  function handleMouseLeave() {
    if (!cardRef.current) return;
    cardRef.current.style.transform =
      "rotateX(0deg) rotateY(0deg) scale(1)";
    cardRef.current.style.boxShadow = "0 10px 30px rgba(0,0,0,0.4)";
    if (glossRef.current) {
      glossRef.current.style.setProperty("--mx", "50%");
      glossRef.current.style.setProperty("--my", "50%");
    }
  }

  return (
    <Link
      ref={wrapperRef}
      href={`/boosts/games/${encodeURIComponent(game.slug)}`}
      aria-label={t("boostsBrowse.card.aria", { gameName: name })}
      onMouseMove={reduced ? undefined : handleMouseMove}
      onMouseLeave={reduced ? undefined : handleMouseLeave}
      className={cn(
        "group block w-full max-w-[230px] mx-auto rounded-xl",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-deep)]",
      )}
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        className={cn(
          "relative overflow-hidden rounded-xl",
          !hasListings && "opacity-70 group-hover:opacity-90",
        )}
        style={{
          background: "#0f0f0f",
          transformStyle: "preserve-3d",
          transition:
            "transform 0.15s ease-out, box-shadow 0.3s ease, opacity 0.2s ease",
          boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
          willChange: reduced ? undefined : "transform",
        }}
      >
        {/* ── Image area (230×172 at target width, 4:3 elsewhere) ── */}
        <div
          className="relative w-full aspect-[4/3]"
          style={
            cardImage
              ? {
                  backgroundImage: `url(${cardImage})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center 30%",
                }
              : undefined
          }
        >
          {/* Letter placeholder when no artwork is available */}
          {!cardImage && (
            <div
              aria-hidden
              className="absolute inset-0 grid place-items-center font-display text-5xl font-black"
              style={{
                background:
                  "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
                color: "var(--color-neon-amber)",
                textShadow: "0 0 26px rgba(245,158,11,0.55)",
              }}
            >
              {initial}
            </div>
          )}

          {/* Dark gradient overlay for body-row readability */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)",
            }}
          />

          {/* Cursor-tracked gloss layer (radial gradient + overlay blend) */}
          <div
            ref={glossRef}
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={
              {
                background:
                  "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.18), transparent 40%)",
                mixBlendMode: "overlay",
                "--mx": "50%",
                "--my": "50%",
              } as React.CSSProperties
            }
          />

          {/* "Coming soon" badge — floats forward in 3D so it stays
              readable when the card tilts. */}
          {!hasListings && (
            <span
              className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 h-6 rounded-md text-[10px] font-mono uppercase tracking-[0.14em] font-bold backdrop-blur-sm"
              style={{
                background: "rgba(15,23,42,0.75)",
                color: "rgba(255,255,255,0.92)",
                border: "1px solid rgba(255,255,255,0.22)",
                transform: "translateZ(40px)",
              }}
            >
              <Clock className="size-3" aria-hidden />
              {t("boostsBrowse.card.zeroListings")}
            </span>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div style={{ padding: "12px 14px" }}>
          <div
            className="uppercase truncate"
            style={{
              fontSize: "10px",
              letterSpacing: "1.5px",
              color: "#888",
              marginBottom: "4px",
              transform: "translateZ(20px)",
            }}
          >
            {game.category}
          </div>
          <h3
            style={{
              fontSize: "15px",
              fontWeight: 500,
              color: "#fff",
              marginBottom: "8px",
              transform: "translateZ(30px)",
              lineHeight: 1.25,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              minHeight: "2.5em",
            }}
          >
            {name}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <span style={{ fontSize: "11px", color: "#888" }}>
              {hasListings
                ? stats.count === 1
                  ? t("boostsBrowse.card.singleListing")
                  : t("boostsBrowse.card.listingCount", {
                      count: stats.count,
                    })
                : t("boostsBrowse.card.zeroListings")}
            </span>
            {hasListings && stats.minPrice !== null && (
              <span
                className="tabular-nums"
                style={{
                  fontSize: "11px",
                  color: "#f59e0b",
                  fontWeight: 600,
                }}
                aria-label={`From $${stats.minPrice.toFixed(0)}`}
              >
                {t("boostsBrowse.card.fromPrice", {
                  price: stats.minPrice.toFixed(0),
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Controls ────────────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useLocale();
  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search
        aria-hidden
        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/45 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("boostsBrowse.search.placeholder")}
        aria-label={t("boostsBrowse.search.placeholder")}
        className={cn(
          "w-full h-11 pl-10 pr-10 rounded-full text-sm text-white",
          "bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]",
          "focus:border-[var(--color-neon-cyan)] outline-none transition-colors",
          "placeholder:text-white/40",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)]/30",
        )}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-full text-white/55 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)]"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortMode;
  onChange: (v: SortMode) => void;
}) {
  const { t } = useLocale();
  // Native <select> for accessibility — keyboard nav, screen readers, and
  // mobile pickers all work out of the box. Custom-styled to match the
  // search input alongside it.
  return (
    <div className="relative">
      <label htmlFor="boosts-sort" className="sr-only">
        {t("boostsBrowse.sort.label")}
      </label>
      <select
        id="boosts-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as SortMode)}
        className={cn(
          "h-11 pl-4 pr-10 rounded-full text-sm text-white cursor-pointer",
          "bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]",
          "focus:border-[var(--color-neon-cyan)] outline-none transition-colors",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)]/30",
          "appearance-none",
        )}
      >
        <option value="popular">{t("boostsBrowse.sort.popular")}</option>
        <option value="alphabetical">
          {t("boostsBrowse.sort.alphabetical")}
        </option>
        <option value="priceAsc">{t("boostsBrowse.sort.priceAsc")}</option>
        <option value="priceDesc">{t("boostsBrowse.sort.priceDesc")}</option>
      </select>
      <ChevronDown
        aria-hidden
        className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-white/55 pointer-events-none"
      />
    </div>
  );
}

// ── States ──────────────────────────────────────────────────────

function SkeletonGrid() {
  return (
    <ul
      role="list"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
      aria-busy="true"
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <li key={i}>
          <div className="aspect-[4/3] rounded-t-xl bg-[var(--color-bg-panel)]/40 animate-pulse" />
          <div className="rounded-b-xl border-x border-b border-[var(--color-border-subtle)] p-3 space-y-2">
            <div className="h-3 w-1/3 bg-[var(--color-bg-panel-elevated)]/40 rounded animate-pulse" />
            <div className="h-4 w-2/3 bg-[var(--color-bg-panel-elevated)]/40 rounded animate-pulse" />
            <div className="h-3 w-full bg-[var(--color-bg-panel-elevated)]/30 rounded animate-pulse" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function NoResults({
  search,
  onClear,
}: {
  search: string;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 text-center">
      <div className="mx-auto grid place-items-center size-12 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-3">
        <Search className="size-5 text-[var(--color-text-muted)]" aria-hidden />
      </div>
      <div className="text-sm text-white/75">
        No games match &ldquo;{search}&rdquo;
      </div>
      <button
        type="button"
        onClick={onClear}
        className="mt-3 text-xs font-mono uppercase tracking-wider text-[var(--color-neon-cyan)] hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-neon-cyan)] rounded"
      >
        Clear search
      </button>
    </div>
  );
}
