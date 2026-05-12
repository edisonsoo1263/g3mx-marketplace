"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, Sparkles, TrendingUp, ShieldCheck, ArrowRight, Trophy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { GlowingBorder } from "@/components/ui/GlowingBorder";
import { getLadder, type RankTier } from "@/lib/data/ranks";
import { games } from "@/lib/data/catalog";

interface BoostConfiguratorProps {
  gameSlug: string;
  fromIdx: number;
  toIdx: number;
  onChange: (next: { fromIdx: number; toIdx: number }) => void;
}

/**
 * BoostConfigurator — the buyer's interactive selection surface. Two visual
 * rank columns (current → desired) with iconic tier badges, plus a live calc
 * card showing price, ETA, and XP reward. Updates in real time.
 *
 * Pricing model (transparent, can be tuned):
 *   - base    = 12 USD per tier of climb
 *   - factor  = exponential difficulty curve at higher tiers
 *   - eta     = 6 hours per tier, * 1.4^max(0, fromIdx-3)
 *   - xpYield = priceUsd * 5 + tiersClimbed * 50
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

  const calc = useMemo(() => calculate(fromIdx, toIdx, tiers.length), [fromIdx, toIdx, tiers.length]);

  function setFrom(i: number) {
    onChange({ fromIdx: i, toIdx: Math.max(i, toIdx) });
  }
  function setTo(i: number) {
    onChange({ fromIdx: Math.min(i, fromIdx), toIdx: i });
  }

  return (
    <section className="relative">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
        {/* Title — mobile renders after the buy/estimate card; desktop spans full width on top */}
        <div className="order-2 lg:order-1 lg:col-span-2 flex items-end justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-[var(--color-neon-cyan)]">
              Boost Configurator
            </div>
            <h2
              className="mt-2 font-display font-bold text-[var(--color-text-primary)]"
              style={{ fontSize: "var(--text-h1)", lineHeight: 1.05 }}
            >
              Plot your climb
              <span
                className="ml-3 align-middle inline-flex items-center gap-2 text-base font-mono uppercase tracking-wider"
                style={{ color: game?.accent }}
              >
                <span
                  className="size-2 rounded-full"
                  style={{ background: game?.accent, boxShadow: `0 0 8px ${game?.accent}` }}
                />
                {game?.name}
              </span>
            </h2>
          </div>
        </div>

        {/* Rank ladders — mobile order-3, desktop bottom-left */}
        <GlowingBorder
          rarity="rare"
          animated={false}
          className="order-3 lg:order-2 overflow-hidden"
        >
          <div className="p-5 md:p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <RankSummaryBig label="Current" tier={fromTier} index={fromIdx} />
              <RankSummaryBig label="Desired" tier={toTier} index={toIdx} highlighted />
            </div>

            <RankRowBig
              label="Current rank"
              tiers={tiers}
              selectedIdx={fromIdx}
              otherIdx={toIdx}
              mode="from"
              onPick={setFrom}
            />
            <RankRowBig
              label="Desired rank"
              tiers={tiers}
              selectedIdx={toIdx}
              otherIdx={fromIdx}
              mode="to"
              onPick={setTo}
            />
          </div>
        </GlowingBorder>

        {/* Live calc card — mobile FIRST (order-1), desktop bottom-right (order-3) */}
        <CalcCard
          className="order-1 lg:order-3"
          calc={calc}
          fromTier={fromTier}
          toTier={toTier}
          tiersClimbed={Math.max(0, toIdx - fromIdx)}
        />
      </div>
    </section>
  );
}

interface CalcResult {
  priceUsd: number;
  etaHours: number;
  xpReward: number;
  levelDelta: number;
}

function calculate(fromIdx: number, toIdx: number, total: number): CalcResult {
  const climb = Math.max(0, toIdx - fromIdx);
  const baseTier = 12;
  // Exponential difficulty: each tier costs more than the last
  let priceUsd = 0;
  for (let i = fromIdx; i < toIdx; i++) {
    priceUsd += baseTier * Math.pow(1.45, i);
  }
  priceUsd = Math.max(0, Math.round(priceUsd));

  const etaHours = Math.round(climb * 6 * Math.pow(1.18, Math.max(0, fromIdx - 3)));
  const xpReward = priceUsd * 5 + climb * 50;
  // ~1000 XP per level
  const levelDelta = Math.max(0, Math.round(xpReward / 1000));

  return { priceUsd, etaHours, xpReward, levelDelta };
}

function RankSummaryBig({
  label,
  tier,
  index,
  highlighted,
}: {
  label: string;
  tier: RankTier;
  index: number;
  highlighted?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] p-4",
        "border bg-[var(--color-bg-panel-elevated)]/60",
      )}
      style={{
        borderColor: highlighted ? tier.accent : "var(--color-border-subtle)",
        boxShadow: highlighted ? `0 0 24px ${tier.accent}30` : "none",
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
          {label}
        </div>
        <div className="text-[10px] font-mono text-[var(--color-text-muted)]">
          T{index + 1}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <span
          aria-hidden
          className="grid place-items-center size-12 rounded-md font-display text-base font-black"
          style={{
            background: `linear-gradient(135deg, ${tier.accent}, ${tier.accent}55)`,
            color: "var(--color-text-inverse)",
            boxShadow: `0 0 16px ${tier.accent}66`,
          }}
        >
          {tier.label.slice(0, 1)}
        </span>
        <div className="leading-tight">
          <div
            className="text-xl md:text-2xl font-display font-bold"
            style={{ color: tier.accent }}
          >
            {tier.label}
          </div>
        </div>
      </div>
    </div>
  );
}

interface RankRowBigProps {
  label: string;
  tiers: RankTier[];
  selectedIdx: number;
  otherIdx: number;
  mode: "from" | "to";
  onPick: (idx: number) => void;
}

function RankRowBig({ label, tiers, selectedIdx, otherIdx, mode, onPick }: RankRowBigProps) {
  return (
    <div>
      <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-text-muted)] mb-2">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {tiers.map((t, i) => {
          const active = i === selectedIdx;
          const inRange = mode === "from" ? i <= otherIdx : i >= otherIdx;
          const enabled = inRange;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPick(i)}
              className={cn(
                "px-3 py-1.5 rounded-md text-base font-medium cursor-pointer select-none",
                "border transition-all duration-150",
                active
                  ? "text-[var(--color-text-primary)]"
                  : enabled
                  ? "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:-translate-y-0.5"
                  : "text-[var(--color-text-muted)] opacity-60 hover:opacity-80",
              )}
              style={
                active
                  ? {
                      borderColor: t.accent,
                      background: `${t.accent}1f`,
                      boxShadow: `0 0 16px ${t.accent}55`,
                    }
                  : {
                      borderColor: "var(--color-border-subtle)",
                      background: enabled
                        ? "var(--color-bg-panel-elevated)"
                        : "var(--color-bg-panel)",
                    }
              }
              aria-pressed={active}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ background: t.accent }}
                />
                {t.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function CalcCard({
  calc,
  fromTier,
  toTier,
  tiersClimbed,
  className,
}: {
  calc: CalcResult;
  fromTier: RankTier;
  toTier: RankTier;
  tiersClimbed: number;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const empty = tiersClimbed === 0;

  return (
    <div
      className={cn(
        "glass-panel rounded-[var(--radius-card)] p-5 md:p-6 flex flex-col gap-5 lg:sticky lg:top-32 self-start",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
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

      <div>
        <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
          Climb
        </div>
        <div className="mt-1.5 flex items-center gap-2 flex-wrap text-base">
          <span
            className="font-display text-lg font-bold"
            style={{ color: fromTier.accent }}
          >
            {fromTier.label}
          </span>
          <ArrowRight className="size-4 text-[var(--color-text-muted)]" />
          <span
            className="font-display text-lg font-bold"
            style={{ color: toTier.accent }}
          >
            {toTier.label}
          </span>
          <span className="text-xs font-mono text-[var(--color-text-muted)] ml-1">
            +{tiersClimbed} tier{tiersClimbed === 1 ? "" : "s"}
          </span>
        </div>
      </div>

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

      <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border-subtle)]">
        <ShieldCheck className="size-3.5 text-[var(--color-success)]" />
        <span>72h escrow · refund if SLA missed</span>
      </div>

      <Button size="lg" className="w-full" disabled={empty}>
        <Trophy className="size-5" /> {empty ? "Set a higher target" : "Find boosters"}
      </Button>
    </div>
  );
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
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  animatedKey: number;
  prefersReduced: boolean;
  emphasis?: boolean;
  glow?: "cyan";
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={cn(
            "grid place-items-center size-9 rounded-md shrink-0",
            "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
            glow === "cyan" && "text-[var(--color-neon-cyan)]",
          )}
        >
          {icon}
        </span>
        <div className="leading-tight">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-[var(--color-text-muted)]">
            {label}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{sub}</div>
        </div>
      </div>
      <motion.div
        key={animatedKey}
        initial={prefersReduced ? false : { opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "font-display text-right tabular-nums",
          emphasis ? "text-3xl md:text-4xl font-bold text-[var(--color-text-primary)]" : "text-xl font-bold text-[var(--color-text-primary)]",
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
