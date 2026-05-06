"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { AnimatedText } from "@/components/ui/AnimatedText";
import SoftAurora from "@/components/ui/SoftAurora";
import { games } from "@/lib/data/catalog";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-24 isolate">
      {/* Soft Aurora — WebGL backdrop. Sits behind everything else in the hero. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none motion-reduce:hidden"
      >
        <SoftAurora
          speed={0.55}
          scale={1.4}
          brightness={1.05}
          color1="#00f0ff"
          color2="#ff2bd6"
          bandHeight={0.45}
          bandSpread={1.05}
          colorSpeed={0.9}
        />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PixelBadge tone="cyan">
            <Zap className="size-3" /> G3MX is in open beta
          </PixelBadge>
        </motion.div>

        <h1
          className="mt-6 font-display font-black tracking-tight text-[var(--color-text-primary)]"
          style={{ fontSize: "var(--text-hero)", lineHeight: 0.95 }}
        >
          <AnimatedText as="span" className="block">
            Level up.
          </AnimatedText>
          <AnimatedText as="span" className="block neon-text-cyan" stagger={0.06}>
            Trade accounts.
          </AnimatedText>
          <AnimatedText as="span" className="block neon-text-magenta" stagger={0.06}>
            Top up cheaper.
          </AnimatedText>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 max-w-2xl text-[var(--color-text-secondary)]"
          style={{ fontSize: "var(--text-body)" }}
        >
          The gamified marketplace for boosting, account trading, and in-game top-ups. Pay with crypto
          or card. Verified boosters, escrow protection, and a leveling system that actually rewards
          you for showing up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          <Button size="lg">
            Browse Boosts <ArrowRight className="size-5" />
          </Button>
          <Button size="lg" variant="secondary">
            Sell My Account
          </Button>
        </motion.div>

        {/* Game ticker */}
        <div className="mt-12 md:mt-16 relative">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-[var(--color-text-muted)] mb-3">
            Supported titles
          </div>
          <div className="overflow-hidden mask-fade-x">
            <div
              className="flex gap-3 whitespace-nowrap"
              style={{ animation: "ticker 30s linear infinite" }}
            >
              {[...games, ...games].map((g, i) => (
                <div
                  key={`${g.slug}-${i}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ background: g.accent, boxShadow: `0 0 8px ${g.accent}` }}
                  />
                  <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                    {g.name}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--color-text-muted)]">
                    {g.region}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Atmosphere decoration */}
      <div
        aria-hidden
        className="absolute right-[-20%] top-[-10%] size-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-neon-magenta), transparent 70%)" }}
      />
      <div
        aria-hidden
        className="absolute left-[-10%] bottom-[-20%] size-[500px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-neon-cyan), transparent 70%)" }}
      />

      <style jsx>{`
        .mask-fade-x {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
      `}</style>
    </section>
  );
}
