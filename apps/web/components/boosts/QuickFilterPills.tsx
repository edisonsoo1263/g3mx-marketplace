"use client";

import { Sparkles, Trophy, Calendar, Users, GraduationCap, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { serviceTypes, type ServiceType } from "@/lib/data/boostListings";

interface QuickFilterPillsProps {
  active: ServiceType | "All";
  onChange: (next: ServiceType | "All") => void;
}

const iconMap: Record<ServiceType | "All", React.ComponentType<{ className?: string }>> = {
  All: Sparkles,
  "Rank Boost": Trophy,
  "Placement Matches": Target,
  Coaching: GraduationCap,
  "Daily Wins": Calendar,
  Achievement: Zap,
  "Win Boost": Users,
};

export function QuickFilterPills({ active, onChange }: QuickFilterPillsProps) {
  const items: Array<ServiceType | "All"> = ["All", ...serviceTypes];

  return (
    <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="flex items-center gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
        {items.map((s) => {
          const Icon = iconMap[s];
          const isActive = s === active;
          return (
            <button
              key={s}
              type="button"
              onClick={() => onChange(s)}
              className={cn(
                "shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-full",
                "text-base font-medium cursor-pointer select-none",
                "border transition-[transform,border-color,background-color,color,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
                "hover:-translate-y-0.5 active:translate-y-0",
                isActive
                  ? "border-[var(--color-neon-magenta)] bg-[var(--color-neon-magenta)]/10 text-[var(--color-text-primary)] shadow-[0_0_24px_oklch(70%_0.28_340/30%)]"
                  : "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60 text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text-primary)]",
              )}
            >
              <Icon
                className={cn(
                  "size-4 transition-colors",
                  isActive
                    ? "text-[var(--color-neon-magenta)]"
                    : "text-[var(--color-text-muted)]",
                )}
              />
              <span>{s}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
