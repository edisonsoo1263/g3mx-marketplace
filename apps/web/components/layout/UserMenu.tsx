"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BorderBeam } from "border-beam";
import {
  Power,
  Copy,
  ExternalLink,
  CheckCircle2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  Package,
  ListOrdered,
  Wallet as WalletIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { getAddressExplorerUrl } from "@/lib/auth/wagmi";
import type { UnifiedUser } from "@/hooks/useAuth";

interface UserMenuProps {
  user: UnifiedUser;
  onLogout: () => void;
}

/**
 * UserMenu — wallet chip in the navbar that opens a dropdown profile panel.
 *
 * Inspired by typical Web3 wallet menus (compact balance pill → expanded
 * panel with addresses, balances, top-up/withdraw, referral). All numbers
 * are placeholders until the wagmi balance hook is wired up.
 */
export function UserMenu({ user, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <WalletChip
        user={user}
        active={open}
        onClick={() => setOpen((v) => !v)}
      />
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-3 z-50"
          >
            <ProfilePanel
              user={user}
              onClose={() => setOpen(false)}
              onLogout={() => {
                onLogout();
                setOpen(false);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Wallet chip ────────────────────────────────────────────────

interface WalletChipProps {
  user: UnifiedUser;
  active: boolean;
  onClick: () => void;
}

function WalletChip({ user, active, onClick }: WalletChipProps) {
  // Placeholder balance — replace with `useBalance` from wagmi later.
  const balanceUsd = "$0.00";

  return (
    <BorderBeam
      size="sm"
      colorVariant="colorful"
      theme="dark"
      className={cn(
        "inline-flex cursor-pointer rounded-full select-none",
        "transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 active:translate-y-0",
        active && "brightness-110",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        aria-expanded={active}
        aria-label="Open user menu"
        className="flex items-center gap-2 h-9 pl-1 pr-3.5 rounded-full bg-[var(--color-bg-deep)] cursor-pointer"
      >
        <Avatar seed={user.id} size={28} />
        <span className="font-mono text-sm font-semibold text-white tabular-nums">
          {balanceUsd}
        </span>
      </button>
    </BorderBeam>
  );
}

// ── Profile panel ─────────────────────────────────────────────

interface ProfilePanelProps {
  user: UnifiedUser;
  onClose: () => void;
  onLogout: () => void;
}

function ProfilePanel({ user, onClose, onLogout }: ProfilePanelProps) {
  const [copied, setCopied] = useState<"address" | "ref" | null>(null);

  const wallet = user.walletAddress;
  const handle =
    user.displayName?.replace(/\s+/g, "_") ??
    (wallet ? wallet.slice(2, 10) : user.email?.split("@")[0] ?? "operative");
  const refUrl = `g3mx.io/ref/${handle.toLowerCase()}`;

  function copy(text: string, kind: "address" | "ref") {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  return (
    <div
      role="dialog"
      aria-label="User menu"
      className={cn(
        "w-[360px] max-w-[calc(100vw-1rem)]",
        "rounded-2xl border border-[var(--color-border-strong)]",
        "bg-[var(--color-bg-panel)] p-4 space-y-4",
        "shadow-[var(--shadow-card)]",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar seed={user.id} size={48} rounded="md" />
          <div className="min-w-0 leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">
              Operative
            </div>
            <div className="text-base font-semibold text-white truncate">
              {user.displayName ?? handle}
            </div>
            {user.email && (
              <div className="text-[11px] font-mono text-white/50 truncate mt-0.5">
                {user.email}
              </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          aria-label="Logout"
          title="Logout"
          className={cn(
            "shrink-0 grid place-items-center size-9 rounded-md cursor-pointer",
            "text-white/70 hover:text-[var(--color-danger)]",
            "hover:bg-[var(--color-bg-panel-elevated)] transition-colors",
          )}
        >
          <Power className="size-4" />
        </button>
      </div>

      {/* Wallet address */}
      {wallet && (
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">
                <WalletIcon className="size-3" />
                Wallet address
              </div>
              <div className="mt-1 font-mono text-sm text-white truncate">
                {shortAddr(wallet)}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <IconBtn
                onClick={() => copy(wallet, "address")}
                label={copied === "address" ? "Copied" : "Copy"}
              >
                {copied === "address" ? (
                  <CheckCircle2 className="size-4 text-[var(--color-success)]" />
                ) : (
                  <Copy className="size-4" />
                )}
              </IconBtn>
              <IconBtn
                as="a"
                href={getAddressExplorerUrl(wallet)}
                target="_blank"
                rel="noopener noreferrer"
                label="Open in explorer"
              >
                <ExternalLink className="size-4" />
              </IconBtn>
            </div>
          </div>
        </div>
      )}

      {/* Balances */}
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-3 space-y-2">
        <BalanceRow ticker="BNB" amount="0.00" tone="amber" />
        <BalanceRow ticker="USDT" amount="0.00" tone="cyan" />
      </div>

      {/* Top Up / Withdraw */}
      <div className="grid grid-cols-2 gap-2">
        <GradientBorderButton onClick={onClose}>
          <ArrowDownToLine className="size-4" /> Top Up
        </GradientBorderButton>
        <PlainBorderButton onClick={onClose}>
          <ArrowUpFromLine className="size-4" /> Withdraw
        </PlainBorderButton>
      </div>

      {/* Referral */}
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="size-3.5 text-[var(--color-neon-amber)]" />
          <span className="text-sm font-semibold text-white">Referral link</span>
        </div>
        <p className="text-xs text-white/70 mb-2.5">
          Get your friends to join — earn XP and a slice of their first boost.
        </p>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]">
          <span className="text-xs font-mono text-white truncate flex-1">{refUrl}</span>
          <IconBtn
            onClick={() => copy(refUrl, "ref")}
            label={copied === "ref" ? "Copied" : "Copy"}
          >
            {copied === "ref" ? (
              <CheckCircle2 className="size-3.5 text-[var(--color-success)]" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </IconBtn>
        </div>
        <div className="flex items-center justify-between mt-2.5 text-xs">
          <span className="text-white/60">
            Total invited <span className="font-mono text-white ml-1">0</span>
          </span>
          <span className="text-white/60">
            XP earned <span className="font-mono text-[var(--color-neon-amber)] ml-1">0</span>
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 gap-2">
        <QuickLink href="/account/orders" icon={Package} onClose={onClose}>
          My Orders
        </QuickLink>
        <QuickLink href="/account/listings" icon={ListOrdered} onClose={onClose}>
          My Listings
        </QuickLink>
      </div>
    </div>
  );
}

// ── Building blocks ────────────────────────────────────────────

function GradientBorderButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 rounded-full",
        "text-sm font-semibold text-white cursor-pointer select-none",
        "transition-[transform,filter] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0",
      )}
      style={{
        background:
          "linear-gradient(var(--color-bg-panel), var(--color-bg-panel)) padding-box, " +
          "linear-gradient(90deg, var(--color-neon-cyan), var(--color-neon-violet), var(--color-neon-magenta), var(--color-neon-amber)) border-box",
        border: "1.5px solid transparent",
      }}
    >
      {children}
    </button>
  );
}

function PlainBorderButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 h-10 rounded-full",
        "border border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]",
        "text-sm font-semibold text-white cursor-pointer select-none",
        "transition-[transform,border-color,background-color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 hover:border-[var(--color-neon-cyan)]/50 active:translate-y-0",
      )}
    >
      {children}
    </button>
  );
}

function BalanceRow({
  ticker,
  amount,
  tone,
}: {
  ticker: string;
  amount: string;
  tone: "amber" | "cyan";
}) {
  const accent =
    tone === "amber" ? "var(--color-neon-amber)" : "var(--color-neon-cyan)";
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid place-items-center size-7 rounded-full font-display text-[11px] font-black"
          style={{
            background: `${accent}1a`,
            color: accent,
            border: `1px solid ${accent}55`,
          }}
        >
          {ticker.charAt(0)}
        </span>
        <span className="text-sm text-white">{ticker}</span>
      </div>
      <span className="text-sm font-mono text-white tabular-nums">{amount}</span>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  children,
  onClose,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer",
        "text-sm text-white",
        "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40",
        "hover:border-[var(--color-neon-cyan)]/40 hover:bg-[var(--color-bg-panel-elevated)] transition-colors",
      )}
    >
      <Icon className="size-4 text-white/70" />
      <span>{children}</span>
    </Link>
  );
}

interface IconBtnBaseProps {
  children: React.ReactNode;
  label: string;
}

interface IconBtnButtonProps extends IconBtnBaseProps {
  as?: "button";
  onClick?: () => void;
}

interface IconBtnAnchorProps extends IconBtnBaseProps {
  as: "a";
  href: string;
  target?: string;
  rel?: string;
}

type IconBtnProps = IconBtnButtonProps | IconBtnAnchorProps;

function IconBtn(props: IconBtnProps) {
  const className = cn(
    "grid place-items-center size-8 rounded-md cursor-pointer shrink-0",
    "text-white/70 hover:text-white hover:bg-[var(--color-bg-panel)] transition-colors",
  );

  if (props.as === "a") {
    return (
      <a
        href={props.href}
        target={props.target}
        rel={props.rel}
        title={props.label}
        aria-label={props.label}
        className={className}
      >
        {props.children}
      </a>
    );
  }
  return (
    <button
      type="button"
      onClick={props.onClick}
      title={props.label}
      aria-label={props.label}
      className={className}
    >
      {props.children}
    </button>
  );
}

function Avatar({
  seed,
  size,
  rounded = "full",
}: {
  seed: string;
  size: number;
  rounded?: "full" | "md";
}) {
  const hue1 = hash(seed) % 360;
  const hue2 = (hue1 + 60) % 360;
  return (
    <span
      aria-hidden
      className={cn(
        "grid place-items-center font-display font-bold text-white shrink-0",
        rounded === "full" ? "rounded-full" : "rounded-md",
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.42),
        background: `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 90% 60%))`,
        boxShadow: rounded === "md" ? "var(--shadow-glow-cyan)" : undefined,
      }}
    >
      {seed.slice(0, 1).toUpperCase()}
    </span>
  );
}

function shortAddr(addr: string): string {
  if (addr.length <= 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
