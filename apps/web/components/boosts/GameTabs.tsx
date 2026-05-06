"use client";

import { cn } from "@/lib/utils/cn";
import { games, type Game } from "@/lib/data/catalog";

interface GameTabsProps {
  active: string;
  onChange: (slug: string) => void;
}

export function GameTabs({ active, onChange }: GameTabsProps) {
  return (
    <div className="border-y border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/40 backdrop-blur-md sticky top-16 z-30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-thin">
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)] mr-1 hidden sm:inline shrink-0">
            Game ·
          </span>
          {games.map((g) => (
            <GameTab key={g.slug} game={g} active={active === g.slug} onClick={() => onChange(g.slug)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function GameTab({ game, active, onClick }: { game: Game; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 inline-flex items-center gap-2 px-4 h-10 rounded-full",
        "text-sm font-medium cursor-pointer select-none",
        "border transition-[transform,border-color,background-color,color,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 active:translate-y-0",
        active
          ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-[var(--color-text-primary)] shadow-[0_0_24px_oklch(78%_0.18_200/30%)]"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]",
      )}
    >
      <span
        className="size-2 rounded-full shrink-0"
        style={{
          background: game.accent,
          boxShadow: active ? `0 0 10px ${game.accent}` : `0 0 4px ${game.accent}80`,
        }}
      />
      <span>{game.name}</span>
      <span className="text-[10px] font-mono opacity-60">{game.region}</span>
    </button>
  );
}
