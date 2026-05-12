"use client";

import { useState } from "react";
import { CheckCircle2, Copy, Sparkles } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils/cn";

interface ReferralCardProps {
  url: string;
  invited?: number;
  xpEarned?: number;
}

export function ReferralCard({ url, invited = 0, xpEarned = 0 }: ReferralCardProps) {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
      })
      .catch(() => undefined);
  }

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 p-4 md:p-5 space-y-3">
      <div className="flex items-start gap-3 flex-wrap">
        <span
          aria-hidden
          className="grid place-items-center size-10 rounded-lg shrink-0 bg-[var(--color-neon-amber)]/15 text-[var(--color-neon-amber)] border border-[var(--color-neon-amber)]/40"
        >
          <Sparkles className="size-5" />
        </span>
        <div className="flex-1 min-w-[200px] leading-tight">
          <div className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t("settings.referral.title")}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t("settings.referral.subtitle")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 px-3 py-2 rounded-md border border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]">
        <span className="flex-1 min-w-0 font-mono text-sm text-[var(--color-text-primary)] truncate">
          {url}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={t(copied ? "settings.referral.copied" : "settings.referral.copy")}
          className={cn(
            "inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md cursor-pointer shrink-0",
            "text-xs font-medium border transition-colors",
            copied
              ? "border-[var(--color-success)]/50 bg-[var(--color-success)]/10 text-[var(--color-success)]"
              : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)] text-[var(--color-text-secondary)] hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)]",
          )}
        >
          {copied ? (
            <>
              <CheckCircle2 className="size-3.5" />
              {t("settings.referral.copied")}
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              {t("settings.referral.copy")}
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Stat label={t("settings.referral.invited")} value={invited.toString()} tone="cyan" />
        <Stat
          label={t("settings.referral.xp")}
          value={xpEarned.toLocaleString()}
          tone="amber"
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "amber";
}) {
  const accent =
    tone === "cyan" ? "var(--color-neon-cyan)" : "var(--color-neon-amber)";
  return (
    <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] px-3 py-2.5">
      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
        {label}
      </div>
      <div
        className="mt-1 font-display text-xl font-bold tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </div>
    </div>
  );
}
