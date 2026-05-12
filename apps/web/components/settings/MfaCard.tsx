"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, ShieldOff, Loader2, KeyRound } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface MfaCardProps {
  enabled: boolean;
  onChange: (next: boolean) => void;
  /** Used to seed the QR placeholder pattern so it doesn't change between renders. */
  seed: string;
}

/**
 * MFA enrolment card.
 *
 * The QR is rendered as a deterministic placeholder square pattern so the UI
 * is real and exercisable in dev. When you wire a real TOTP backend, swap the
 * placeholder for the actual otpauth:// URL rendered via a QR library.
 */
export function MfaCard({ enabled, onChange, seed }: MfaCardProps) {
  const { t } = useLanguage();
  const [setupOpen, setSetupOpen] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Visible pseudo-secret for the placeholder. Real flows fetch this from the server.
  const secret = useMemo(() => generateSecret(seed), [seed]);
  const qrSquares = useMemo(() => buildQrPattern(seed), [seed]);

  function startSetup() {
    setError(null);
    setCode("");
    setSetupOpen(true);
  }

  function cancelSetup() {
    setSetupOpen(false);
    setCode("");
    setError(null);
  }

  function verify() {
    if (!/^\d{6}$/.test(code)) {
      setError(t("settings.security.mfa.code.invalid"));
      return;
    }
    setVerifying(true);
    // Simulated verification — replace with API call when backend is ready.
    window.setTimeout(() => {
      setVerifying(false);
      setSetupOpen(false);
      setCode("");
      onChange(true);
    }, 450);
  }

  function disable() {
    onChange(false);
  }

  return (
    <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/40 p-4 md:p-5 space-y-4">
      <div className="flex items-start gap-3 flex-wrap">
        <span
          className={cn(
            "grid place-items-center size-10 rounded-lg shrink-0",
            enabled
              ? "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/40"
              : "bg-[var(--color-bg-panel)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]",
          )}
        >
          {enabled ? <ShieldCheck className="size-5" /> : <ShieldOff className="size-5" />}
        </span>
        <div className="flex-1 min-w-[200px]">
          <div className="font-semibold text-[var(--color-text-primary)]">
            {t("settings.security.mfa")}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t("settings.security.mfa.hint")}
          </p>
          <div
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] px-2 py-1 rounded-full",
              enabled
                ? "bg-[var(--color-success)]/15 text-[var(--color-success)] border border-[var(--color-success)]/40"
                : "bg-[var(--color-bg-panel)] text-[var(--color-text-muted)] border border-[var(--color-border-subtle)]",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 rounded-full",
                enabled ? "bg-[var(--color-success)]" : "bg-[var(--color-text-muted)]",
              )}
            />
            {enabled ? t("settings.security.mfa.enabled") : t("settings.security.mfa.disabled")}
          </div>
        </div>
        <div className="shrink-0">
          {enabled ? (
            <Button variant="danger" size="sm" onClick={disable}>
              {t("settings.security.mfa.disable")}
            </Button>
          ) : !setupOpen ? (
            <Button size="sm" onClick={startSetup}>
              <KeyRound className="size-4" />
              {t("settings.security.mfa.enable")}
            </Button>
          ) : null}
        </div>
      </div>

      {setupOpen && !enabled && (
        <div className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)] p-4 md:p-5">
          <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-5">
            <div
              aria-label="MFA QR code"
              role="img"
              className="grid grid-cols-12 gap-0.5 p-3 rounded-lg bg-white aspect-square"
            >
              {qrSquares.map((on, i) => (
                <span
                  key={i}
                  className={cn(
                    "aspect-square rounded-[1px]",
                    on ? "bg-black" : "bg-transparent",
                  )}
                />
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {t("settings.security.mfa.setup.title")}
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  {t("settings.security.mfa.setup.body")}
                </p>
              </div>

              <div className="rounded-md bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] px-3 py-2 font-mono text-xs text-[var(--color-text-secondary)] break-all">
                {secret}
              </div>

              <label className="block">
                <span className="block text-[11px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)] mb-1.5">
                  {t("settings.security.mfa.code")}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setCode(v);
                    setError(null);
                  }}
                  placeholder="000000"
                  className={cn(
                    "w-full h-11 px-3.5 rounded-md font-mono text-base tracking-[0.4em] text-center",
                    "bg-[var(--color-bg-panel-elevated)] text-[var(--color-text-primary)]",
                    "border border-[var(--color-border-strong)] outline-none",
                    "focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
                  )}
                />
              </label>

              {error && (
                <p className="text-xs text-[var(--color-danger)]" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={verify} disabled={verifying || code.length !== 6}>
                  {verifying ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="size-4" />
                  )}
                  {t("settings.security.mfa.verify")}
                </Button>
                <Button variant="ghost" size="sm" onClick={cancelSetup}>
                  {t("settings.security.mfa.cancel")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function generateSecret(seed: string): string {
  // Deterministic, demo-only TOTP-style secret derived from the seed.
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 131 + seed.charCodeAt(i)) >>> 0;
  let out = "";
  for (let i = 0; i < 32; i++) {
    out += alphabet[(h >>> ((i * 5) % 27)) & 31];
    h = (h * 1103515245 + 12345) >>> 0;
    if (i === 7 || i === 15 || i === 23) out += " ";
  }
  return out;
}

function buildQrPattern(seed: string): boolean[] {
  // Build a deterministic 12×12 "qr-like" placeholder.
  const size = 12;
  const cells: boolean[] = [];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // Three quiet "finder" corners typical of QR codes.
      const corner =
        (x < 3 && y < 3) ||
        (x >= size - 3 && y < 3) ||
        (x < 3 && y >= size - 3);
      if (corner) {
        const cx = x % 3;
        const cy = y % 3;
        cells.push(cx === 0 || cx === 2 || cy === 0 || cy === 2);
        continue;
      }
      h = (h * 1664525 + 1013904223) >>> 0;
      cells.push((h & 1) === 1);
    }
  }
  return cells;
}
