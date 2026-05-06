"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Gamepad2, Tag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { games } from "@/lib/data/catalog";
import { serviceTypes, boostListings } from "@/lib/data/boostListings";

export interface SearchSuggestion {
  kind: "game" | "service" | "listing";
  label: string;
  /** Slug for game / serviceType label / listing id. */
  value: string;
  hint?: string;
}

interface HeroSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  onPickGame: (slug: string) => void;
  onPickServiceType: (st: string) => void;
}

const corpus: SearchSuggestion[] = [
  ...games.map<SearchSuggestion>((g) => ({
    kind: "game",
    label: g.name,
    value: g.slug,
    hint: g.region,
  })),
  ...serviceTypes.map<SearchSuggestion>((s) => ({
    kind: "service",
    label: s,
    value: s,
    hint: "Service",
  })),
  ...boostListings.slice(0, 24).map<SearchSuggestion>((l) => ({
    kind: "listing",
    label: l.title,
    value: l.id,
    hint: `${l.game} · $${l.priceUsd}`,
  })),
];

export function HeroSearch({
  query,
  onQueryChange,
  onPickGame,
  onPickServiceType,
}: HeroSearchProps) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return corpus
      .filter((s) => s.label.toLowerCase().includes(q))
      .sort((a, b) => {
        const aStart = a.label.toLowerCase().startsWith(q) ? 0 : 1;
        const bStart = b.label.toLowerCase().startsWith(q) ? 0 : 1;
        return aStart - bStart;
      })
      .slice(0, 8);
  }, [query]);

  useEffect(() => setActiveIdx(0), [query]);

  // Outside click closes
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  function commit(s: SearchSuggestion) {
    if (s.kind === "game") onPickGame(s.value);
    else if (s.kind === "service") onPickServiceType(s.value);
    onQueryChange(s.label);
    setOpen(false);
    inputRef.current?.blur();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const pick = suggestions[activeIdx];
      if (pick) commit(pick);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full max-w-2xl mx-auto">
      <div
        className={cn(
          "flex items-center gap-3 h-14 px-5 rounded-full",
          "border border-[var(--color-border-strong)] bg-[var(--color-bg-panel)]/80 backdrop-blur",
          "transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
          open
            ? "border-[var(--color-neon-cyan)] shadow-[0_0_0_4px_oklch(78%_0.18_200/15%),0_0_36px_oklch(78%_0.18_200/35%)]"
            : "hover:border-[var(--color-border-strong)]",
        )}
      >
        <Search className="size-5 text-[var(--color-neon-cyan)] shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search Valorant, Apex, Delta Force, Coaching…"
          className="flex-1 bg-transparent outline-none text-lg text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
          aria-label="Search boosts"
          aria-autocomplete="list"
          aria-expanded={open}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              onQueryChange("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="cursor-pointer text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
          >
            <X className="size-5" />
          </button>
        )}
        <kbd className="hidden md:inline-flex h-6 px-2 rounded text-[10px] font-mono uppercase tracking-wider bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] text-[var(--color-text-muted)]">
          ⏎
        </kbd>
      </div>

      {open && suggestions.length > 0 && (
        <div
          role="listbox"
          className={cn(
            "absolute left-0 right-0 top-full mt-2 z-30 rounded-2xl overflow-hidden",
            "border border-[var(--color-border-strong)] bg-[var(--color-bg-panel-elevated)]",
            "shadow-[var(--shadow-card)]",
          )}
        >
          {suggestions.map((s, i) => (
            <SuggestionRow
              key={`${s.kind}-${s.value}`}
              suggestion={s}
              active={i === activeIdx}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => commit(s)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function SuggestionRow({
  suggestion,
  active,
  onMouseEnter,
  onClick,
}: {
  suggestion: SearchSuggestion;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  const Icon = iconFor(suggestion.kind);
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 cursor-pointer text-left",
        "border-b border-[var(--color-border-subtle)] last:border-b-0",
        active
          ? "bg-[var(--color-neon-cyan)]/10 text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-panel)]",
      )}
    >
      <span className="grid place-items-center size-9 rounded-md bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]">
        <Icon className="size-4 text-[var(--color-neon-cyan)]" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-base text-[var(--color-text-primary)] truncate">
          {suggestion.label}
        </div>
        <div className="text-xs font-mono uppercase tracking-wider text-[var(--color-text-muted)]">
          {suggestion.kind}
          {suggestion.hint ? ` · ${suggestion.hint}` : ""}
        </div>
      </div>
      <span className="text-[10px] font-mono text-[var(--color-text-muted)]">⏎</span>
    </button>
  );
}

function iconFor(kind: SearchSuggestion["kind"]) {
  switch (kind) {
    case "game":
      return Gamepad2;
    case "service":
      return Tag;
    case "listing":
      return Sparkles;
  }
}
