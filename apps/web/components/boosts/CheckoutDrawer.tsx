"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  Loader2,
  Lock,
  MessageCircle,
  ShieldCheck,
  Star,
  Tv,
  Wallet,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { TokenIcon, NetworkIcon } from "@web3icons/react/dynamic";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/useAuth";
import {
  addOrder,
  buildOrderFromListing,
  gameMeta,
  type CheckoutPayment,
} from "@/lib/data/userOrders";
import { getLadder } from "@/lib/data/ranks";
import type { BoostListing } from "@/lib/data/boostListings";

interface Props {
  listing: BoostListing | null;
  onClose: () => void;
}

type Status = "idle" | "submitting" | "success" | "error";

export function CheckoutDrawer({ listing, onClose }: Props) {
  const reduced = useReducedMotion();
  const router = useRouter();
  const { user, isAuthenticated, loginWithWallet } = useAuth();
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [payment, setPayment] = useState<CheckoutPayment>(PAYMENT_OPTIONS[0]);

  // Reset internal state any time a different listing is loaded into the drawer
  useEffect(() => {
    if (listing) {
      setStatus("idle");
      setErrorMsg(null);
      setOrderId(null);
      setPayment(PAYMENT_OPTIONS[0]);
    }
  }, [listing]);

  // Esc to close
  useEffect(() => {
    if (!listing) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [listing, onClose]);

  async function placeOrder() {
    if (!listing) return;
    if (!isAuthenticated || !user) {
      try {
        await loginWithWallet();
      } catch {
        // user dismissed login modal — leave drawer open
      }
      return;
    }
    setStatus("submitting");
    setErrorMsg(null);
    try {
      const order = buildOrderFromListing(
        listing,
        { id: user.id, walletAddress: user.walletAddress },
        payment,
      );
      const ok = await addOrder(order);
      if (!ok) {
        throw new Error(
          "Couldn't save your order. Check your connection and try again.",
        );
      }
      setOrderId(order.id);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Could not place order.");
    }
  }

  return (
    <AnimatePresence>
      {listing && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
          />
          <motion.aside
            key="panel"
            role="dialog"
            aria-label="Confirm purchase"
            initial={reduced ? { opacity: 0 } : { x: "100%", opacity: 0.6 }}
            animate={reduced ? { opacity: 1 } : { x: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { x: "100%", opacity: 0.6 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-[60] flex flex-col",
              "inset-0 sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[460px] lg:w-[520px]",
              "bg-[var(--color-bg-panel)] border-l border-[var(--color-border-strong)]",
              "shadow-[0_24px_64px_rgb(0_0_0_/_60%)] overflow-hidden",
            )}
          >
            <Header onClose={onClose} status={status} />
            {status === "success" && orderId ? (
              <SuccessState
                orderId={orderId}
                onView={() => {
                  onClose();
                  router.push("/account/orders");
                }}
                onClose={onClose}
              />
            ) : (
              <Body
                listing={listing}
                isAuthenticated={isAuthenticated}
                walletShort={shortAddr(user?.walletAddress)}
                status={status}
                errorMsg={errorMsg}
                payment={payment}
                onPaymentChange={setPayment}
                onConfirm={placeOrder}
              />
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Header ─────────────────────────────────────────────────────

function Header({ onClose, status }: { onClose: () => void; status: Status }) {
  const label =
    status === "success" ? "Order placed" : "Confirm your boost";
  return (
    <header className="px-4 sm:px-6 h-14 flex items-center justify-between gap-3 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/60 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          aria-hidden
          className="grid place-items-center size-8 rounded-full shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-magenta))",
            boxShadow: "0 0 14px oklch(78% 0.18 200 / 45%)",
          }}
        >
          <ShieldCheck className="size-3.5 text-[var(--color-text-inverse)]" />
        </span>
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold text-white truncate">{label}</div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
            72h escrow protected
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="grid place-items-center size-9 rounded-md text-white/65 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors cursor-pointer"
      >
        <X className="size-5" />
      </button>
    </header>
  );
}

// ── Body (idle / submitting / error) ───────────────────────────

interface BodyProps {
  listing: BoostListing;
  isAuthenticated: boolean;
  walletShort: string | null;
  status: Status;
  errorMsg: string | null;
  payment: CheckoutPayment;
  onPaymentChange: (p: CheckoutPayment) => void;
  onConfirm: () => void;
}

function Body({
  listing,
  isAuthenticated,
  walletShort,
  status,
  errorMsg,
  payment,
  onPaymentChange,
  onConfirm,
}: BodyProps) {
  const meta = gameMeta(listing.game);
  const ladder = getLadder(listing.game);
  const fromTier = ladder.tiers[listing.fromIdx];
  const toTier = ladder.tiers[listing.toIdx];
  const submitting = status === "submitting";
  const accentColor = ACCENT_COLOR[meta.accent];

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Service */}
        <section>
          <div className="flex items-start gap-3.5">
            <span
              aria-hidden
              className="grid place-items-center size-12 rounded-xl text-2xl shrink-0"
              style={{
                background: `${accentColor}1f`,
                border: `1px solid ${accentColor}55`,
                boxShadow: `0 0 24px ${accentColor}25`,
              }}
            >
              {meta.emoji}
            </span>
            <div className="min-w-0 leading-tight pt-0.5">
              <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
                {meta.name} · {listing.serviceType}
              </div>
              <h3 className="mt-1 font-display text-lg font-bold text-white">
                {listing.title}
              </h3>
              <div className="mt-1.5 text-sm text-white/75">
                <span className="font-mono">{fromTier?.label}</span>
                <span className="mx-2 text-white/40">→</span>
                <span className="font-mono text-white">{toTier?.label}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Booster */}
        <section className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-3.5">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-2">
            Booster
          </div>
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="grid place-items-center size-10 rounded-full font-semibold text-white shrink-0"
              style={{
                background: `linear-gradient(135deg, hsl(${hash(listing.boosterTag) % 360} 80% 55%), hsl(${(hash(listing.boosterTag) + 60) % 360} 90% 60%))`,
              }}
            >
              {listing.boosterTag.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 leading-tight">
              <div className="text-sm font-semibold text-white truncate">
                @{listing.boosterTag}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/65 mt-0.5">
                <Star className="size-3 fill-[var(--color-neon-amber)] text-[var(--color-neon-amber)]" />
                <span className="font-mono tabular-nums">
                  {listing.boosterRating.toFixed(2)}
                </span>
                <span className="text-white/30">·</span>
                <span>{listing.ordersCompleted.toLocaleString()} done</span>
              </div>
            </div>
          </div>
        </section>

        {/* Options summary */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-2">
            What you&apos;re getting
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Stat label="Region" value={listing.region} />
            <Stat label="Queue" value={listing.queueType} />
            <Stat label="ETA" value={fmtEta(listing.etaHours)} icon={Clock} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <ModeChip
              icon={ShieldCheck}
              label="Offline mode"
              on={listing.options.offlineMode}
            />
            <ModeChip
              icon={Tv}
              label="Stream-along"
              on={listing.options.streamSession}
            />
            <ModeChip
              icon={Zap}
              label="Priority queue"
              on={listing.options.priorityQueue}
            />
          </div>
        </section>

        {/* Payment method */}
        <section>
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55 mb-2">
            Pay with
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PAYMENT_OPTIONS.map((opt) => {
              const active =
                opt.currency === payment.currency && opt.chain === payment.chain;
              return (
                <button
                  key={`${opt.currency}-${opt.chain}`}
                  type="button"
                  onClick={() => onPaymentChange(opt)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-left",
                    "border transition-[border-color,background-color]",
                    active
                      ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10"
                      : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 hover:border-[var(--color-border-strong)]",
                  )}
                >
                  <span className="relative shrink-0">
                    <span
                      aria-hidden
                      className="grid place-items-center size-9 rounded-full overflow-hidden"
                      style={{
                        background: `${opt.accent}1f`,
                        border: `1px solid ${opt.accent}55`,
                      }}
                    >
                      <TokenIcon
                        symbol={opt.tokenSymbol}
                        size={28}
                        variant="branded"
                      />
                    </span>
                    <span
                      aria-hidden
                      className="absolute -bottom-0.5 -right-0.5 grid place-items-center size-[14px] rounded-full overflow-hidden border-2 border-[var(--color-bg-panel)] bg-[var(--color-bg-panel)]"
                    >
                      <NetworkIcon
                        name={opt.networkName}
                        size={12}
                        variant="branded"
                      />
                    </span>
                  </span>
                  <div className="leading-tight min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {opt.currency}
                    </div>
                    <div className="text-[10px] font-mono text-white/55 uppercase tracking-[0.18em]">
                      on {opt.chain}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Pricing */}
        <section className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/65">Service price</span>
            <span className="font-mono tabular-nums text-white">
              ${listing.priceUsd.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-white/65">Network · escrow fee</span>
            <span className="font-mono text-white/65">included</span>
          </div>
          <div className="flex items-baseline justify-between pt-3 border-t border-[var(--color-border-subtle)]">
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-white/55">
              Total
            </span>
            <span className="font-display text-2xl font-bold text-white tabular-nums">
              ${listing.priceUsd.toFixed(2)}{" "}
              <span className="text-xs font-mono text-white/45 align-baseline">
                {payment.currency} · {payment.chain}
              </span>
            </span>
          </div>
          <div className="mt-3 flex items-start gap-2 text-[11px] text-white/55 leading-relaxed">
            <Lock className="size-3 mt-0.5 shrink-0 text-[var(--color-neon-cyan)]" />
            <span>
              Funds are held in 72-hour escrow and only release to the booster
              after you sign off — or automatically if you don&apos;t respond.
            </span>
          </div>
        </section>

        {errorMsg && (
          <div className="rounded-xl border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 p-3 text-xs text-[var(--color-danger)]">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="px-4 sm:px-6 py-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/60 shrink-0 space-y-2">
        {isAuthenticated && walletShort && (
          <div className="flex items-center gap-1.5 text-[11px] text-white/55">
            <Wallet className="size-3" />
            Paying from <span className="font-mono text-white/80">{walletShort}</span>
          </div>
        )}
        <button
          type="button"
          onClick={onConfirm}
          disabled={submitting}
          className={cn(
            "w-full inline-flex items-center justify-center gap-2 h-12 rounded-full",
            "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
            "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.99]",
            "transition-[filter,transform] duration-150",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Locking funds in escrow…
            </>
          ) : isAuthenticated ? (
            <>
              <Lock className="size-4" /> Confirm & lock ${listing.priceUsd.toFixed(2)}
            </>
          ) : (
            <>
              <Wallet className="size-4" /> Sign in to place order
            </>
          )}
        </button>
      </footer>
    </>
  );
}

// ── Success state ──────────────────────────────────────────────

function SuccessState({
  orderId,
  onView,
  onClose,
}: {
  orderId: string;
  onView: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
      <div className="grid place-items-center size-16 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] ring-1 ring-[var(--color-success)]/30 mb-4">
        <CheckCircle2 className="size-8" />
      </div>
      <h3 className="font-display text-xl font-bold text-white">
        Order placed
      </h3>
      <p className="mt-1.5 text-sm text-white/65 max-w-[280px] leading-relaxed">
        Your boost is locked in escrow. The booster will accept shortly — track progress in My Orders.
      </p>
      <div className="mt-3 px-3 py-1.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)] text-[11px] font-mono text-white/70">
        {orderId}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 w-full max-w-[280px]">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-full text-xs font-medium border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)] text-white/85 hover:border-[var(--color-border-strong)] cursor-pointer transition-colors"
        >
          Keep browsing
        </button>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center justify-center gap-1.5 h-10 rounded-full text-xs font-semibold text-[var(--color-text-inverse)] bg-[var(--color-neon-cyan)] hover:brightness-110 cursor-pointer transition-[filter]"
        >
          View orders <ArrowRight className="size-3.5" />
        </button>
      </div>
      <Link
        href="/account/orders"
        className="mt-3 inline-flex items-center gap-1 text-[11px] text-white/55 hover:text-white/85"
      >
        Or open My Orders <ExternalLink className="size-3" />
      </Link>
    </div>
  );
}

// ── Atoms ──────────────────────────────────────────────────────

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 px-3 py-2">
      <div className="text-[10px] font-mono text-white/45 uppercase tracking-[0.2em]">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-white flex items-center gap-1">
        {Icon && <Icon className="size-3 text-white/55" />}
        {value}
      </div>
    </div>
  );
}

function ModeChip({
  icon: Icon,
  label,
  on,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  on: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium border",
        on
          ? "border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/10 text-white"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 text-white/40",
      )}
    >
      <Icon className={cn("size-3", on ? "" : "opacity-60")} />
      {!on && <ZapOff className="hidden" />}
      {label}
    </span>
  );
}

const ACCENT_COLOR = {
  cyan: "var(--color-neon-cyan)",
  magenta: "var(--color-neon-magenta)",
  violet: "var(--color-neon-violet)",
  amber: "var(--color-neon-amber)",
} as const;

interface PaymentOption extends CheckoutPayment {
  /** web3icons token symbol used for the brand mark. */
  tokenSymbol: string;
  /** web3icons network id (lowercase, hyphenated). */
  networkName: string;
  accent: string;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    currency: "USDT",
    chain: "BSC",
    tokenSymbol: "USDT",
    networkName: "bsc",
    accent: "var(--color-neon-amber)",
  },
  {
    currency: "HYPE",
    chain: "HyperEVM",
    tokenSymbol: "HYPE",
    networkName: "hyperliquid",
    accent: "var(--color-neon-cyan)",
  },
];

function fmtEta(hours: number): string {
  if (hours < 24) return `${hours}h`;
  const d = Math.round(hours / 24);
  return `${d}d`;
}

function shortAddr(addr: string | null | undefined): string | null {
  if (!addr || addr.length < 12) return null;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
