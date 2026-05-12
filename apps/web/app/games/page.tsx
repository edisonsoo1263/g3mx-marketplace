"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Coins,
  Gamepad2,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { listPublicGames } from "@/lib/api/games-client";
import {
  GAME_CATEGORIES,
  GAME_PLATFORMS,
  pickGameName,
  type Game,
  type GameCategory,
  type GamePlatform,
} from "@/lib/types/games";
import { cn } from "@/lib/utils/cn";

/**
 * Public /games page — browse the catalogue of supported titles.
 *
 * Each card shows the game name, category, platforms, and which of the three
 * services (boost / account / top-up) are available. Click → /games/[slug].
 */
export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState<GameCategory | "">("");
  const [platform, setPlatform] = useState<GamePlatform | "">("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    listPublicGames({
      category: category || undefined,
      platform: platform || undefined,
    })
      .then((data) => {
        if (!cancelled) setGames(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Load failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, platform]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, Game[]>();
    for (const g of games) {
      const arr = byCategory.get(g.category) ?? [];
      arr.push(g);
      byCategory.set(g.category, arr);
    }
    return [...byCategory.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [games]);

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <header className="space-y-3">
          <PixelBadge tone="cyan">
            <Gamepad2 className="size-3" /> Games catalogue
          </PixelBadge>
          <h1
            className="font-display font-black tracking-tight text-white"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            All supported titles
          </h1>
          <p className="text-white/75 max-w-2xl">
            Every game G3MX runs services for — boosting, account trading,
            in-game top-ups. Pick a title to see what sellers offer.
          </p>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <FilterGroup
            label="Category"
            value={category}
            options={[{ value: "", label: "All" }, ...GAME_CATEGORIES.map((c) => ({ value: c, label: c }))]}
            onChange={(v) => setCategory(v as GameCategory | "")}
          />
          <FilterGroup
            label="Platform"
            value={platform}
            options={[{ value: "", label: "All" }, ...GAME_PLATFORMS.map((p) => ({ value: p, label: p }))]}
            onChange={(v) => setPlatform(v as GamePlatform | "")}
          />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[180px] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 p-6 text-sm text-[var(--color-danger)]">
            {error}
          </div>
        ) : games.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 md:p-14 text-center">
            <p className="text-white/75 text-sm">
              No games match these filters yet.
            </p>
          </div>
        ) : (
          grouped.map(([cat, list]) => (
            <section key={cat} className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="font-display text-xl font-bold text-white">
                  {cat}
                </h2>
                <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/45">
                  {list.length} title{list.length === 1 ? "" : "s"}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {list.map((g) => (
                  <GameCatalogueCard key={g.id} game={g} />
                ))}
              </div>
            </section>
          ))
        )}
      </main>
      <Footer />
    </>
  );
}

function FilterGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/45">
        {label}
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value || "all"}
              type="button"
              onClick={() => onChange(opt.value)}
              className={cn(
                "px-3 h-8 rounded-full text-xs font-medium border cursor-pointer transition-colors",
                active
                  ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-white"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 text-white/70 hover:text-white hover:border-[var(--color-border-strong)]",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function GameCatalogueCard({ game }: { game: Game }) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className={cn(
        "group relative rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/70 p-4",
        "transition-[border-color,background-color,transform] duration-300",
        "hover:border-[var(--color-neon-cyan)]/40 hover:bg-[var(--color-bg-panel)] hover:-translate-y-0.5",
      )}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 leading-tight">
          <div className="font-semibold text-white truncate text-base">
            {pickGameName(game.name)}
          </div>
          <div className="text-[11px] font-mono text-white/55 truncate">
            {game.publisher ?? "—"}
          </div>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 shrink-0">
          {game.category}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-3">
        {game.platforms.map((p) => (
          <span
            key={p}
            className="inline-flex items-center px-2 h-5 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/75"
          >
            {p}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mb-3">
        <ServicePill
          label="Boost"
          enabled={game.services.boosting.enabled}
          icon={Trophy}
        />
        <ServicePill
          label="Account"
          enabled={game.services.account_trading.enabled}
          icon={Users}
        />
        <ServicePill
          label="Top-up"
          enabled={game.services.top_up.enabled}
          icon={Coins}
        />
      </div>

      <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono uppercase tracking-[0.2em] text-white/55">
        <span>Browse listings</span>
        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
      </div>

      {game.priority_tier === 1 && (
        <span className="absolute -top-2 left-4 inline-flex items-center gap-1 px-2 h-5 rounded-full bg-[var(--color-neon-cyan)]/15 border border-[var(--color-neon-cyan)]/40 text-[9px] font-mono uppercase tracking-[0.22em] text-[var(--color-neon-cyan)]">
          <Sparkles className="size-2.5" /> Featured
        </span>
      )}
    </Link>
  );
}

function ServicePill({
  label,
  enabled,
  icon: Icon,
}: {
  label: string;
  enabled: boolean;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 h-6 rounded-full text-[10px] font-medium border",
        enabled
          ? "border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/10 text-white"
          : "border-white/10 bg-white/[0.03] text-white/35",
      )}
    >
      <Icon className="size-2.5" />
      {label}
    </span>
  );
}
