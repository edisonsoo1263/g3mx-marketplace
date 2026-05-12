"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";
import { setReferral } from "@/hooks/useReferral";
import { cn } from "@/lib/utils/cn";

export default function ReferralCapturePage() {
  const params = useParams<{ handle: string }>();
  const [activated, setActivated] = useState(false);

  const rawHandle = (params?.handle ?? "").toString();
  const handle = useMemo(() => sanitizeHandle(rawHandle), [rawHandle]);

  useEffect(() => {
    if (!handle) return;
    setReferral(handle);
    setActivated(true);
  }, [handle]);

  if (!handle) {
    return <InvalidLinkCard />;
  }

  return <ActivatedCard handle={handle} activated={activated} />;
}

function ActivatedCard({ handle, activated }: { handle: string; activated: boolean }) {
  return (
    <main className="min-h-[60vh] grid place-items-center px-4 py-16">
      <div
        className={cn(
          "w-full max-w-md text-center space-y-5",
          "rounded-2xl border border-[var(--color-border-strong)]",
          "bg-[var(--color-bg-panel)]/80 backdrop-blur",
          "p-8",
        )}
      >
        <div className="inline-grid place-items-center size-14 rounded-full bg-[var(--color-neon-amber)]/15 text-[var(--color-neon-amber)] ring-1 ring-[var(--color-neon-amber)]/30">
          <Sparkles className="size-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-display font-bold text-white">
            Referral activated
          </h1>
          <p className="text-sm text-white/70 leading-relaxed">
            You were invited by{" "}
            <span className="font-mono text-[var(--color-neon-cyan)]">
              @{handle}
            </span>
            .
            <br />
            Bonus rewards will unlock once you complete your first boost.
          </p>
        </div>

        <div
          aria-live="polite"
          className={cn(
            "text-[11px] font-mono uppercase tracking-[0.25em]",
            activated ? "text-[var(--color-success)]" : "text-white/40",
          )}
        >
          {activated ? "Saved to this device" : "Activating…"}
        </div>

        <Link
          href="/"
          className={cn(
            "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full",
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
          Continue to G3MX
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </main>
  );
}

function InvalidLinkCard() {
  return (
    <main className="min-h-[60vh] grid place-items-center px-4 py-16">
      <div className="w-full max-w-md text-center space-y-4 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/80 p-8">
        <div className="inline-grid place-items-center size-12 rounded-full bg-[var(--color-danger)]/15 text-[var(--color-danger)] ring-1 ring-[var(--color-danger)]/30">
          <AlertCircle className="size-5" />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-display font-bold text-white">
            Invalid referral link
          </h1>
          <p className="text-sm text-white/70">
            That link doesn&apos;t look right. You can still continue to the marketplace.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 h-10 px-4 rounded-full border border-[var(--color-border-strong)] text-sm font-semibold text-white hover:border-[var(--color-neon-cyan)]/50 transition-colors"
        >
          Continue
        </Link>
      </div>
    </main>
  );
}

function sanitizeHandle(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 64);
}
