"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { BorderBeam } from "border-beam";
import { formatUnits, type Address } from "viem";
import {
  useUsdcBalanceOnCurrentChain,
  USDC_DEFAULT_DECIMALS,
} from "@/lib/contracts/usdc";
import {
  Power,
  Copy,
  ExternalLink,
  CheckCircle2,
  ArrowDownToLine,
  ArrowUpFromLine,
  Sparkles,
  Wallet as WalletIcon,
} from "lucide-react";
import {
  UsdtCircleColorful,
  UsdcCircleColorful,
  BaseCircleColorful,
} from "@ant-design/web3-icons";
import { cn } from "@/lib/utils/cn";
import type { UnifiedUser } from "@/hooks/useAuth";
import { useReferral } from "@/hooks/useReferral";
import { getAddressExplorerUrl } from "@/lib/auth/wagmi";
import { usePrivy } from "@privy-io/react-auth";
import {
  resolveDisplayPicture,
  useProfilePrefs,
} from "@/hooks/useProfilePrefs";
import { useLocale } from "@/hooks/useLocale";

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
  const [mounted, setMounted] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  // SSR safety — document.body only exists after hydration.
  useEffect(() => {
    setMounted(true);
  }, []);

  // Anchor the portal-rendered panel to the wallet chip's screen position.
  // Re-measured on every relevant geometry change so the panel tracks the
  // chip if the viewport scrolls/resizes while the menu is open.
  useEffect(() => {
    if (!open) return;
    function updatePos() {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPanelPos({
        top: rect.bottom + 12,
        right: window.innerWidth - rect.right,
      });
    }
    updatePos();
    window.addEventListener("resize", updatePos);
    window.addEventListener("scroll", updatePos, true);
    return () => {
      window.removeEventListener("resize", updatePos);
      window.removeEventListener("scroll", updatePos, true);
    };
  }, [open]);

  // Esc to close. Click-outside is handled by the backdrop's onClick now
  // that the panel is portal-rendered to document.body (siblings, not a
  // parent-child relationship).
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  // Lock body scroll while the menu is open — prevents the page sliding
  // around behind the dimmed backdrop.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <div ref={triggerRef} className="relative">
      <WalletChip
        user={user}
        active={open}
        onClick={() => setOpen((v) => !v)}
      />
      {/* Portal the backdrop + panel to document.body so they sit above
          every other stacking context in the app (Sidebar at z-50, navbar
          children, content, footer). Without the portal the backdrop ends
          up trapped inside the navbar's stacking context and only dims
          part of the page. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && panelPos && (
              <>
                {/* Modal backdrop — full-viewport dim + blur. 80% black
                    keeps the page faintly visible behind (per "still can
                    visible"); blur softens whatever shows through. */}
                <motion.div
                  key="user-menu-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-md"
                  aria-hidden
                />
                {/* Panel — positioned via getBoundingClientRect of the
                    wallet chip, so it stays anchored to the chip even
                    though it lives outside the React subtree. */}
                <motion.div
                  key="user-menu-panel"
                  initial={
                    reduced ? false : { opacity: 0, y: -4, scale: 0.98 }
                  }
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.98 }}
                  transition={{
                    duration: 0.18,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="fixed z-[9999]"
                  style={{
                    top: panelPos.top,
                    right: panelPos.right,
                  }}
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
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
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
  // Read the wallet's USDC balance on whichever chain it's currently
  // connected to. Switches automatically between Base / Base Sepolia
  // (and shows $0.00 on any other chain we don't have a USDC address
  // mapped for — see usdcAddressForChain in lib/contracts/usdc.ts).
  const walletAddress = user.walletAddress as Address | undefined;
  const { data: rawBalance, isLoading: balanceLoading } =
    useUsdcBalanceOnCurrentChain(walletAddress);

  const balanceUsd = useMemo(() => {
    if (balanceLoading && rawBalance === undefined) return "…";
    if (rawBalance === undefined || rawBalance === null) return "$0.00";
    const formatted = Number(
      formatUnits(rawBalance as bigint, USDC_DEFAULT_DECIMALS),
    );
    // Two decimal places below $1000, no decimals above ($1,234 instead
    // of $1,234.56) so the chip stays narrow at higher balances.
    if (formatted >= 1000) {
      return `$${Math.round(formatted).toLocaleString()}`;
    }
    return `$${formatted.toFixed(2)}`;
  }, [rawBalance, balanceLoading]);

  const { pictureUrl: customPicture, username, pictureSource } = useProfilePrefs();
  const { user: privyUser } = usePrivy();
  // Resolve the visible avatar by combining the custom upload + the user's
  // picked OAuth source (Discord / X / Google) — keeps navbar in lockstep
  // with the picture-source picker in Settings.
  const pictureUrl = resolveDisplayPicture(pictureSource, customPicture, privyUser);
  const initialSource = username ?? user.displayName ?? user.id;

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
        <Avatar
          seed={user.id}
          size={28}
          pictureUrl={pictureUrl}
          letter={initialSource.slice(0, 1)}
        />
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
  const referredBy = useReferral();
  const { t } = useLocale();
  const { pictureUrl: customPicture, username, pictureSource } = useProfilePrefs();
  const { user: privyUser } = usePrivy();
  // Resolve the visible avatar by combining the custom upload + the user's
  // picked OAuth source (Discord / X / Google) — keeps navbar in lockstep
  // with the picture-source picker in Settings.
  const pictureUrl = resolveDisplayPicture(pictureSource, customPicture, privyUser);

  const wallet = user.walletAddress;
  const baseDisplay = username ?? user.displayName ?? null;
  const handle =
    baseDisplay?.replace(/\s+/g, "_") ??
    (wallet ? wallet.slice(2, 10) : user.email?.split("@")[0] ?? "operative");
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://g3mx.xyz").replace(/\/+$/, "");
  const refUrl = `${baseUrl}/ref/${handle.toLowerCase()}`;
  const refDisplay = refUrl.replace(/^https?:\/\//, "");

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
          <Avatar
            seed={user.id}
            size={48}
            rounded="md"
            pictureUrl={pictureUrl}
            letter={(baseDisplay ?? handle ?? user.id).slice(0, 1)}
          />
          <div className="min-w-0 leading-tight">
            <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/60">
              {t("userMenu.operative")}
            </div>
            <div className="text-base font-semibold text-white truncate">
              {baseDisplay ?? handle}
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
          aria-label={t("userMenu.logout")}
          title={t("userMenu.logout")}
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
                {t("userMenu.walletAddress")}
              </div>
              <div className="mt-1 font-mono text-sm text-white truncate">
                {shortAddr(wallet)}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <IconBtn
                onClick={() => copy(wallet, "address")}
                label={copied === "address" ? t("userMenu.copied") : t("userMenu.copy")}
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
                label={t("userMenu.openInExplorer")}
              >
                <ExternalLink className="size-4" />
              </IconBtn>
            </div>
          </div>
        </div>
      )}

      {/* Balances — USDT, USDC, Base ETH. */}
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-3 space-y-2">
        <BalanceRow ticker="USDT" amount="0.00" Icon={UsdtCircleColorful} accent="#26a17b" />
        <BalanceRow ticker="USDC" amount="0.00" Icon={UsdcCircleColorful} accent="#2775ca" />
        <BalanceRow ticker="Base" amount="0.00" Icon={BaseCircleColorful} accent="#0052ff" />
      </div>

      {/* Top Up / Withdraw */}
      <div className="grid grid-cols-2 gap-2">
        <GradientBorderButton onClick={onClose}>
          <ArrowDownToLine className="size-4" /> {t("userMenu.topUp")}
        </GradientBorderButton>
        <PlainBorderButton onClick={onClose}>
          <ArrowUpFromLine className="size-4" /> {t("userMenu.withdraw")}
        </PlainBorderButton>
      </div>

      {/* Referred by — only visible when this visitor came via a /ref/<handle> link */}
      {referredBy && referredBy.toLowerCase() !== handle.toLowerCase() && (
        <div className="rounded-xl border border-[var(--color-neon-amber)]/30 bg-[var(--color-neon-amber)]/5 p-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-[var(--color-neon-amber)] shrink-0" />
            <span className="text-xs text-white leading-snug">
              {t("userMenu.referredByPrefix")}{" "}
              <span className="font-mono text-[var(--color-neon-cyan)]">
                @{referredBy}
              </span>
              <span className="text-white/60">
                {t("userMenu.referredBySuffix")}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Referral */}
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 p-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="size-3.5 text-[var(--color-neon-amber)]" />
          <span className="text-sm font-semibold text-white">{t("userMenu.referralLink")}</span>
        </div>
        <p className="text-xs text-white/70 mb-2.5">
          {t("userMenu.referralTagline")}
        </p>
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]">
          <span className="text-xs font-mono text-white truncate flex-1">{refDisplay}</span>
          <IconBtn
            onClick={() => copy(refUrl, "ref")}
            label={copied === "ref" ? t("userMenu.copied") : t("userMenu.copy")}
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
            {t("userMenu.totalInvited")} <span className="font-mono text-white ml-1">0</span>
          </span>
          <span className="text-white/60">
            {t("userMenu.xpEarned")} <span className="font-mono text-[var(--color-neon-amber)] ml-1">0</span>
          </span>
        </div>
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
  Icon,
}: {
  ticker: string;
  amount: string;
  Icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  /** Optional accent — currently unused since the Colorful icons carry their
   *  own brand color, but kept on the type so callers can stay declarative. */
  accent?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <Icon className="size-7 shrink-0" />
        <span className="text-sm font-semibold text-white">{ticker}</span>
      </div>
      <span className="text-sm font-mono text-white tabular-nums">{amount}</span>
    </div>
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
  pictureUrl,
  letter,
}: {
  seed: string;
  size: number;
  rounded?: "full" | "md";
  /** Custom uploaded picture (data URL). Falls back to gradient + letter. */
  pictureUrl?: string | null;
  /** Override the initial letter (defaults to the seed's first char). */
  letter?: string;
}) {
  const hue1 = hash(seed) % 360;
  const hue2 = (hue1 + 60) % 360;
  const initial = (letter ?? seed.slice(0, 1)).toUpperCase();

  if (pictureUrl) {
    return (
      <span
        aria-hidden
        className={cn(
          "overflow-hidden shrink-0 block",
          rounded === "full" ? "rounded-full" : "rounded-md",
        )}
        style={{
          width: size,
          height: size,
          boxShadow: rounded === "md" ? "var(--shadow-glow-cyan)" : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pictureUrl}
          alt=""
          className="w-full h-full object-cover"
        />
      </span>
    );
  }

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
      {initial}
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
