import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface PixelBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "cyan" | "magenta" | "lime" | "amber" | "neutral";
}

const toneClasses = {
  cyan: "text-[var(--color-neon-cyan)] border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/8",
  magenta: "text-[var(--color-neon-magenta)] border-[var(--color-neon-magenta)]/40 bg-[var(--color-neon-magenta)]/8",
  lime: "text-[var(--color-neon-lime)] border-[var(--color-neon-lime)]/40 bg-[var(--color-neon-lime)]/8",
  amber: "text-[var(--color-neon-amber)] border-[var(--color-neon-amber)]/40 bg-[var(--color-neon-amber)]/8",
  neutral: "text-[var(--color-text-secondary)] border-[var(--color-border-strong)] bg-[var(--color-bg-panel-elevated)]",
} as const;

export function PixelBadge({ children, tone = "cyan", className, ...rest }: PixelBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono uppercase tracking-wider",
        "border-[1.5px] [clip-path:polygon(8%_0,100%_0,100%_60%,92%_100%,0_100%,0_40%)]",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
