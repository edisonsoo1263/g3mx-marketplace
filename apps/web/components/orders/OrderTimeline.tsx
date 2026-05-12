import {
  Check,
  Clock,
  Flag,
  ShieldAlert,
  Sparkles,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  formatRelativeTime,
  type OrderTimelineEvent,
  type OrderTimelineType,
} from "@/lib/data/orders";

const ICON_MAP: Record<OrderTimelineType, LucideIcon> = {
  placed: Flag,
  accepted: Check,
  started: Sparkles,
  milestone: Sparkles,
  review_pending: Clock,
  completed: Check,
  disputed: ShieldAlert,
  message: Clock,
  refunded: XCircle,
  cancelled: XCircle,
};

const ACCENT: Record<OrderTimelineType, string> = {
  placed: "var(--color-neon-cyan)",
  accepted: "var(--color-neon-cyan)",
  started: "var(--color-neon-magenta)",
  milestone: "var(--color-neon-amber)",
  review_pending: "var(--color-neon-violet)",
  completed: "var(--color-success)",
  disputed: "var(--color-danger)",
  message: "var(--color-neon-cyan)",
  refunded: "var(--color-text-muted, oklch(60% 0 0))",
  cancelled: "var(--color-text-muted, oklch(60% 0 0))",
};

interface Props {
  events: OrderTimelineEvent[];
  className?: string;
}

export function OrderTimeline({ events, className }: Props) {
  if (events.length === 0) {
    return (
      <div className={cn("text-xs text-white/50", className)}>
        No activity yet.
      </div>
    );
  }

  // Newest first reads better in detail panels
  const sorted = [...events].sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );

  return (
    <ol className={cn("relative space-y-4", className)}>
      <span
        aria-hidden
        className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--color-border-subtle)]"
      />
      {sorted.map((evt, idx) => {
        const Icon = ICON_MAP[evt.type] ?? Sparkles;
        const accent = ACCENT[evt.type];
        const isLatest = idx === 0;
        return (
          <li key={evt.id} className="relative pl-8">
            <span
              aria-hidden
              className={cn(
                "absolute left-0 top-0.5 grid place-items-center size-[22px] rounded-full",
                "border bg-[var(--color-bg-panel)]",
              )}
              style={{
                borderColor: accent,
                boxShadow: isLatest ? `0 0 12px ${accent}` : undefined,
              }}
            >
              <Icon className="size-3" style={{ color: accent }} />
            </span>
            <div className="leading-tight">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-semibold text-white">
                  {evt.title}
                </span>
                <span className="text-[10px] font-mono text-white/40 shrink-0">
                  {formatRelativeTime(evt.at)}
                </span>
              </div>
              {evt.detail && (
                <div className="mt-1 text-xs text-white/65 leading-relaxed">
                  {evt.detail}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
