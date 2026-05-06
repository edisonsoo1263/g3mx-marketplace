"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface BentoGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

interface BentoCellProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Grid column span at md+ breakpoint. */
  colSpan?: 1 | 2 | 3 | 4;
  /** Grid row span at md+ breakpoint. */
  rowSpan?: 1 | 2;
}

const colSpanClasses = {
  1: "md:col-span-1",
  2: "md:col-span-2",
  3: "md:col-span-3",
  4: "md:col-span-4",
} as const;

const rowSpanClasses = {
  1: "md:row-span-1",
  2: "md:row-span-2",
} as const;

/**
 * BentoGrid — asymmetric featured grid. 4-column responsive layout with
 * cells that can span multiple columns/rows for editorial feel.
 */
export function BentoGrid({ children, className, ...rest }: BentoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-5",
        "auto-rows-[minmax(180px,auto)]",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function BentoCell({
  children,
  colSpan = 1,
  rowSpan = 1,
  className,
  ...rest
}: BentoCellProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[var(--radius-card)]",
        "border border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-panel)]",
        "transition-all duration-[var(--duration-normal)]",
        "hover:border-[var(--color-neon-cyan)]/50 hover:translate-y-[-2px]",
        colSpanClasses[colSpan],
        rowSpanClasses[rowSpan],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
