"use client";

import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import type { ComponentType, ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { cn } from "@/lib/utils/cn";

/**
 * Shared placeholder used by all stub product pages (Help, Wallet, Blog, etc.)
 * Keeps RSC prefetch from 404-ing while the real implementations are
 * in flight, and gives users a coherent landing instead of a Next.js error.
 */
export function ComingSoonPage({
  badgeLabel,
  badgeIcon: BadgeIcon = Sparkles,
  title,
  description,
  children,
  primaryHref = "/boosts",
  primaryLabel = "Browse boosts",
}: {
  badgeLabel: string;
  badgeIcon?: ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children?: ReactNode;
  primaryHref?: string;
  primaryLabel?: string;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" /> Back home
        </Link>

        <header className="space-y-3">
          <PixelBadge tone="cyan">
            <BadgeIcon className="size-3" /> {badgeLabel}
          </PixelBadge>
          <h1
            className="font-display font-black tracking-tight text-white"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            {title}
          </h1>
          <p className="text-white/75 max-w-2xl">{description}</p>
        </header>

        <section className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 md:p-14 text-center">
          <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
            <Sparkles className="size-6 text-[var(--color-neon-cyan)]" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">
            Coming soon
          </h2>
          <p className="mt-2 text-white/65 max-w-md mx-auto text-sm">
            This area is still under construction. Come back during the next
            update wave.
          </p>
          {children}
          <div className="mt-6">
            <Link
              href={primaryHref}
              className={cn(
                "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full",
                "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
                "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
                "transition-[filter,transform] duration-150",
              )}
            >
              {primaryLabel}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
