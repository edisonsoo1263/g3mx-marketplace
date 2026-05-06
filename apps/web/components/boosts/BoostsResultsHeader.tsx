"use client";

import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sortOptions, type SortOption } from "@/lib/data/ranks";
import { cn } from "@/lib/utils/cn";

interface BoostsResultsHeaderProps {
  count: number;
  totalCount: number;
  sort: SortOption;
  onSortChange: (s: SortOption) => void;
}

export function BoostsResultsHeader({
  count,
  totalCount,
  sort,
  onSortChange,
}: BoostsResultsHeaderProps) {
  const activeLabel = sortOptions.find((o) => o.id === sort)?.label ?? "Sort";

  return (
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="text-sm text-[var(--color-text-secondary)]">
        <span className="font-display text-xl font-bold text-[var(--color-text-primary)] mr-1">
          {count}
        </span>
        of <span className="font-mono">{totalCount}</span> boosters match
      </div>

      <SortDropdown value={sort} label={activeLabel} onChange={onSortChange} />
    </div>
  );
}

function SortDropdown({
  value,
  label,
  onChange,
}: {
  value: SortOption;
  label: string;
  onChange: (s: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "inline-flex items-center gap-2 px-3.5 h-10 rounded-full cursor-pointer select-none",
          "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]",
          "text-sm text-[var(--color-text-secondary)]",
          "transition-[border-color,color,box-shadow] duration-[var(--duration-normal)]",
          "hover:border-[var(--color-neon-cyan)]/40 hover:text-[var(--color-text-primary)]",
        )}
      >
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
          Sort
        </span>
        <span>{label}</span>
        <ChevronDown
          className={cn("size-4 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 z-20 min-w-[220px]",
            "rounded-lg overflow-hidden border border-[var(--color-border-strong)]",
            "bg-[var(--color-bg-panel-elevated)] shadow-[var(--shadow-card)]",
          )}
          role="listbox"
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
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-panel)] hover:text-[var(--color-text-primary)]",
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
