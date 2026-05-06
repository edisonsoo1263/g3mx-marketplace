"use client";

import { forwardRef, type ButtonHTMLAttributes } from "react";
import { BorderBeam } from "border-beam";
import { cn } from "@/lib/utils/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  /** Disable the animated border-beam wrapper. Defaults to false (beam on). */
  noBeam?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)] " +
    "shadow-[var(--shadow-glow-cyan)] focus-visible:ring-[var(--color-neon-cyan)] " +
    "hover:bg-[var(--color-brand-hover)] hover:shadow-[0_0_0_1px_var(--color-neon-cyan),0_0_36px_oklch(78%_0.18_200/65%)]",
  secondary:
    "bg-[var(--color-bg-panel-elevated)] text-[var(--color-text-primary)] " +
    "border border-[var(--color-border-strong)] " +
    "hover:border-[var(--color-neon-cyan)] hover:bg-[var(--color-bg-panel)] " +
    "hover:text-[var(--color-neon-cyan)] hover:shadow-[0_0_24px_oklch(78%_0.18_200/30%)]",
  ghost:
    "bg-transparent text-[var(--color-text-primary)] " +
    "hover:bg-[var(--color-bg-panel)] hover:text-[var(--color-neon-cyan)]",
  danger:
    "bg-[var(--color-danger)] text-[var(--color-text-primary)] " +
    "hover:opacity-90 hover:shadow-[0_0_24px_oklch(65%_0.24_25/40%)]",
};

const sizeClasses: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

// Hover/press transforms live on the wrapper so the beam moves with the button.
const wrapperMotion =
  "inline-flex cursor-pointer transition-transform duration-[var(--duration-normal)] " +
  "ease-[var(--ease-out-expo)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, noBeam, ...rest },
  ref,
) {
  const isDisabled = disabled || loading;

  const buttonElement = (
    <button
      ref={ref}
      disabled={isDisabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-pill)] w-full",
        "font-medium tracking-tight cursor-pointer select-none",
        "transition-[box-shadow,background-color,border-color,color,opacity] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        "focus-visible:ring-offset-[var(--color-bg-deep)]",
        "disabled:opacity-60 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
      )}
      {...rest}
    >
      {loading ? (
        <span className="size-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : null}
      {children}
    </button>
  );

  // Ghost variant has no visible border surface — beam would float around nothing.
  if (noBeam || variant === "ghost") {
    return (
      <span className={cn(wrapperMotion, className)}>
        {buttonElement}
      </span>
    );
  }

  return (
    <BorderBeam
      size="sm"
      colorVariant="colorful"
      theme="dark"
      active={!isDisabled}
      strength={0.85}
      className={cn(wrapperMotion, className)}
    >
      {buttonElement}
    </BorderBeam>
  );
});
