"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { games, type Game } from "@/lib/data/catalog";
import { GameArt } from "@/components/boosts/GameArt";
import { cn } from "@/lib/utils/cn";

interface GameShowcaseProps {
  active: string;
  onChange: (slug: string) => void;
  /** Number of listings per game, keyed by slug. */
  countsByGame: Record<string, number>;
}

/**
 * GameShowcase — primary game-picker for the Boosts page.
 *
 * Each card is built up in this order (back → front):
 *   1. Dark base (so the artwork is the source of color)
 *   2. Card image if `game.cardImage` is set, otherwise the stylized GameArt
 *   3. Heavy accent multiply tint (so any image color-grades into the brand)
 *   4. Bottom dark gradient for label legibility
 *   5. Active accent stripe + checkmark when selected
 *   6. Border + outer glow in the accent color (frames the whole card)
 *
 * The framing intentionally mirrors a "neon-bordered photo card" pattern: a
 * thin solid accent border + soft outer glow + dark base, so any artwork
 * dropped into /public/games/ reads cleanly with consistent visual weight.
 */
export function GameShowcase({ active, onChange, countsByGame }: GameShowcaseProps) {
  const reduced = useReducedMotion();
  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/55">
            Browse by game
          </h2>
          <span className="text-[10px] font-mono text-white/40">
            {games.length} titles
          </span>
        </div>

        <ul
          className={cn(
            "flex gap-4 overflow-x-auto pb-3 -mx-4 px-4",
            "sm:mx-0 sm:px-0 sm:overflow-visible",
            "sm:grid sm:grid-cols-3 sm:gap-4",
            "lg:grid-cols-6 lg:gap-5",
          )}
        >
          {games.map((g, idx) => (
            <motion.li
              key={g.slug}
              initial={reduced ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: reduced ? 0 : idx * 0.05,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="shrink-0 sm:shrink min-w-[200px] sm:min-w-0"
            >
              <GameCard
                game={g}
                active={g.slug === active}
                count={countsByGame[g.slug] ?? 0}
                onClick={() => onChange(g.slug)}
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

interface GameCardProps {
  game: Game;
  active: boolean;
  count: number;
  onClick: () => void;
}

function GameCard({ game, active, count, onClick }: GameCardProps) {
  const accent = game.accent;
  const hasImage = Boolean(game.cardImage);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={`Browse ${game.name} boosts`}
      className={cn(
        "group relative w-full aspect-[5/3] rounded-2xl overflow-hidden cursor-pointer select-none",
        "transition-[transform,filter] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-1.5 hover:brightness-110 active:translate-y-0",
        "bg-[var(--color-bg-deep)]",
      )}
      style={{
        // Thin solid accent border — sharp framing, no gradient
        border: `${active ? "2px" : "1.5px"} solid ${active ? accent : `${accent}80`}`,
        // Soft outer glow — the visual separator between cards
        boxShadow: active
          ? `0 0 0 3px ${accent}33, 0 0 36px ${accent}99, 0 12px 32px rgb(0 0 0 / 60%)`
          : `0 0 24px ${accent}44, 0 6px 18px rgb(0 0 0 / 50%)`,
      }}
    >
      {/* Layer 1: Card art — image when provided, SVG fallback otherwise.
          Panel images carry their own rounded-frame artwork at the edges; we
          overscan by ~8% so that built-in frame is cropped past the card's
          rounded corners. The card's own neon border then sits flush against
          actual artwork instead of the panel's dark gutter. */}
      {hasImage ? (
        <div className="absolute inset-0 overflow-hidden rounded-[14px]">
          <Image
            src={game.cardImage as string}
            alt=""
            fill
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 50vw, 90vw"
            quality={95}
            priority
            className="object-cover scale-[1.08]"
          />
        </div>
      ) : (
        <GameArt
          gameSlug={game.slug}
          accent={accent}
          className="absolute inset-0 size-full"
        />
      )}

      {/* Layer 2: Light accent halo — only for SVG fallback. The pre-graded
                  image panels already carry the brand color so re-tinting
                  would over-saturate; we only add a subtle corner glow. */}
      {!hasImage && (
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${accent}33 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Layer 3: Bottom dark vignette — label legibility. Lighter for image
                  cards (the panels already have their own bottom darkening). */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: hasImage
            ? "linear-gradient(to top, rgb(0 0 0 / 70%) 0%, rgb(0 0 0 / 25%) 40%, transparent 65%)"
            : "linear-gradient(to top, rgb(0 0 0 / 90%) 0%, rgb(0 0 0 / 45%) 40%, transparent 70%)",
        }}
      />

      {/* Layer 4: Top accent stripe (always present, brighter when active) */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: active ? "2.5px" : "1px",
          background: active
            ? `linear-gradient(to right, transparent, ${accent}, transparent)`
            : `linear-gradient(to right, transparent, ${accent}99, transparent)`,
          boxShadow: active ? `0 0 16px ${accent}` : undefined,
        }}
      />

      {/* Active checkmark */}
      {active && (
        <span
          aria-hidden
          className="absolute top-3 right-3 grid place-items-center size-7 rounded-full font-bold"
          style={{
            background: accent,
            color: "rgb(0 0 0 / 90%)",
            boxShadow: `0 0 16px ${accent}, 0 4px 10px rgb(0 0 0 / 50%)`,
          }}
        >
          <Check className="size-4" strokeWidth={3} />
        </span>
      )}

      {/* Listings count chip */}
      {count > 0 && (
        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white bg-black/70 backdrop-blur-sm border border-white/10">
          {count} {count === 1 ? "listing" : "listings"}
        </span>
      )}

      {/* Bottom labels */}
      <div className="absolute inset-x-3 bottom-3">
        <div
          className="text-[10px] font-mono uppercase tracking-[0.25em] mb-1"
          style={{ color: `${accent}dd` }}
        >
          {game.region}
        </div>
        <div className="font-display text-base sm:text-lg font-bold text-white tracking-tight leading-tight drop-shadow-[0_2px_8px_rgb(0_0_0_/_85%)]">
          {game.name}
        </div>
      </div>
    </button>
  );
}
