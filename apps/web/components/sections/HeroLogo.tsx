"use client";

import { cn } from "@/lib/utils/cn";

interface HeroLogoProps {
  className?: string;
}

/**
 * HeroLogo — pure SVG rendering of the G3MX wordmark.
 *
 * Layers (back → front):
 *   1. Three subtle extrusion shadows in deep violets → fakes 3D depth
 *   2. Two RGB-shifted glitch ghosts (cyan left, magenta right) at low alpha
 *   3. Front face filled with a horizontal cyan → violet → magenta gradient
 *      and wrapped in a triple-blur glow filter for the neon halo
 *
 * The whole element is responsive via viewBox + width="100%" — drop it into
 * any container and it scales. Honors prefers-reduced-motion through the
 * wrapper class (`hero-logo-pulse` in Hero.tsx).
 */
export function HeroLogo({ className }: HeroLogoProps) {
  return (
    <svg
      viewBox="0 0 800 220"
      preserveAspectRatio="xMidYMid meet"
      className={cn("w-full max-w-[760px] h-auto block mx-auto", className)}
      role="img"
      aria-label="G3MX"
    >
      <defs>
        {/* Horizontal duotone fill — cyan to magenta, violet pivot in the middle */}
        <linearGradient id="g3mx-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#00f0ff" />
          <stop offset="48%" stopColor="#a046d4" />
          <stop offset="100%" stopColor="#ff2bd6" />
        </linearGradient>

        {/* Multi-pass outer glow for the neon halo */}
        <filter
          id="g3mx-glow"
          x="-25%"
          y="-60%"
          width="150%"
          height="220%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="b2" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b3" />
          <feMerge>
            <feMergeNode in="b3" />
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 3D extrusion behind the front face */}
      <g aria-hidden="true">
        {EXTRUSIONS.map(({ dx, dy, fill }) => (
          <text
            key={`${dx}-${dy}`}
            {...textProps}
            x={400 + dx}
            y={110 + dy}
            fill={fill}
          >
            G3MX
          </text>
        ))}
      </g>

      {/* Glitch RGB-shift ghosts */}
      <g aria-hidden="true" opacity="0.55">
        <text {...textProps} x={394} y={110} fill="#00f0ff">
          G3MX
        </text>
        <text {...textProps} x={406} y={110} fill="#ff2bd6">
          G3MX
        </text>
      </g>

      {/* Front face — gradient + glow */}
      <text
        {...textProps}
        x={400}
        y={110}
        fill="url(#g3mx-fill)"
        filter="url(#g3mx-glow)"
      >
        G3MX
      </text>
    </svg>
  );
}

const textProps = {
  textAnchor: "middle" as const,
  dominantBaseline: "middle" as const,
  fontFamily: "var(--font-display-google), 'Space Grotesk', sans-serif",
  fontWeight: 900,
  fontSize: 180,
  letterSpacing: -8,
};

// Extrusion stack — each pushes the shadow down-right and darkens slightly.
// Fewer layers reads cleaner than a heavy stack for a neon aesthetic.
const EXTRUSIONS: Array<{ dx: number; dy: number; fill: string }> = [
  { dx: 6, dy: 6, fill: "#1a0828" },
  { dx: 4, dy: 4, fill: "#2a0e3e" },
  { dx: 2, dy: 2, fill: "#3a1454" },
];
