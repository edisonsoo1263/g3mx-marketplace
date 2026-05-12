"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageSquareWarning,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/hooks/useAuth";

type Status = "idle" | "submitting" | "success" | "error";
type Severity = "low" | "medium" | "high" | "critical";
type Category = "payment" | "auth" | "listing" | "boost" | "ui" | "other";

const SEVERITY_OPTIONS: Array<{ value: Severity; label: string; hint: string }> = [
  { value: "low", label: "Low", hint: "Cosmetic" },
  { value: "medium", label: "Medium", hint: "Annoying" },
  { value: "high", label: "High", hint: "Blocks me" },
  { value: "critical", label: "Critical", hint: "Lost data / money" },
];

const CATEGORY_OPTIONS: Array<{ value: Category; label: string }> = [
  { value: "payment", label: "Payment" },
  { value: "auth", label: "Login" },
  { value: "listing", label: "Listing" },
  { value: "boost", label: "Boost" },
  { value: "ui", label: "UI / Visual" },
  { value: "other", label: "Other" },
];

const SUPPORT_EMAIL = "support@g3mx.xyz";

/**
 * ReportIssueWidget — floating "Report an issue" launcher + modal form.
 *
 * Mounts globally via layout.tsx. Same launcher position as the previous chat
 * widget. Submission goes to /api/report-issue → Discord webhook.
 */
export function ReportIssueWidget() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  // Esc closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <AnimatePresence initial={false}>
        {!open && <Launcher onClick={() => setOpen(true)} reduced={!!reduced} />}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Report an issue"
            initial={
              reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }
            }
            animate={
              reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.96 }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "fixed z-[60] flex flex-col",
              "inset-0 sm:inset-auto",
              "sm:bottom-4 sm:right-4 sm:w-[380px] sm:max-h-[calc(100vh-2rem)]",
              "rounded-none sm:rounded-2xl overflow-hidden",
              "bg-[var(--color-bg-panel)] border border-[var(--color-border-strong)]",
              "shadow-[0_24px_64px_rgb(0_0_0_/_60%),0_0_36px_oklch(78%_0.18_200/_25%)]",
            )}
          >
            <Header onClose={() => setOpen(false)} />
            <ReportForm onClose={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Launcher ───────────────────────────────────────────────────

function Launcher({
  onClick,
  reduced,
}: {
  onClick: () => void;
  reduced: boolean;
}) {
  return (
    <motion.button
      key="launcher"
      type="button"
      onClick={onClick}
      aria-label="Report an issue"
      title="Report an issue"
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
      transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={reduced ? undefined : { scale: 1.06, y: -2 }}
      whileTap={reduced ? undefined : { scale: 0.95 }}
      className={cn(
        "fixed bottom-4 right-4 z-[60]",
        "grid place-items-center size-14 rounded-full cursor-pointer",
        "text-[var(--color-text-inverse)]",
      )}
      style={{
        background:
          "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-magenta))",
        boxShadow:
          "0 0 0 1.5px oklch(78% 0.18 200 / 60%), 0 0 32px oklch(78% 0.18 200 / 55%), 0 8px 24px rgb(0 0 0 / 50%)",
      }}
    >
      <MessageSquareWarning className="size-6" />
    </motion.button>
  );
}

// ── Header ─────────────────────────────────────────────────────

function Header({ onClose }: { onClose: () => void }) {
  return (
    <header className="px-4 h-14 flex items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/60 shrink-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          aria-hidden
          className="grid place-items-center size-9 rounded-full shrink-0"
          style={{
            background:
              "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-magenta))",
            boxShadow: "0 0 16px oklch(78% 0.18 200 / 45%)",
          }}
        >
          <MessageSquareWarning className="size-4 text-[var(--color-text-inverse)]" />
        </span>
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold text-white truncate">
            Report an issue
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
            Goes straight to the team
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        title="Close"
        className="grid place-items-center size-9 rounded-md cursor-pointer text-white/65 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors"
      >
        <X className="size-5" />
      </button>
    </header>
  );
}

// ── Form ───────────────────────────────────────────────────────

function ReportForm({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<Severity>("medium");
  const [category, setCategory] = useState<Category>("other");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => titleRef.current?.focus(), 150);
    return () => window.clearTimeout(t);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();
    if (cleanTitle.length < 3 || cleanDescription.length < 5) {
      setErrorMsg(
        "Add a short title and a few sentences describing what happened.",
      );
      return;
    }

    setStatus("submitting");
    setErrorMsg(null);

    try {
      const res = await fetch("/api/report-issue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: cleanTitle,
          description: cleanDescription,
          severity,
          category,
          url:
            typeof window !== "undefined" ? window.location.href : undefined,
          user_id: user?.id,
          wallet_address: user?.walletAddress ?? undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? `Submission failed (${res.status})`);
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed.");
    }
  }

  if (status === "success") {
    return <SuccessState onClose={onClose} onReset={() => resetForm()} />;
  }

  function resetForm() {
    setTitle("");
    setDescription("");
    setSeverity("medium");
    setCategory("other");
    setStatus("idle");
    setErrorMsg(null);
  }

  const submitting = status === "submitting";

  return (
    <form
      onSubmit={submit}
      className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-[var(--color-bg-deep)]/40"
    >
      <Field label="Title" hint={`${title.length}/140`}>
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={140}
          placeholder="e.g. Login button does nothing"
          required
          disabled={submitting}
          className={cn(
            "w-full h-10 px-3 rounded-md text-sm text-white",
            "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
            "outline-none transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
            "focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
            "placeholder:text-white/40 disabled:opacity-50",
          )}
        />
      </Field>

      <Field label="What happened?" hint={`${description.length}/4000`}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={4000}
          rows={5}
          placeholder="Steps to reproduce, what you expected, what actually happened…"
          required
          disabled={submitting}
          className={cn(
            "w-full px-3 py-2 rounded-md text-sm text-white resize-y min-h-[100px]",
            "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
            "outline-none transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
            "focus:border-[var(--color-neon-cyan)] focus:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
            "placeholder:text-white/40 disabled:opacity-50",
          )}
        />
      </Field>

      <Field label="Severity">
        <div className="grid grid-cols-2 gap-1.5">
          {SEVERITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setSeverity(opt.value)}
              disabled={submitting}
              className={cn(
                "px-3 py-2 rounded-md cursor-pointer text-left",
                "border transition-[border-color,background-color]",
                severity === opt.value
                  ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 hover:border-[var(--color-border-strong)]",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              <div className="text-sm font-semibold text-white">{opt.label}</div>
              <div className="text-[10px] text-white/55">{opt.hint}</div>
            </button>
          ))}
        </div>
      </Field>

      <Field label="Area">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setCategory(opt.value)}
              disabled={submitting}
              className={cn(
                "px-3 h-8 rounded-full cursor-pointer text-xs font-medium",
                "border transition-[border-color,background-color]",
                category === opt.value
                  ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-white"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 text-white/75 hover:border-[var(--color-border-strong)] hover:text-white",
                "disabled:opacity-50 disabled:cursor-not-allowed",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Field>

      {errorMsg && (
        <div className="flex items-start gap-2 text-xs text-[var(--color-danger)]">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="pt-1 flex items-center gap-2">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            "flex-1 inline-flex items-center justify-center gap-2 h-11 px-4 rounded-full",
            "text-sm font-semibold text-[var(--color-text-inverse)] cursor-pointer",
            "transition-[transform,opacity,filter] duration-150",
            "bg-[var(--color-neon-cyan)] hover:brightness-110 active:scale-[0.98]",
            "disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100",
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            <>
              <Send className="size-4" />
              Send report
            </>
          )}
        </button>
      </div>

      <div className="text-[10px] text-white/40 text-center pt-1">
        Or email <a href={`mailto:${SUPPORT_EMAIL}`} className="hover:text-white/70 underline">{SUPPORT_EMAIL}</a>
      </div>
    </form>
  );
}

// ── States ─────────────────────────────────────────────────────

function SuccessState({
  onClose,
  onReset,
}: {
  onClose: () => void;
  onReset: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center bg-[var(--color-bg-deep)]/40">
      <div className="grid place-items-center size-14 rounded-full bg-[var(--color-success)]/15 text-[var(--color-success)] ring-1 ring-[var(--color-success)]/30 mb-4">
        <CheckCircle2 className="size-7" />
      </div>
      <h3 className="font-display text-base font-bold text-white">
        Report sent
      </h3>
      <p className="mt-1.5 text-xs text-white/65 max-w-[280px] leading-relaxed">
        Thanks — the team got it. We&apos;ll follow up if we need more details.
      </p>
      <div className="mt-5 flex items-center gap-2">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium text-white/70 hover:text-white px-3 h-9 rounded-full border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60 hover:border-[var(--color-border-strong)] cursor-pointer transition-colors"
        >
          Report another
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-xs font-semibold text-[var(--color-text-inverse)] px-3 h-9 rounded-full bg-[var(--color-neon-cyan)] hover:brightness-110 cursor-pointer transition-[filter]"
        >
          Done
        </button>
      </div>
    </div>
  );
}

// ── Field wrapper ──────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
          {label}
        </span>
        {hint && (
          <span className="text-[10px] font-mono text-white/35">{hint}</span>
        )}
      </div>
      {children}
    </label>
  );
}
