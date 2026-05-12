"use client";

import Link from "next/link";
import { ShieldCheck, Sparkles, ArrowRight, Headset } from "lucide-react";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { cn } from "@/lib/utils/cn";

/**
 * BoostsPageHeader — compact, punchy hero band for the Boosts page.
 *
 * Single-line headline (single AnimatedText line instead of stacked) plus a
 * tight trust-pill row and a sell-side CTA. Keeps the visual interesting
 * without pushing the listings grid below the fold.
 */
export function BoostsPageHeader() {
  return (
    <section className="relative overflow-hidden pt-8 md:pt-12 pb-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <PixelBadge tone="cyan">
              <Sparkles className="size-3" /> Open beta
            </PixelBadge>

            <h1
              className="mt-4 font-display font-black tracking-tight text-white"
              style={{ fontSize: "var(--text-display)", lineHeight: 1 }}
            >
              <AnimatedText as="span" className="block">
                Pick your booster.
              </AnimatedText>{" "}
              <AnimatedText as="span" className="neon-text-cyan" stagger={0.06}>
                Skip the grind.
              </AnimatedText>
            </h1>

            <p className="mt-3 max-w-xl text-sm md:text-base text-white/65">
              Verified boosters, escrow-locked payouts, and gamified XP rewards on every order.
            </p>
          </div>

          <Link
            href="/sell/onboarding"
            className={cn(
              "shrink-0 inline-flex items-center gap-2 self-start lg:self-end h-11 px-5 rounded-full",
              "text-sm font-semibold tracking-tight cursor-pointer select-none",
              "text-white border border-[var(--color-neon-magenta)]/40 bg-[var(--color-neon-magenta)]/10",
              "hover:-translate-y-0.5 hover:bg-[var(--color-neon-magenta)]/20 hover:border-[var(--color-neon-magenta)]/60",
              "transition-[transform,background-color,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
            )}
          >
            <Sparkles className="size-4 text-[var(--color-neon-magenta)]" />
            Sell your service
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <TrustChip icon={ShieldCheck} text="72h escrow · refund if SLA missed" />
          <TrustChip icon={Headset} text="Live chat in under 2 min" />
        </div>
      </div>

      {/* atmosphere bloom */}
      <div
        aria-hidden
        className="absolute right-[-10%] top-[-40%] size-[420px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-neon-cyan), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute left-[20%] top-[-30%] size-[300px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-neon-magenta), transparent 70%)" }}
      />
    </section>
  );
}

function TrustChip({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-panel text-xs">
      <Icon className="size-3.5 text-[var(--color-neon-cyan)]" />
      <span className="text-white/85">{text}</span>
    </span>
  );
}
