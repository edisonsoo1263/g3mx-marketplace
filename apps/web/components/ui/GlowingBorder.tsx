"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

interface GlowingBorderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  rarity?: Rarity;
  /** Animate the border with a slow rotating sheen. */
  animated?: boolean;
}

const rarityVar: Record<Rarity, string> = {
  common: "var(--color-rarity-common)",
  uncommon: "var(--color-rarity-uncommon)",
  rare: "var(--color-rarity-rare)",
  epic: "var(--color-rarity-epic)",
  legendary: "var(--color-rarity-legendary)",
  mythic: "var(--color-rarity-mythic)",
};

/**
 * GlowingBorder — animated rarity-tier conic-gradient border. Used for loot
 * cards, premium accounts, and limited-stock flash deals.
 */
export function GlowingBorder({
  children,
  rarity = "rare",
  animated = true,
  className,
  ...rest
}: GlowingBorderProps) {
  const color = rarityVar[rarity];
  return (
    <div
      className={cn("relative rounded-[var(--radius-card)] p-[1.5px]", className)}
      style={{
        background: animated
          ? `conic-gradient(from 0deg, transparent 0deg, ${color} 90deg, transparent 180deg, ${color} 270deg, transparent 360deg)`
          : `linear-gradient(135deg, ${color}, transparent 60%)`,
        boxShadow: `0 0 24px ${color}33`,
      }}
      {...rest}
    >
      <div
        className="rounded-[calc(var(--radius-card)-1.5px)] bg-[var(--color-bg-panel)] h-full"
      >
        {children}
      </div>
    </div>
  );
}
