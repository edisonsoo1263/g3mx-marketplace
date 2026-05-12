"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils/cn";

interface LinkedAccountsState {
  x: { connected: boolean; handle: string | null };
  discord: { connected: boolean; handle: string | null };
}

const DEFAULT_STATE: LinkedAccountsState = {
  x: { connected: false, handle: null },
  discord: { connected: false, handle: null },
};

interface LinkedAccountsProps {
  /** Optional initial state — defaults to disconnected for both. */
  initial?: LinkedAccountsState;
}

export function LinkedAccounts({ initial = DEFAULT_STATE }: LinkedAccountsProps) {
  const [state, setState] = useState<LinkedAccountsState>(initial);

  function toggle(provider: "x" | "discord") {
    setState((s) => {
      const current = s[provider];
      if (current.connected) {
        return { ...s, [provider]: { connected: false, handle: null } };
      }
      const fake = provider === "x" ? "@operative_" : "operative#";
      const suffix = Math.floor(Math.random() * 9000 + 1000);
      return {
        ...s,
        [provider]: { connected: true, handle: `${fake}${suffix}` },
      };
    });
  }

  return (
    <div className="space-y-2.5">
      <LinkedAccountRow
        provider="x"
        connected={state.x.connected}
        handle={state.x.handle}
        onToggle={() => toggle("x")}
      />
      <LinkedAccountRow
        provider="discord"
        connected={state.discord.connected}
        handle={state.discord.handle}
        onToggle={() => toggle("discord")}
      />
    </div>
  );
}

interface LinkedAccountRowProps {
  provider: "x" | "discord";
  connected: boolean;
  handle: string | null;
  onToggle: () => void;
}

function LinkedAccountRow({ provider, connected, handle, onToggle }: LinkedAccountRowProps) {
  const { t } = useLanguage();
  const label =
    provider === "x" ? t("settings.linked.x.label") : t("settings.linked.discord.label");

  return (
    <div
      className={cn(
        "flex items-center gap-3 flex-wrap",
        "rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40",
        "p-3 md:p-4",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid place-items-center size-10 rounded-lg shrink-0",
          "border border-[var(--color-border-subtle)]",
          provider === "x" ? "bg-black text-white" : "bg-[#5865F2] text-white",
        )}
      >
        {provider === "x" ? <XIcon /> : <DiscordIcon />}
      </span>

      <div className="flex-1 min-w-[160px] leading-tight">
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</div>
        {connected && handle ? (
          <div className="flex items-center gap-1.5 text-xs text-[var(--color-success)] mt-0.5">
            <CheckCircle2 className="size-3.5" />
            <span className="font-mono">{handle}</span>
          </div>
        ) : (
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">
            {t("settings.linked.subtitle")}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "h-9 px-4 rounded-full text-sm font-semibold cursor-pointer shrink-0",
          "transition-[transform,border-color,background-color,color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
          "hover:-translate-y-0.5 active:translate-y-0",
          connected
            ? "border border-[var(--color-border-subtle)] bg-transparent text-[var(--color-text-secondary)] hover:border-[var(--color-danger)] hover:text-[var(--color-danger)]"
            : "border border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)] hover:shadow-[0_0_24px_oklch(78%_0.18_200/35%)]",
        )}
      >
        {connected ? t("settings.linked.disconnect") : t("settings.linked.connect")}
      </button>
    </div>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2H21l-6.52 7.45L22 22h-6.94l-4.83-6.32L4.5 22H1.74l6.98-7.98L1 2h7.06l4.39 5.81L18.244 2Zm-1.22 18.46h1.93L7.05 3.42H5.02L17.024 20.46Z" />
    </svg>
  );
}

function DiscordIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
      <path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.974 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  );
}
