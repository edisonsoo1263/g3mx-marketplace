"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { games } from "@/lib/data/catalog";
import { cn } from "@/lib/utils/cn";

interface ActiveGameBannerProps {
  gameSlug: string;
  count: number;
}

/**
 * ActiveGameBanner — accent-tinted strip shown above the listings grid that
 * makes the active filter feel intentional. Reads the game's accent color and
 * blends it into a horizontal sweep with the live listing count.
 */
export function ActiveGameBanner({ gameSlug, count }: ActiveGameBannerProps) {
  const game = games.find((g) => g.slug === gameSlug);
  if (!game) return null;
  const accent = game.accent;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl",
        "border bg-[var(--color-bg-panel)]/60",
      )}
      style={{
        borderColor: `${accent}55`,
      }}
    >
      {/* Accent radial bloom */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 0% 50%, ${accent}33 0%, transparent 55%)`,
        }}
      />
      {/* Right-edge accent fade */}
      <div
        aria-hidden
        className="absolute inset-y-0 right-0 w-1/3 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${accent}1f, transparent)`,
        }}
      />

      <div className="relative flex items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <span
            aria-hidden
            className="grid place-items-center size-10 rounded-lg shrink-0 font-display text-base font-black"
            style={{
              background: accent,
              color: "rgb(0 0 0 / 90%)",
              boxShadow: `0 0 16px ${accent}88`,
            }}
          >
            {game.name.slice(0, 1)}
          </span>
          <div className="min-w-0 leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/55">
              Showing
            </div>
            <div className="text-base sm:text-lg font-display font-bold text-white truncate">
              <span className="tabular-nums" style={{ color: accent }}>
                {count}
              </span>{" "}
              {count === 1 ? "boost" : "boosts"} for {game.name}
            </div>
          </div>
        </div>

        {/* Right-side: seller CTA */}
        <Link
          href="/sell/onboarding"
          className={cn(
            "hidden sm:inline-flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-medium",
            "bg-white/5 border border-white/10 text-white/85 cursor-pointer",
            "hover:bg-white/10 hover:text-white hover:-translate-y-0.5",
            "transition-[transform,background-color,color]",
          )}
        >
          <Sparkles className="size-3.5" />
          List your service
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
