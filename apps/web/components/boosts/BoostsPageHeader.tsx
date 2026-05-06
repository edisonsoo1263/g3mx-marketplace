"use client";

import { Activity, ShieldCheck } from "lucide-react";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { AnimatedText } from "@/components/ui/AnimatedText";

export function BoostsPageHeader() {
  return (
    <section className="relative overflow-hidden pt-10 md:pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <PixelBadge tone="cyan">
          <Activity className="size-3" /> Boosting · Open beta
        </PixelBadge>

        <h1
          className="mt-5 font-display font-black tracking-tight text-[var(--color-text-primary)]"
          style={{ fontSize: "var(--text-display)", lineHeight: 1 }}
        >
          <AnimatedText as="span" className="block">
            Pick your booster.
          </AnimatedText>
          <AnimatedText as="span" className="block neon-text-cyan" stagger={0.06}>
            Skip the grind.
          </AnimatedText>
        </h1>

        <p className="mt-4 max-w-2xl text-[var(--color-text-secondary)]">
          Verified boosters for every climb. Pay in crypto or card, locked in escrow until you sign
          off. Live tracking, optional stream-along, and a leveling system that pays you back in XP.
        </p>

        <div className="mt-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-full glass-panel">
          <ShieldCheck className="size-4 text-[var(--color-neon-cyan)]" />
          <span className="text-sm text-[var(--color-text-primary)]">
            72h escrow · refund if SLA missed
          </span>
        </div>
      </div>

      {/* atmosphere */}
      <div
        aria-hidden
        className="absolute right-[-10%] top-[-30%] size-[480px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-neon-cyan), transparent 70%)" }}
      />
    </section>
  );
}
