"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock, Sparkles, ShieldCheck, Wallet } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { SellerWizard } from "@/components/sell/SellerWizard";
import { Button } from "@/components/ui/Button";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { useAuth } from "@/hooks/useAuth";

export default function SellerOnboardingPage() {
  const { user, isReady, isAuthenticated, loginWithWallet } = useAuth();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <Link
          href="/boosts"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to marketplace
        </Link>

        <header className="space-y-3">
          <PixelBadge tone="magenta">
            <Sparkles className="size-3" /> Seller onboarding
          </PixelBadge>
          <h1
            className="font-display font-black tracking-tight text-white"
            style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
          >
            List your boosting service
          </h1>
          <p className="text-white/70 max-w-2xl">
            Five quick steps to get your boost live. Your draft auto-saves as you go — close the
            tab and come back anytime.
          </p>
        </header>

        {!isReady ? (
          <div className="h-[400px] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse" />
        ) : !isAuthenticated || !user ? (
          <ConnectGate onConnect={() => loginWithWallet().catch(() => undefined)} />
        ) : (
          <SellerWizard user={user} />
        )}
      </main>
      <Footer />
    </>
  );
}

function ConnectGate({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
        <Lock className="size-6 text-[var(--color-neon-cyan)]" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white">
        Connect to start selling
      </h2>
      <p className="mt-2 text-white/70 max-w-md mx-auto">
        We use your wallet or social login to verify boosters and route payouts. Listings are
        on-chain escrow protected.
      </p>

      <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto text-left">
        <GateBullet icon={Wallet} title="Crypto payouts">
          BNB, USDT, ETH straight to your wallet
        </GateBullet>
        <GateBullet icon={ShieldCheck} title="Escrow protected">
          Funds locked until SLA met
        </GateBullet>
      </div>

      <div className="mt-7">
        <Button size="lg" onClick={onConnect}>
          Connect wallet <ArrowRight className="size-5" />
        </Button>
      </div>
    </div>
  );
}

function GateBullet({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40">
      <span className="grid place-items-center size-8 rounded-md bg-[var(--color-neon-cyan)]/10 border border-[var(--color-neon-cyan)]/30 shrink-0">
        <Icon className="size-4 text-[var(--color-neon-cyan)]" />
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white/60 mt-0.5">{children}</div>
      </div>
    </div>
  );
}
