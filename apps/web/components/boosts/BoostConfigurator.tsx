"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Sparkles, TrendingUp, ShieldCheck, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { getLadder, type RankTier } from "@/lib/data/ranks";
import { games } from "@/lib/data/catalog";

interface BoostConfiguratorProps {
  gameSlug: string;
  fromIdx: number;
  toIdx: number;
  onChange: (next: { fromIdx: number; toIdx: number }) => void;
}

/**
 * BoostConfigurator — buyer's interactive rank picker + live price/ETA/XP
 * estimate. Optimized for the configurator drawer (single-column at any
 * viewport, ~280-600px wide). Stacks vertically: header → rank summary →
 * tier pickers → calc card.
 *
 * Pricing model (transparent, can be tuned):
 *   - base    = 12 USD per tier of climb
 *   - factor  = exponential difficulty curve at higher tiers
 *   - eta     = 6 hours per tier × 1.18^max(0, fromIdx-3)
 *   - xpYield = priceUsd × 5 + tiersClimbed × 50
 */
export function BoostConfigurator({
  gameSlug,
  fromIdx,
  toIdx,
  onChange,
}: BoostConfiguratorProps) {
  const ladder = getLadder(gameSlug);
  const game = games.find((g) => g.slug === gameSlug);
  const tiers = ladder.tiers;
  const fromTier = tiers[fromIdx];
  const toTier = tiers[toIdx];

  const calc = useMemo(
    () => calculate(fromIdx, toIdx),
    [fromIdx, toIdx],
  );

  function setFrom(i: number) {
    onChange({ fromIdx: i, toIdx: Math.max(i, toIdx) });
  }
  function setTo(i: number) {
    onChange({ fromIdx: Math.min(i, fromIdx), toIdx: i });
  }

  return (
    <section className="space-y-5">
      {/* Compact header */}
      <header>
        <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-neon-cyan)]">
          Boost configurator
        </div>
        <h2 className="mt-1 font-display text-2xl font-bold text-white leading-tight">
          Plot your climb
        </h2>
        {game && (
          <div
            className="mt-2 inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em]"
            style={{ color: game.accent }}
          >
            <span
              className="size-2 rounded-full"
              style={{ background: game.accent, boxShadow: `0 0 8px ${game.accent}` }}
            />
            {game.name}
          </div>
        )}
      </header>

      {/* Live calc card — at the top so the price is always the first thing
          the user sees; they can adjust ranks below and watch it update. */}
      <CalcCard
        calc={calc}
        fromTier={fromTier}
        toTier={toTier}
        tiersClimbed={Math.max(0, toIdx - fromIdx)}
      />

      {/* Rank picker panel */}
      <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 p-4 space-y-5">
        {/* Current → Desired summary */}
        <div className="grid grid-cols-2 gap-2.5">
          <RankSummaryCompact label="Current" tier={fromTier} index={fromIdx} />
          <RankSummaryCompact label="Desired" tier={toTier} index={toIdx} highlighted />
        </div>

        {/* Tier pickers */}
        <RankPickerRow
          label="Current rank"
          tiers={tiers}
          selectedIdx={fromIdx}
          otherIdx={toIdx}
          mode="from"
          onPick={setFrom}
        />
        <RankPickerRow
          label="Desired rank"
          tiers={tiers}
          selectedIdx={toIdx}
          otherIdx={fromIdx}
          mode="to"
          onPick={setTo}
        />
      </div>
    </section>
  );
}

// ── Calculation ─────────────────────────────────────────────────

interface CalcResult {
  priceUsd: number;
  etaHours: number;
  xpReward: number;
  levelDelta: number;
}

function calculate(fromIdx: number, toIdx: number): CalcResult {
  const climb = Math.max(0, toIdx - fromIdx);
  const baseTier = 12;
  let priceUsd = 0;
  for (let i = fromIdx; i < toIdx; i++) {
    priceUsd += baseTier * Math.pow(1.45, i);
  }
  priceUsd = Math.max(0, Math.round(priceUsd));

  const etaHours = Math.round(climb * 6 * Math.pow(1.18, Math.max(0, fromIdx - 3)));
  const xpReward = priceUsd * 5 + climb * 50;
  const levelDelta = Math.max(0, Math.round(xpReward / 1000));

  return { priceUsd, etaHours, xpReward, levelDelta };
}

// ── Rank summary card ──────────────────────────────────────────

interface RankSummaryCompactProps {
  label: string;
  tier: RankTier;
  index: number;
  highlighted?: boolean;
}

function RankSummaryCompact({ label, tier, index, highlighted }: RankSummaryCompactProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-3 min-w-0",
        "border bg-[var(--color-bg-panel)]/60",
      )}
      style={{
        borderColor: highlighted ? tier.accent : "var(--color-border-subtle)",
        boxShadow: highlighted ? `0 0 20px ${tier.accent}33` : "none",
      }}
    >
      <div className="flex items-center justify-between gap-1.5">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55 truncate">
          {label}
        </div>
        <div className="text-[10px] font-mono text-white/40 shrink-0">T{index + 1}</div>
      </div>
      <div className="mt-2 flex items-center gap-2 min-w-0">
        <span
          aria-hidden
          className="grid place-items-center size-9 rounded-md font-display text-sm font-black shrink-0"
          style={{
            background: `linear-gradient(135deg, ${tier.accent}, ${tier.accent}55)`,
            color: "var(--color-text-inverse)",
            boxShadow: `0 0 12px ${tier.accent}55`,
          }}
        >
          {tier.label.slice(0, 1)}
        </span>
        <div
          className="font-display text-base font-bold leading-tight truncate min-w-0"
          style={{ color: tier.accent }}
          title={tier.label}
        >
          {tier.label}
        </div>
      </div>
    </div>
  );
}

// ── Rank picker row ────────────────────────────────────────────

interface RankPickerRowProps {
  label: string;
  tiers: RankTier[];
  selectedIdx: number;
  otherIdx: number;
  mode: "from" | "to";
  onPick: (idx: number) => void;
}

function RankPickerRow({
  label,
  tiers,
  selectedIdx,
  otherIdx,
  mode,
  onPick,
}: RankPickerRowProps) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55 mb-2">
        {label}
      </div>
      {/* Auto-fit grid: each tier button gets at least 95px, columns fill
          available width. Avoids the broken 1-tier-per-row stacking that
          flex-wrap produced in narrow containers. */}
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(92px, 1fr))" }}
      >
        {tiers.map((t, i) => {
          const active = i === selectedIdx;
          const inRange = mode === "from" ? i <= otherIdx : i >= otherIdx;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(i)}
              aria-pressed={active}
              className={cn(
                "px-2 h-9 rounded-md text-sm font-medium cursor-pointer select-none",
                "border transition-all duration-150 min-w-0",
                active
                  ? "text-white"
                  : inRange
                  ? "text-white/85 hover:text-white hover:-translate-y-0.5"
                  : "text-white/40 opacity-60 hover:opacity-80",
              )}
              style={
                active
                  ? {
                      borderColor: t.accent,
                      background: `${t.accent}1f`,
                      boxShadow: `0 0 14px ${t.accent}55`,
                    }
                  : {
                      borderColor: "var(--color-border-subtle)",
                      background: inRange
                        ? "var(--color-bg-panel-elevated)"
                        : "var(--color-bg-panel)",
                    }
              }
              title={t.label}
            >
              <span className="inline-flex items-center gap-1.5 min-w-0">
                <span
                  aria-hidden
                  className="size-1.5 rounded-full shrink-0"
                  style={{ background: t.accent }}
                />
                <span className="truncate">{t.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Live calc card ─────────────────────────────────────────────

interface CalcCardProps {
  calc: CalcResult;
  fromTier: RankTier;
  toTier: RankTier;
  tiersClimbed: number;
}

function CalcCard({ calc, fromTier, toTier, tiersClimbed }: CalcCardProps) {
  const reduced = useReducedMotion();
  const empty = tiersClimbed === 0;

  return (
    <div className="rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-panel)] p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
          Live estimate
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[var(--color-success)]">
          <span
            aria-hidden
            className="size-1.5 rounded-full bg-[var(--color-success)]"
            style={{ boxShadow: "0 0 6px var(--color-success)" }}
          />
          UPDATING
        </span>
      </div>

      {/* Climb summary line */}
      <div>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55 mb-1">
          Climb
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-display text-base font-bold"
            style={{ color: fromTier.accent }}
          >
            {fromTier.label}
          </span>
          <ArrowRight className="size-4 text-white/40" />
          <span
            className="font-display text-base font-bold"
            style={{ color: toTier.accent }}
          >
            {toTier.label}
          </span>
          <span className="text-[11px] font-mono text-white/45 ml-auto sm:ml-1">
            +{tiersClimbed} tier{tiersClimbed === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Stats stack */}
      <div className="space-y-3">
        <CalcRow
          icon={<Sparkles className="size-4" />}
          label="Price"
          value={empty ? "—" : `$${calc.priceUsd.toFixed(0)}`}
          sub={empty ? "Pick a higher desired rank" : `≈ ${(calc.priceUsd / 600).toFixed(4)} ETH`}
          animatedKey={calc.priceUsd}
          prefersReduced={!!reduced}
          emphasis
        />
        <CalcRow
          icon={<Clock className="size-4" />}
          label="ETA"
          value={empty ? "—" : fmtEta(calc.etaHours)}
          sub={empty ? "" : "Avg booster delivery"}
          animatedKey={calc.etaHours}
          prefersReduced={!!reduced}
        />
        <CalcRow
          icon={<TrendingUp className="size-4" />}
          label="XP reward"
          value={empty ? "—" : `+${calc.xpReward.toLocaleString()}`}
          sub={empty ? "" : `≈ +${calc.levelDelta} level${calc.levelDelta === 1 ? "" : "s"}`}
          animatedKey={calc.xpReward}
          prefersReduced={!!reduced}
          glow="cyan"
        />
      </div>

      <div className="flex items-center gap-2 text-xs text-white/65 pt-1 border-t border-[var(--color-border-subtle)] -mt-1 pt-3">
        <ShieldCheck className="size-3.5 text-[var(--color-success)] shrink-0" />
        <span>72h escrow · refund if SLA missed</span>
      </div>

      <Button size="md" className="w-full" disabled={empty}>
        <Trophy className="size-4" /> {empty ? "Set a higher target" : "Find boosters"}
      </Button>
    </div>
  );
}

interface CalcRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  animatedKey: number;
  prefersReduced: boolean;
  emphasis?: boolean;
  glow?: "cyan";
}

function CalcRow({
  icon,
  label,
  value,
  sub,
  animatedKey,
  prefersReduced,
  emphasis,
  glow,
}: CalcRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 min-w-0">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <span
          className={cn(
            "grid place-items-center size-9 rounded-md shrink-0",
            "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
            glow === "cyan" && "text-[var(--color-neon-cyan)]",
          )}
        >
          {icon}
        </span>
        <div className="leading-tight min-w-0">
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
            {label}
          </div>
          {sub && (
            <div className="text-[11px] text-white/45 mt-0.5 truncate" title={sub}>
              {sub}
            </div>
          )}
        </div>
      </div>
      <motion.div
        key={animatedKey}
        initial={prefersReduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "font-display text-right tabular-nums shrink-0",
          emphasis
            ? "text-2xl sm:text-3xl font-bold text-white"
            : "text-lg font-bold text-white",
        )}
      >
        {value}
      </motion.div>
    </div>
  );
}

function fmtEta(hours: number): string {
  if (hours < 24) return `~${hours}h`;
  const d = Math.round(hours / 24);
  return `~${d}d`;
}
