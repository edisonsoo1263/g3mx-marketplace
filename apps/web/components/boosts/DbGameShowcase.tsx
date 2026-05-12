"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Search, Gamepad2, X, Clock } from "lucide-react";
import { useDbGames } from "@/hooks/useDbGames";
import {
  pickGameName,
  type Game,
  type GameCategory,
} from "@/lib/types/games";
import { getGameTheme } from "@/lib/data/gameThemes";
import { cn } from "@/lib/utils/cn";

interface Props {
  active: string;
  onChange: (slug: string) => void;
  countsByGame?: Record<string, number>;
}

/**
 * DbGameShowcase — DB-driven replacement for the static game grid.
 *
 * Layout:
 *   - Sticky search input
 *   - Horizontally-scrolling category filter pills (mobile-friendly)
 *   - Responsive 2/3/4/5/6-col game grid with lazy-loaded icons
 *
 * Mobile rules:
 *   - Cards stay at 2 across (touch-friendly hit areas)
 *   - Category pills scroll horizontally with momentum (overflow-x-auto)
 *   - All taps are 32px+ tall
 */
export function DbGameShowcase({
  active,
  onChange,
  countsByGame = {},
}: Props) {
  const { games, loading, error } = useDbGames();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<GameCategory | "all">("all");

  // Categories actually present in the result set — keeps the filter row from
  // showing "Card" / "Survival" / etc. when no games of that type are listed.
  const availableCategories = useMemo(() => {
    const set = new Set<GameCategory>();
    for (const g of games) set.add(g.category);
    return [...set].sort();
  }, [games]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return games.filter((g) => {
      if (category !== "all" && g.category !== category) return false;
      if (q) {
        const hay = `${pickGameName(g.name)} ${g.slug} ${g.publisher ?? ""}`
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [games, search, category]);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">
      <header className="mb-3 flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/55 mb-1">
            Select your game
          </div>
          <h2 className="font-display text-lg md:text-xl font-bold text-white">
            {games.length === 0 && !loading
              ? "No games available"
              : `${games.length} title${games.length === 1 ? "" : "s"} supported`}
          </h2>
        </div>
        <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
          {filtered.length === games.length
            ? `${games.length}`
            : `${filtered.length} of ${games.length}`}
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-3">
        <Search
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-white/45 pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search games — Valorant, LoL, Genshin…"
          aria-label="Search games"
          className={cn(
            "w-full h-11 pl-10 pr-10 rounded-full text-sm text-white",
            "bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]",
            "focus:border-[var(--color-neon-cyan)] outline-none transition-colors",
            "placeholder:text-white/40",
          )}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            aria-label="Clear search"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded-full text-white/55 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Category pills — horizontally scrollable on mobile */}
      <div className="relative -mx-1 mb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto px-1 pb-1 scrollbar-thin scroll-smooth snap-x snap-mandatory">
          <CategoryPill
            label="All"
            active={category === "all"}
            onClick={() => setCategory("all")}
          />
          {availableCategories.map((c) => (
            <CategoryPill
              key={c}
              label={c}
              active={category === c}
              onClick={() => setCategory(c)}
            />
          ))}
        </div>
      </div>

      {/* Grid / states */}
      {loading ? (
        <SkeletonGrid />
      ) : error ? (
        <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-5 text-sm text-[var(--color-danger)]">
          Couldn&apos;t load games: {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-8 text-center">
          <Gamepad2 className="mx-auto size-6 text-white/45 mb-2" />
          <div className="text-sm text-white/75">
            No games match these filters yet.
          </div>
        </div>
      ) : (
        <div
          className="grid gap-2 sm:gap-3"
          style={{
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 140px), 1fr))",
          }}
        >
          {filtered.map((g) => (
            <GameCard
              key={g.id}
              game={g}
              active={active === g.slug}
              count={countsByGame[g.slug] ?? 0}
              onSelect={() => onChange(g.slug)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Tiny building blocks ──────────────────────────────────────

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 snap-start px-3.5 h-9 rounded-full text-xs font-medium border cursor-pointer transition-colors whitespace-nowrap",
        active
          ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-white"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 text-white/70 hover:text-white hover:border-[var(--color-border-strong)]",
      )}
    >
      {label}
    </button>
  );
}

function GameCard({
  game,
  active,
  count,
  onSelect,
}: {
  game: Game;
  active: boolean;
  count: number;
  onSelect: () => void;
}) {
  const theme = getGameTheme(game.slug, game.category);
  const { primary, secondary } = theme;
  const name = pickGameName(game.name);
  const initial = name.charAt(0);
  const inactive = !game.is_active;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={active}
      aria-disabled={inactive ? "true" : undefined}
      title={inactive ? `${name} — coming soon` : undefined}
      className={cn(
        "group relative aspect-[3/4] rounded-xl p-2.5 cursor-pointer text-left flex flex-col overflow-hidden",
        "border transition-[border-color,background-color,transform,opacity] duration-300 ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5",
        inactive && "opacity-65 hover:opacity-90",
      )}
      style={{
        borderColor: active ? "var(--color-neon-cyan)" : `${primary}40`,
        background: active
          ? `linear-gradient(160deg, ${primary}26 0%, ${secondary}10 60%, transparent 100%), var(--color-bg-panel)`
          : `linear-gradient(160deg, ${primary}16 0%, ${secondary}06 50%, var(--color-bg-panel) 100%)`,
        boxShadow: active ? `0 0 24px ${primary}33` : undefined,
      }}
    >
      {/* Faint corner glow — pure decoration, picks up the game's primary */}
      <span
        aria-hidden
        className="absolute -top-6 -right-6 size-20 rounded-full pointer-events-none blur-xl opacity-60 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: primary }}
      />

      {/* Icon area */}
      <div
        aria-hidden
        className="relative aspect-square rounded-lg mb-2 grid place-items-center overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${primary}33 0%, ${secondary}22 100%)`,
          border: `1px solid ${primary}55`,
          boxShadow: `inset 0 0 20px ${secondary}1a`,
        }}
      >
        {game.icon_url ? (
          <Image
            src={game.icon_url}
            alt=""
            width={200}
            height={200}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <span
            className="font-display text-3xl sm:text-4xl font-black"
            style={{
              color: primary,
              textShadow: `0 0 18px ${primary}99, 0 0 36px ${primary}55`,
            }}
          >
            {initial}
          </span>
        )}
      </div>

      <div className="relative font-semibold text-white text-xs leading-tight line-clamp-2">
        {name}
      </div>
      <div className="relative mt-auto pt-1 text-[10px] font-mono text-white/55 truncate">
        {game.category}
      </div>

      {/* Listing count badge */}
      {count > 0 && (
        <span
          className="absolute top-1.5 right-1.5 inline-flex items-center px-1.5 h-5 rounded-full text-[10px] font-mono font-bold"
          style={{
            background: primary,
            color: "#0f1923",
          }}
        >
          {count}
        </span>
      )}

      {/* Inactive marker — "SOON" pill */}
      {inactive && (
        <span
          className="absolute top-1.5 right-1.5 inline-flex items-center gap-1 px-1.5 h-5 rounded-full text-[9px] font-mono uppercase tracking-[0.18em] font-bold backdrop-blur-sm"
          style={{
            background: "rgba(15,23,42,0.7)",
            color: "rgba(255,255,255,0.85)",
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <Clock className="size-2.5" />
          Soon
        </span>
      )}

      {/* Tier-1 marker — subtle "featured" dot */}
      {game.priority_tier === 1 && !active && !inactive && (
        <span
          aria-hidden
          className="absolute top-1.5 left-1.5 size-1.5 rounded-full"
          style={{
            background: primary,
            boxShadow: `0 0 8px ${primary}`,
          }}
        />
      )}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div
      className="grid gap-2 sm:gap-3"
      style={{
        gridTemplateColumns:
          "repeat(auto-fill, minmax(min(100%, 140px), 1fr))",
      }}
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[3/4] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
        />
      ))}
    </div>
  );
}

// Per-game themes now live in lib/data/gameThemes.ts — keeps the colour map
// out of this presentational component.
