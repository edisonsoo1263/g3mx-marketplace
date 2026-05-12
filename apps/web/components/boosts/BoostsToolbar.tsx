"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Sliders, ChevronDown } from "lucide-react";
import { BorderBeam } from "border-beam";
import { cn } from "@/lib/utils/cn";
import { serviceTypes, type ServiceType } from "@/lib/data/boostListings";
import { sortOptions, type SortOption } from "@/lib/data/ranks";

interface BoostsToolbarProps {
  query: string;
  onQueryChange: (q: string) => void;
  serviceFilter: ServiceType | "All";
  onServiceFilterChange: (s: ServiceType | "All") => void;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
  onCustomize: () => void;
  resultCount: number;
  totalCount: number;
}

/**
 * BoostsToolbar — sticky unified filter bar combining search, service-type
 * pills, sort dropdown, and the "Customize" trigger that opens the configurator
 * drawer. Replaces the old triple stack of HeroSearch + QuickFilterPills +
 * BoostsResultsHeader.
 */
export function BoostsToolbar({
  query,
  onQueryChange,
  serviceFilter,
  onServiceFilterChange,
  sort,
  onSortChange,
  onCustomize,
  resultCount,
  totalCount,
}: BoostsToolbarProps) {
  const services: Array<ServiceType | "All"> = ["All", ...serviceTypes];

  return (
    <div
      className={cn(
        "sticky top-16 z-30",
        "border-y border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-deep)]/85 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-3">
        {/* Row 1: search + customize + sort */}
        <div className="flex items-center gap-2 sm:gap-3">
          <SearchInput value={query} onChange={onQueryChange} />

          <button
            type="button"
            onClick={onCustomize}
            className={cn(
              "shrink-0 inline-flex items-center gap-2 h-10 px-3.5 rounded-full",
              "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60",
              "text-sm font-medium text-white cursor-pointer select-none",
              "transition-[border-color,background-color,transform] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
              "hover:-translate-y-0.5 hover:border-[var(--color-neon-cyan)]/50 hover:text-[var(--color-neon-cyan)]",
            )}
            aria-label="Open boost configurator"
          >
            <Sliders className="size-4" />
            <span className="hidden md:inline">Customize</span>
          </button>

          <SortDropdown value={sort} onChange={onSortChange} />
        </div>

        {/* Row 2: service-type pills + result count */}
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0 overflow-x-auto -mx-1 px-1">
            <div className="flex items-center gap-1.5 min-w-max">
              {services.map((s) => (
                <ServicePill
                  key={s}
                  label={s}
                  active={serviceFilter === s}
                  onClick={() => onServiceFilterChange(s)}
                />
              ))}
            </div>
          </div>
          <span className="hidden sm:inline shrink-0 text-xs font-mono text-white/55 tabular-nums">
            <span className="text-white font-bold">{resultCount}</span>
            <span className="text-white/40"> / {totalCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Search input ──────────────────────────────────────────────

function SearchInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <BorderBeam size="md" colorVariant="colorful" theme="dark" strength={0.6} className="block flex-1 min-w-0">
      <label
        className={cn(
          "flex items-center gap-2 h-10 px-3.5 rounded-full",
          "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60",
          "transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
          "focus-within:border-[var(--color-neon-cyan)] focus-within:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
        )}
      >
        <Search className="size-4 text-white/55 shrink-0" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search boosters, services, ranks…"
          className="flex-1 min-w-0 bg-transparent outline-none text-sm text-white placeholder:text-white/45"
          aria-label="Search boosts"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="cursor-pointer text-white/55 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
      </label>
    </BorderBeam>
  );
}

// ── Service-type pill ─────────────────────────────────────────

function ServicePill({
  label,
  active,
  onClick,
}: {
  label: ServiceType | "All";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 inline-flex items-center h-8 px-3.5 rounded-full",
        "text-xs font-medium cursor-pointer select-none whitespace-nowrap",
        "border transition-[border-color,background-color,color,transform] duration-150",
        "hover:-translate-y-0.5",
        active
          ? "border-[var(--color-neon-magenta)] bg-[var(--color-neon-magenta)]/10 text-white shadow-[0_0_16px_oklch(70%_0.28_340/30%)]"
          : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 text-white/70 hover:text-white hover:border-[var(--color-border-strong)]",
      )}
    >
      {label}
    </button>
  );
}

// ── Sort dropdown ─────────────────────────────────────────────

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (s: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeLabel = sortOptions.find((o) => o.id === value)?.label ?? "Sort";

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function escHandler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("mousedown", handler);
    window.addEventListener("keydown", escHandler);
    return () => {
      window.removeEventListener("mousedown", handler);
      window.removeEventListener("keydown", escHandler);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 h-10 px-3.5 rounded-full cursor-pointer select-none",
          "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60",
          "text-sm text-white",
          "transition-[border-color,box-shadow,transform] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
          "hover:-translate-y-0.5 hover:border-[var(--color-neon-cyan)]/50",
        )}
        aria-expanded={open}
      >
        <span className="hidden md:inline text-[10px] font-mono uppercase tracking-[0.2em] text-white/55">
          Sort
        </span>
        <span className="hidden sm:inline">{activeLabel}</span>
        <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          role="listbox"
          className={cn(
            "absolute right-0 top-full mt-2 z-40 min-w-[220px]",
            "rounded-xl overflow-hidden border border-[var(--color-border-strong)]",
            "bg-[var(--color-bg-panel-elevated)] shadow-[var(--shadow-card)]",
          )}
        >
          {sortOptions.map((o) => {
            const active = o.id === value;
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => {
                  onChange(o.id);
                  setOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3.5 py-2.5 text-sm cursor-pointer",
                  "flex items-center justify-between gap-3",
                  active
                    ? "bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)]"
                    : "text-white/85 hover:bg-[var(--color-bg-panel)] hover:text-white",
                )}
              >
                <span>{o.label}</span>
                {active && <span aria-hidden>●</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
