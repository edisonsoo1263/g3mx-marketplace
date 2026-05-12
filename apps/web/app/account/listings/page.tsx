"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Lock,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/sections/Footer";
import { PixelBadge } from "@/components/ui/PixelBadge";
import { Button } from "@/components/ui/Button";
import { BoostCard } from "@/components/boosts/BoostCard";
import { useAuth } from "@/hooks/useAuth";
import { useMyListings } from "@/hooks/useMyListings";
import { removePublishedListing } from "@/lib/data/userListings";
import { games } from "@/lib/data/catalog";
import { cn } from "@/lib/utils/cn";
import type { BoostListing } from "@/lib/data/boostListings";

export default function MyListingsPage() {
  const { user, isReady, isAuthenticated, loginWithWallet } = useAuth();
  const listings = useMyListings();
  const [pendingDelete, setPendingDelete] = useState<BoostListing | null>(null);

  const stats = useMemo(() => {
    const gamesCovered = new Set(listings.map((l) => l.game)).size;
    const totalPrice = listings.reduce((sum, l) => sum + l.priceUsd, 0);
    const avgPrice =
      listings.length > 0 ? totalPrice / listings.length : 0;
    return {
      total: listings.length,
      gamesCovered,
      avgPrice,
    };
  }, [listings]);

  async function handleDelete(listing: BoostListing) {
    setPendingDelete(null);
    await removePublishedListing(listing.id);
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        <Link
          href="/boosts"
          className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to marketplace
        </Link>

        <header className="space-y-3 flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-3">
            <PixelBadge tone="magenta">
              <Store className="size-3" /> Seller dashboard
            </PixelBadge>
            <h1
              className="font-display font-black tracking-tight text-white"
              style={{ fontSize: "var(--text-display)", lineHeight: 1.05 }}
            >
              My Listings
            </h1>
            <p className="text-white/70 max-w-2xl">
              Every boost you&apos;re selling on the marketplace. Manage what
              shows up to buyers — pause, retire, or list something new.
            </p>
          </div>
          <Link
            href="/sell/onboarding"
            className={cn(
              "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full",
              "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
              "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
              "transition-[filter,transform] duration-150 shrink-0",
            )}
          >
            <Plus className="size-4" /> New listing
          </Link>
        </header>

        {!isReady ? (
          <SkeletonState />
        ) : !isAuthenticated || !user ? (
          <ConnectGate
            onConnect={() => loginWithWallet().catch(() => undefined)}
          />
        ) : listings.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <StatRow
              total={stats.total}
              gamesCovered={stats.gamesCovered}
              avgPrice={stats.avgPrice}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {listings.map((l, i) => (
                <ManageCard
                  key={l.id}
                  listing={l}
                  index={i}
                  onDelete={() => setPendingDelete(l)}
                />
              ))}
            </div>
          </>
        )}
      </main>
      <Footer />

      {/* Delete confirm */}
      <DeleteConfirm
        listing={pendingDelete}
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  );
}

// ── Stats ──────────────────────────────────────────────────────

const STAT_ACCENT: Record<string, string> = {
  cyan: "var(--color-neon-cyan)",
  magenta: "var(--color-neon-magenta)",
  amber: "var(--color-neon-amber)",
};

function StatRow({
  total,
  gamesCovered,
  avgPrice,
}: {
  total: number;
  gamesCovered: number;
  avgPrice: number;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Stat
        label="Total listings"
        value={String(total)}
        sub={total === 1 ? "Live on the marketplace" : "Live on the marketplace"}
        accent="cyan"
        icon={ShoppingBag}
      />
      <Stat
        label="Games covered"
        value={String(gamesCovered)}
        sub={
          gamesCovered === games.length
            ? "Every supported title"
            : `Of ${games.length} supported`
        }
        accent="magenta"
        icon={Sparkles}
      />
      <Stat
        label="Avg price"
        value={`$${avgPrice.toFixed(2)}`}
        sub="Across your listings"
        accent="amber"
        icon={Store}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub: string;
  accent: keyof typeof STAT_ACCENT;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
}) {
  const c = STAT_ACCENT[accent];
  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/70 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
          {label}
        </span>
        <span
          aria-hidden
          className="grid place-items-center size-8 rounded-full"
          style={{
            background: `${c}1a`,
            border: `1px solid ${c}55`,
          }}
        >
          <Icon className="size-3.5" style={{ color: c }} />
        </span>
      </div>
      <div className="mt-2 font-display text-2xl font-bold text-white tabular-nums">
        {value}
      </div>
      <div className="text-[11px] text-white/55 mt-0.5">{sub}</div>
    </div>
  );
}

// ── Manage card ────────────────────────────────────────────────

function ManageCard({
  listing,
  index,
  onDelete,
}: {
  listing: BoostListing;
  index: number;
  onDelete: () => void;
}) {
  return (
    <div className="space-y-2">
      <BoostCard listing={listing} index={index} />
      <div className="flex items-center gap-1.5 px-1">
        <Link
          href="/boosts"
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 text-xs font-medium text-white/85 hover:text-white hover:border-[var(--color-border-strong)] transition-colors"
          title="See how buyers see this listing"
        >
          <ExternalLink className="size-3.5" />
          View public
        </Link>
        <button
          type="button"
          onClick={onDelete}
          className="ml-auto inline-flex items-center gap-1.5 h-9 px-3 rounded-full border border-[var(--color-danger)]/30 bg-[var(--color-danger)]/5 text-xs font-medium text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 cursor-pointer transition-colors"
          aria-label={`Delete ${listing.title}`}
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

// ── Delete confirm ─────────────────────────────────────────────

function DeleteConfirm({
  listing,
  onCancel,
  onConfirm,
}: {
  listing: BoostListing | null;
  onCancel: () => void;
  onConfirm: (l: BoostListing) => void;
}) {
  if (!listing) return null;
  return (
    <div
      role="dialog"
      aria-label="Confirm delete"
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
    >
      <div
        onClick={onCancel}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-panel)] p-6 shadow-[0_24px_64px_rgb(0_0_0_/_60%)]">
        <h3 className="font-display text-lg font-bold text-white">
          Delete this listing?
        </h3>
        <p className="mt-1.5 text-sm text-white/70">
          Buyers will no longer see <span className="text-white font-semibold">{listing.title}</span> on
          the marketplace. This can&apos;t be undone — you&apos;ll need to recreate it from scratch.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)] text-sm font-medium text-white/85 hover:border-[var(--color-border-strong)] hover:text-white cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(listing)}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full bg-[var(--color-danger)] text-white text-sm font-semibold hover:brightness-110 active:scale-[0.98] cursor-pointer transition-[filter,transform]"
          >
            <Trash2 className="size-4" />
            Delete listing
          </button>
        </div>
      </div>
    </div>
  );
}

// ── States ─────────────────────────────────────────────────────

function SkeletonState() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[100px] rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
          />
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-[420px] rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/40 p-10 md:p-14 text-center">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
        <Sparkles className="size-6 text-[var(--color-neon-cyan)]" />
      </div>
      <h2 className="font-display text-xl font-bold text-white">
        You haven&apos;t listed anything yet
      </h2>
      <p className="mt-2 text-white/65 max-w-md mx-auto text-sm">
        Spin up your first boost in five quick steps. New boosters get a
        featured slot during open beta.
      </p>
      <div className="mt-6">
        <Link
          href="/sell/onboarding"
          className={cn(
            "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full",
            "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
            "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
            "transition-[filter,transform] duration-150",
          )}
        >
          <Plus className="size-4" />
          Create your first listing
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function ConnectGate({ onConnect }: { onConnect: () => void }) {
  return (
    <div className="rounded-2xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 p-10 md:p-14 text-center max-w-2xl mx-auto">
      <div className="mx-auto grid place-items-center size-14 rounded-full bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] mb-5">
        <Lock className="size-6 text-[var(--color-neon-cyan)]" />
      </div>
      <h2 className="font-display text-2xl font-bold text-white">
        Sign in to manage your listings
      </h2>
      <p className="mt-2 text-white/70 max-w-md mx-auto">
        Your listings are tied to your wallet or social login.
      </p>
      <div className="mt-7">
        <Button size="lg" onClick={onConnect}>
          Connect wallet or social
        </Button>
      </div>
    </div>
  );
}
