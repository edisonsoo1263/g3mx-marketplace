"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface StepDef {
  id: string;
  label: string;
}

interface StepperProps {
  steps: StepDef[];
  currentIdx: number;
  onJump: (idx: number) => void;
}

/**
 * Stepper — horizontal step indicator. Completed steps are clickable to go
 * back; future steps are not (validation gates progress forward).
 */
export function Stepper({ steps, currentIdx, onJump }: StepperProps) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      {steps.map((s, i) => {
        const status: "done" | "current" | "upcoming" =
          i < currentIdx ? "done" : i === currentIdx ? "current" : "upcoming";
        return (
          <li key={s.id} className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => status === "done" && onJump(i)}
              disabled={status !== "done"}
              aria-current={status === "current" ? "step" : undefined}
              className={cn(
                "flex items-center gap-2.5 px-3 sm:px-4 h-10 rounded-full border select-none",
                "transition-[border-color,background-color,color,transform] duration-[var(--duration-normal)]",
                status === "done" &&
                  "cursor-pointer border-[var(--color-neon-cyan)]/40 bg-[var(--color-neon-cyan)]/5 text-white hover:-translate-y-0.5",
                status === "current" &&
                  "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/10 text-white shadow-[0_0_24px_oklch(78%_0.18_200/30%)] cursor-default",
                status === "upcoming" &&
                  "border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/40 text-white/50 cursor-not-allowed",
              )}
            >
              <span
                className={cn(
                  "grid place-items-center size-6 rounded-full text-[11px] font-mono font-bold shrink-0",
                  status === "done" && "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]",
                  status === "current" && "bg-white text-[var(--color-text-inverse)]",
                  status === "upcoming" && "bg-[var(--color-bg-panel-elevated)] text-white/60",
                )}
              >
                {status === "done" ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="text-sm font-medium whitespace-nowrap hidden sm:inline">
                {s.label}
              </span>
            </button>
            {i < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "h-px w-6 sm:w-10",
                  i < currentIdx
                    ? "bg-[var(--color-neon-cyan)]/50"
                    : "bg-[var(--color-border-subtle)]",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
