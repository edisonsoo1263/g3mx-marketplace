"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Zap } from "lucide-react";
import { BorderBeam } from "border-beam";
import { Button } from "@/components/ui/Button";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { AnimatedText } from "@/components/ui/AnimatedText";
import SoftAurora from "@/components/ui/SoftAurora";
import { useAuth } from "@/hooks/useAuth";
import { games } from "@/lib/data/catalog";
import { cn } from "@/lib/utils/cn";

export function Hero() {
  const router = useRouter();
  const { isAuthenticated, loginWithWallet } = useAuth();

  function handleSellAccount() {
    if (!isAuthenticated) {
      loginWithWallet()
        .then(() => router.push("/sell/onboarding"))
        .catch(() => undefined);
      return;
    }
    router.push("/sell/onboarding");
  }

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
          <BrowseBoostsCta href="/boosts" />
          <Button size="lg" variant="secondary" onClick={handleSellAccount}>
            <Sparkles className="size-5" /> Sell My Account
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

/**
 * Headline CTA — multi-stop gradient pill with an animated wash, a soft glow,
 * a stacked-shadow lift on hover, and a top "gloss" highlight for depth. Wraps
 * a Next.js Link so it actually navigates.
 */
function BrowseBoostsCta({ href }: { href: string }) {
  return (
    <BorderBeam
      size="md"
      colorVariant="colorful"
      theme="dark"
      strength={0.95}
      className={cn(
        "inline-flex cursor-pointer rounded-full select-none group",
        "transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 active:translate-y-0",
      )}
    >
      <Link
        href={href}
        aria-label="Browse boosts"
        className={cn(
          "relative inline-flex items-center justify-center gap-2",
          "h-14 px-8 rounded-full font-display text-lg font-semibold tracking-tight",
          "text-white isolate overflow-hidden",
          "bg-[length:220%_220%] bg-[position:0%_50%]",
          "transition-[background-position,filter,box-shadow] duration-[var(--duration-slow)] ease-[var(--ease-out-expo)]",
          "group-hover:bg-[position:100%_50%]",
          "shadow-[0_8px_24px_oklch(70%_0.28_340/40%),0_2px_8px_oklch(78%_0.18_200/35%),inset_0_1px_0_oklch(100%_0_0/35%),inset_0_-12px_24px_oklch(0%_0_0/25%)]",
          "group-hover:shadow-[0_12px_36px_oklch(70%_0.28_340/55%),0_4px_16px_oklch(78%_0.18_200/45%),inset_0_1px_0_oklch(100%_0_0/45%),inset_0_-12px_24px_oklch(0%_0_0/25%)]",
        )}
        style={{
          backgroundImage:
            "linear-gradient(120deg, var(--color-neon-magenta) 0%, var(--color-neon-violet) 35%, var(--color-neon-cyan) 70%, var(--color-neon-amber) 100%)",
        }}
      >
        {/* Top gloss for depth — gives the pill a physical 3D feel rather than flat fill. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2 top-0.5 h-1/2 rounded-full"
          style={{
            background:
              "linear-gradient(180deg, oklch(100% 0 0 / 28%), oklch(100% 0 0 / 0%))",
          }}
        />
        <span className="relative inline-flex items-center gap-2">
          <Sparkles className="size-5" aria-hidden />
          Browse Boosts
          <ArrowRight className="size-5 transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] group-hover:translate-x-1" />
        </span>
      </Link>
    </BorderBeam>
  );
}
