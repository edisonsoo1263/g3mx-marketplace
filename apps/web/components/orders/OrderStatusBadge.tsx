import { cn } from "@/lib/utils/cn";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/data/orders";

const TONE_CLASS: Record<string, string> = {
  amber:
    "border-[var(--color-neon-amber)]/40 bg-[var(--color-neon-amber)]/10 text-[var(--color-neon-amber)]",
  cyan: "border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/10 text-[var(--color-neon-cyan)]",
  violet:
    "border-[var(--color-neon-violet)]/40 bg-[var(--color-neon-violet)]/10 text-[var(--color-neon-violet)]",
  success:
    "border-[var(--color-success)]/40 bg-[var(--color-success)]/10 text-[var(--color-success)]",
  danger:
    "border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 text-[var(--color-danger)]",
  muted: "border-white/15 bg-white/5 text-white/60",
};

interface Props {
  status: OrderStatus;
  /** Show a pulsing dot for live statuses (in_progress / pending). */
  pulse?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function OrderStatusBadge({ status, pulse, size = "md", className }: Props) {
  const meta = ORDER_STATUS_META[status];
  const tone = TONE_CLASS[meta.tone];
  const showPulse =
    pulse ?? (status === "in_progress" || status === "pending");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono uppercase tracking-[0.18em]",
        size === "sm"
          ? "h-5 px-2 text-[9px]"
          : "h-6 px-2.5 text-[10px]",
        tone,
        className,
      )}
      aria-label={`Status: ${meta.label}`}
    >
      {showPulse && (
        <span
          aria-hidden
          className="size-1.5 rounded-full"
          style={{
            backgroundColor: meta.color,
            boxShadow: `0 0 6px ${meta.color}`,
            animation: "pulse-glow 1.8s ease-out infinite",
          }}
        />
      )}
      {meta.label}
    </span>
  );
}
