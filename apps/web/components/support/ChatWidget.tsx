"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Bot,
  Trash2,
  Sparkles,
  Mail,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { ChatMessage } from "@/components/support/ChatMessage";

const SUGGESTIONS = [
  "How does escrow work?",
  "How do I list my service?",
  "Report a bug or issue",
  "What payment methods do you accept?",
];

const SUPPORT_EMAIL = "support@g3mx.xyz";

/**
 * ChatWidget — floating customer-support chat. Mounts globally via layout.tsx.
 *
 * Closed: a circular launcher pinned to the bottom-right (or bottom of viewport
 * on mobile). Open: ~380×580 panel on desktop, full-screen sheet on mobile.
 *
 * Streams responses from /api/chat. Conversation persists to localStorage so
 * users can come back and continue. Esc closes the panel.
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { user } = useAuth();
  const { messages, sendMessage, isLoading, clear, error } = useChat({
    // Read fresh on every send — picks up login state changes mid-conversation.
    getMetadata: () => ({
      user_id: user?.id,
      wallet_address: user?.walletAddress ?? undefined,
    }),
  });
  const reduced = useReducedMotion();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 150);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  // Esc closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const text = draft.trim();
    if (!text || isLoading) return;
    void sendMessage(text);
    setDraft("");
  }

  function onInputKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function pickSuggestion(s: string) {
    void sendMessage(s);
  }

  return (
    <>
      {/* Launcher (closed state) */}
      <AnimatePresence initial={false}>
        {!open && <Launcher onClick={() => setOpen(true)} reduced={!!reduced} />}
      </AnimatePresence>

      {/* Panel (open state) */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.96 }
            }
            animate={
              reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
            }
            exit={
              reduced
                ? { opacity: 0 }
                : { opacity: 0, y: 20, scale: 0.96 }
            }
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            role="dialog"
            aria-label="Customer support chat"
            className={cn(
              "fixed z-[60] flex flex-col",
              // Mobile: full-screen sheet from below
              "inset-0 sm:inset-auto",
              // Desktop: floating panel bottom-right
              "sm:bottom-4 sm:right-4 sm:w-[380px] sm:h-[580px] sm:max-h-[calc(100vh-2rem)]",
              "rounded-none sm:rounded-2xl overflow-hidden",
              "bg-[var(--color-bg-panel)] border border-[var(--color-border-strong)]",
              "shadow-[0_24px_64px_rgb(0_0_0_/_60%),0_0_36px_oklch(78%_0.18_200/_25%)]",
            )}
          >
            <Header onClose={() => setOpen(false)} onClear={clear} hasMessages={messages.length > 0} />

            {/* Messages scroll area */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[var(--color-bg-deep)]/40"
            >
              {messages.length === 0 ? (
                <WelcomeState onPick={pickSuggestion} />
              ) : (
                messages.map((m) => <ChatMessage key={m.id} message={m} />)
              )}
            </div>

            {/* Composer */}
            <form
              onSubmit={submit}
              className="px-3 pt-3 pb-3 border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]"
            >
              <div
                className={cn(
                  "flex items-center gap-2 h-11 px-3 rounded-full",
                  "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]",
                  "transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
                  "focus-within:border-[var(--color-neon-cyan)] focus-within:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
                )}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder={
                    isLoading
                      ? "GG is replying…"
                      : "Ask GG anything about G3MX…"
                  }
                  maxLength={4000}
                  disabled={isLoading}
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/45 disabled:opacity-60"
                  aria-label="Type a message"
                />
                <button
                  type="submit"
                  disabled={isLoading || draft.trim().length === 0}
                  aria-label="Send message"
                  className={cn(
                    "grid place-items-center size-8 rounded-full shrink-0 cursor-pointer",
                    "transition-[background-color,transform,opacity] duration-150",
                    "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]",
                    "hover:brightness-110 active:scale-95",
                    "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100",
                  )}
                >
                  <Send className="size-4" />
                </button>
              </div>

              {error && (
                <div className="mt-2 text-[11px] text-[var(--color-danger)]">
                  {error}
                </div>
              )}

              <FooterDisclaimer />
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────

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
      aria-label="Open customer support chat"
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
      <MessageCircle className="size-6" />
      {/* Pulse ring for "I'm here, click me" affordance */}
      {!reduced && (
        <span
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            border: "2px solid var(--color-neon-cyan)",
            animation: "pulse-glow 2.4s ease-out infinite",
          }}
        />
      )}
    </motion.button>
  );
}

function Header({
  onClose,
  onClear,
  hasMessages,
}: {
  onClose: () => void;
  onClear: () => void;
  hasMessages: boolean;
}) {
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
          <Bot className="size-4 text-[var(--color-text-inverse)]" />
        </span>
        <div className="leading-tight min-w-0">
          <div className="text-sm font-semibold text-white truncate">GG · G3MX Guide</div>
          <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-[var(--color-success)]"
              style={{ boxShadow: "0 0 6px var(--color-success)" }}
            />
            Online · 24/7
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {hasMessages && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear chat"
            title="Clear chat"
            className="grid place-items-center size-9 rounded-md cursor-pointer text-white/65 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors"
          >
            <Trash2 className="size-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          title="Close"
          className="grid place-items-center size-9 rounded-md cursor-pointer text-white/65 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors"
        >
          <X className="size-5" />
        </button>
      </div>
    </header>
  );
}

function WelcomeState({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="text-center py-3">
      <span
        aria-hidden
        className="inline-grid place-items-center size-12 rounded-full mb-3"
        style={{
          background:
            "linear-gradient(135deg, var(--color-neon-cyan), var(--color-neon-magenta))",
          boxShadow: "0 0 24px oklch(78% 0.18 200 / 45%)",
        }}
      >
        <Sparkles className="size-5 text-[var(--color-text-inverse)]" />
      </span>
      <h3 className="font-display text-base font-bold text-white">
        Hey, I&apos;m GG.
      </h3>
      <p className="mt-1 text-xs text-white/65 max-w-[260px] mx-auto leading-relaxed">
        Ask me anything about boosting, listings, escrow, or payments. I&apos;m
        here 24/7.
      </p>

      <div className="mt-5 grid gap-1.5 text-left">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-white/40 px-1 mb-0.5">
          Quick questions
        </div>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            className={cn(
              "w-full text-left px-3 py-2 rounded-lg text-xs cursor-pointer",
              "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel-elevated)]/60",
              "text-white/85 hover:text-white",
              "hover:border-[var(--color-neon-cyan)]/45 hover:bg-[var(--color-bg-panel-elevated)]",
              "transition-[border-color,background-color,color,transform]",
              "hover:-translate-y-0.5",
            )}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function FooterDisclaimer() {
  return (
    <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-white/40">
      <span className="font-mono">AI replies — verify critical info.</span>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className="inline-flex items-center gap-1 hover:text-white/70 transition-colors"
      >
        <Mail className="size-3" />
        {SUPPORT_EMAIL}
      </a>
    </div>
  );
}
