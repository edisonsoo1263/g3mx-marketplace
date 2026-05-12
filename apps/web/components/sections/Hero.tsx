"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { AnimatedText } from "@/components/ui/AnimatedText";
import SoftAurora from "@/components/ui/SoftAurora";
import { games } from "@/lib/data/catalog";

/**
 * Hero — three-line headline + description + CTAs + supported-titles ticker.
 * Sits on top of a SoftAurora WebGL band backdrop.
 *
 * Contrast pass: description and supported-titles row use bright white tones
 * directly so the SoftAurora colors don't wash them out into illegible grey.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-20 pb-16 md:pb-24 isolate">
      {/* SoftAurora — WebGL band backdrop. Sits behind everything else. */}
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
          className="mt-6 font-display font-black tracking-tight text-white"
          style={{ fontSize: "var(--text-hero)", lineHeight: 0.95 }}
        >
          <AnimatedText as="span" className="block">
            Level up.
          </AnimatedText>
          <AnimatedText
            as="span"
            className="block neon-text-cyan"
            stagger={0.06}
          >
            Trade accounts.
          </AnimatedText>
          <AnimatedText
            as="span"
            className="block neon-text-magenta"
            stagger={0.06}
          >
            Top up cheaper.
          </AnimatedText>
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-6 max-w-2xl text-white/90 leading-relaxed"
          style={{ fontSize: "var(--text-body)" }}
        >
          The gamified marketplace for boosting, account trading, and in-game
          top-ups. Pay with crypto or card. Verified boosters, escrow
          protection, and a leveling system that actually rewards you for
          showing up.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-8 flex flex-col sm:flex-row gap-3"
        >
          {/* Primary CTA — multi-layered gradient surface with sweep highlight,
              ring, drop shadow, and inner top-light. Designed to read as a
              substantial, tactile button rather than the flat default. */}
          <Link
            href="/boosts"
            aria-label="Browse boosts"
            className="hero-cta-primary group relative inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-full font-display font-semibold text-lg text-white overflow-hidden cursor-pointer select-none tracking-tight will-change-transform"
          >
            {/* Animated sheen sweep on hover */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-[var(--ease-out-expo)]"
              style={{
                background:
                  "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.45) 50%, transparent 70%)",
              }}
            />
            {/* Inner top highlight — gives the 3D dome feel */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-2 top-0 h-1/2 rounded-t-full opacity-50"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(255,255,255,0.55) 0%, transparent 100%)",
              }}
            />
            <span className="relative">Browse Boosts</span>
            <ArrowRight className="relative size-5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>

          {/* Secondary CTA — glassy panel with magenta-tinted hover */}
          <Link
            href="/sell/onboarding"
            aria-label="Sell my account"
            className="hero-cta-secondary group relative inline-flex items-center justify-center gap-2.5 h-14 px-8 rounded-full font-display font-semibold text-lg text-white cursor-pointer select-none tracking-tight"
          >
            <span className="relative">Sell My Account</span>
          </Link>
        </motion.div>

        {/* Supported titles — ticker */}
        <div className="mt-12 md:mt-16 relative">
          <div className="text-xs font-mono uppercase tracking-[0.3em] text-white/80 mb-3">
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
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 bg-[var(--color-bg-deep)]/80 backdrop-blur-md shadow-[0_4px_18px_rgb(0_0_0/30%)]"
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-full shrink-0"
                    style={{
                      background: g.accent,
                      boxShadow: `0 0 8px ${g.accent}`,
                    }}
                  />
                  <span className="text-sm font-semibold text-white">
                    {g.name}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-white/65">
                    {g.region}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Atmosphere blobs — soft color washes in the corners */}
      <div
        aria-hidden
        className="absolute right-[-20%] top-[-10%] size-[600px] rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-neon-magenta), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute left-[-10%] bottom-[-20%] size-[500px] rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--color-neon-cyan), transparent 70%)",
        }}
      />

      <style jsx>{`
        .mask-fade-x {
          mask-image: linear-gradient(
            to right,
            transparent,
            black 10%,
            black 90%,
            transparent
          );
        }

        /* Primary CTA — layered gradient surface with neon ring and depth */
        .hero-cta-primary {
          background-image: linear-gradient(
            135deg,
            #00f0ff 0%,
            #7c5cff 45%,
            #ff2bd6 100%
          );
          background-size: 200% 200%;
          background-position: 0% 50%;
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.22) inset,
            0 1px 0 0 rgba(255, 255, 255, 0.45) inset,
            0 10px 28px -8px rgba(0, 240, 255, 0.55),
            0 18px 44px -12px rgba(255, 43, 214, 0.45);
          transition:
            transform 360ms cubic-bezier(0.16, 1, 0.3, 1),
            box-shadow 360ms cubic-bezier(0.16, 1, 0.3, 1),
            background-position 600ms cubic-bezier(0.16, 1, 0.3, 1),
            filter 360ms cubic-bezier(0.16, 1, 0.3, 1);
          animation: heroPrimaryBreathe 5.2s ease-in-out infinite;
        }
        .hero-cta-primary:hover {
          transform: translateY(-2px);
          background-position: 100% 50%;
          filter: brightness(1.06) saturate(1.05);
          box-shadow:
            0 0 0 1px rgba(255, 255, 255, 0.34) inset,
            0 1px 0 0 rgba(255, 255, 255, 0.55) inset,
            0 14px 36px -8px rgba(0, 240, 255, 0.75),
            0 24px 56px -12px rgba(255, 43, 214, 0.6);
        }
        .hero-cta-primary:active {
          transform: translateY(0) scale(0.985);
        }
        .hero-cta-primary:focus-visible {
          outline: 2px solid #00f0ff;
          outline-offset: 3px;
        }

        @keyframes heroPrimaryBreathe {
          0%,
          100% {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.22) inset,
              0 1px 0 0 rgba(255, 255, 255, 0.45) inset,
              0 10px 28px -8px rgba(0, 240, 255, 0.55),
              0 18px 44px -12px rgba(255, 43, 214, 0.45);
          }
          50% {
            box-shadow:
              0 0 0 1px rgba(255, 255, 255, 0.28) inset,
              0 1px 0 0 rgba(255, 255, 255, 0.5) inset,
              0 14px 32px -8px rgba(0, 240, 255, 0.7),
              0 22px 52px -12px rgba(255, 43, 214, 0.55);
          }
        }

        /* Secondary CTA — glass panel, magenta-tinted hover */
        .hero-cta-secondary {
          background: rgba(8, 8, 14, 0.55);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow:
            0 1px 0 0 rgba(255, 255, 255, 0.08) inset,
            0 6px 22px -6px rgba(0, 0, 0, 0.55);
          transition:
            transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
            border-color 280ms ease,
            background-color 280ms ease,
            box-shadow 280ms ease;
        }
        .hero-cta-secondary:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 43, 214, 0.55);
          background: rgba(14, 10, 22, 0.7);
          box-shadow:
            0 1px 0 0 rgba(255, 255, 255, 0.12) inset,
            0 10px 28px -6px rgba(255, 43, 214, 0.35);
        }
        .hero-cta-secondary:active {
          transform: translateY(0) scale(0.985);
        }
        .hero-cta-secondary:focus-visible {
          outline: 2px solid #ff2bd6;
          outline-offset: 3px;
        }
      `}</style>
    </section>
  );
}
