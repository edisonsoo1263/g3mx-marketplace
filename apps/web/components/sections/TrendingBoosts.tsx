"use client";

import Link from "next/link";
import { Star, Clock, ShieldCheck, Flame, Sparkles, ArrowRight } from "lucide-react";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { RarityBadge } from "@/components/gamified/RarityBadge";
import { Button } from "@/components/ui/Button";
import { trendingBoosts } from "@/lib/data/catalog";

export function TrendingBoosts() {
  if (trendingBoosts.length === 0) {
    return (
      <section className="relative py-[var(--spacing-section)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeader
            eyebrow="Trending"
            title="No boosters live yet"
            subtitle="Be the first. List your boosting service and we'll feature it here while the marketplace ramps up."
          />
          <div className="mt-8 rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 text-center">
            <div className="mx-auto grid place-items-center size-12 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-4">
              <Sparkles className="size-5 text-[var(--color-neon-cyan)]" />
            </div>
            <p className="text-base text-white/80 max-w-md mx-auto">
              The first 100 boosters get a featured slot for free.
            </p>
            <div className="mt-6">
              <Link href="/sell/onboarding">
                <Button size="md">
                  List your service <ArrowRight className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-[var(--spacing-section)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="Trending"
          title="Top boosters working tonight"
          subtitle="Verified, escrowed, and tracked in real time. Pick your booster like you'd pick a teammate."
        />

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {trendingBoosts.map((b) => (
            <SpotlightCard key={b.id} className="p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <PixelBadge tone="magenta">
                  <Flame className="size-3" /> Hot
                </PixelBadge>
                <RarityBadge rarity={b.rarity} />
              </div>

              <div>
                <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
                  {b.game}
                </div>
                <h3 className="mt-1 font-display text-lg font-semibold text-[var(--color-text-primary)] leading-tight">
                  {b.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded bg-[var(--color-bg-panel-elevated)] font-mono text-[var(--color-text-secondary)]">
                  {b.fromTier}
                </span>
                <span className="text-[var(--color-text-muted)]">→</span>
                <span className="px-2 py-0.5 rounded font-mono text-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30">
                  {b.toTier}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] pt-2 border-t border-[var(--color-border-subtle)]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-[var(--color-success)]" />
                  <span className="font-mono">{b.boosterTag}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-3.5 text-[var(--color-neon-amber)] fill-current" />
                  <span>{b.boosterRating}</span>
                  <span className="text-[var(--color-text-muted)]">({b.ordersCompleted})</span>
                </div>
              </div>

              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                    From
                  </div>
                  <div className="font-display text-2xl font-bold text-[var(--color-text-primary)]">
                    ${b.priceUsd.toFixed(2)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                    <Clock className="size-3" /> ~{b.etaHours}h
                  </div>
                </div>
                <Button size="sm">Buy now</Button>
              </div>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  subtitle: string;
}

export function SectionHeader({ eyebrow, title, subtitle }: SectionHeaderProps) {
  return (
    <div className="max-w-2xl">
      <div className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--color-neon-cyan)]">
        {eyebrow}
      </div>
      <h2
        className="mt-3 font-display font-bold text-[var(--color-text-primary)]"
        style={{ fontSize: "var(--text-display)" }}
      >
        {title}
      </h2>
      <p className="mt-3 text-[var(--color-text-secondary)]">{subtitle}</p>
    </div>
  );
}
