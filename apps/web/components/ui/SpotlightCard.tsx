"use client";

import { useRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SpotlightCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Spotlight color — defaults to neon cyan. */
  spotlightColor?: string;
  /** Radius of the spotlight in px. */
  radius?: number;
  /**
   * Optional layer rendered behind everything (e.g. a game-themed animated
   * background). When provided, the card surface is made slightly translucent
   * so the backdrop reads through.
   */
  backdrop?: ReactNode;
}

/**
 * SpotlightCard — a premium-feeling card that tracks the cursor and reveals a
 * radial highlight on hover. Inspired by the "Spotlight Card" from React Bits;
 * great for premium accounts, featured boosters, and editor's-pick listings.
 */
export function SpotlightCard({
  children,
  spotlightColor = "oklch(78% 0.18 200 / 25%)",
  radius = 320,
  backdrop,
  className,
  ...rest
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -9999, y: -9999 });
  const [active, setActive] = useState(false);

  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      }}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-card)]",
        "border border-[var(--color-border-subtle)]",
        // Backdrop variant: keep enough opacity so the content stays crisp
        // while the animated layer still shows through.
        backdrop ? "bg-[var(--color-bg-panel)]/82" : "bg-[var(--color-bg-panel)]",
        "transition-colors duration-[var(--duration-normal)]",
        "hover:border-[var(--color-neon-cyan)]/40",
        className,
      )}
      {...rest}
    >
      {/* Game-themed animated layer (if provided) — renders first so DOM
          order keeps content on top. */}
      {backdrop}

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-[var(--duration-normal)]"
        style={{
          opacity: active ? 1 : 0,
          background: `radial-gradient(${radius}px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}, transparent 70%)`,
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
