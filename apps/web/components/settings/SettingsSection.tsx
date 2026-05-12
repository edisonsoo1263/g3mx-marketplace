"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

interface SettingsSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  subtitle,
  icon,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "rounded-[var(--radius-card)] border border-[var(--color-border-subtle)]",
        "bg-[var(--color-bg-panel)]/60 backdrop-blur-md",
        "p-5 md:p-7 space-y-5",
        className,
      )}
    >
      <header className="flex items-start gap-3">
        {icon && (
          <span
            className={cn(
              "grid place-items-center size-10 rounded-xl shrink-0",
              "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]",
              "text-[var(--color-neon-cyan)]",
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="font-display text-xl md:text-2xl font-bold text-[var(--color-text-primary)] leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
          )}
        </div>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}
