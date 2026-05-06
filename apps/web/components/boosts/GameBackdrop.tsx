"use client";

import { cn } from "@/lib/utils/cn";
import { games } from "@/lib/data/catalog";

interface GameBackdropProps {
  gameSlug: string;
  className?: string;
}

/**
 * GameBackdrop — game-themed animated background for listing cards.
 *
 * Each game gets visual signatures, not just a color tint:
 *   • Valorant — tactical crosshair grid + drifting triangular spike icons + scan beam
 *   • LoL     — hextech hexagon-with-diamond grid + slow conic gold sweep
 *   • CS2     — crosshair + diagonal bullet-trace streaks
 *   • Genshin — twinkling 4-point sparkles + drifting primogem rhombuses
 *   • MLBB    — concentric skill-ring pattern + diagonal speed lines
 *   • WoW     — runic circle glyph grid + drifting blue mist particles
 *
 * Renders are CSS-only (no JS frame loop, no images), respect
 * prefers-reduced-motion globally.
 */
export function GameBackdrop({ gameSlug, className }: GameBackdropProps) {
  const game = games.find((g) => g.slug === gameSlug);
  if (!game) return null;
  const accent = game.accent;

  return (
    <div
      aria-hidden
      className={cn("absolute inset-0 overflow-hidden", className)}
    >
      <BaseGlow accent={accent} />

      {gameSlug === "valorant" && <ValorantLayer accent={accent} />}
      {gameSlug === "lol" && <LolLayer accent={accent} />}
      {gameSlug === "csgo" && <CsgoLayer accent={accent} />}
      {gameSlug === "genshin" && <GenshinLayer accent={accent} />}
      {gameSlug === "mlbb" && <MlbbLayer accent={accent} />}
      {gameSlug === "wow" && <WowLayer accent={accent} />}

      <Vignette />
    </div>
  );
}

// ── Shared ────────────────────────────────────────────────────

function BaseGlow({ accent }: { accent: string }) {
  return (
    <>
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background: `radial-gradient(circle at 30% 80%, ${accent}, transparent 65%)`,
          animation: "game-pulse 6s ease-in-out infinite",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `radial-gradient(circle at 75% 15%, ${accent}, transparent 55%)`,
          animation: "game-pulse 8s ease-in-out infinite reverse",
          animationDelay: "-2s",
        }}
      />
    </>
  );
}

function Vignette() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "linear-gradient(to bottom, oklch(15% 0 0 / 30%) 0%, oklch(15% 0 0 / 70%) 100%)",
      }}
    />
  );
}

// ── Per-game layers ───────────────────────────────────────────

/** Valorant — tactical FPS: crosshair grid + drifting spike triangles + scan */
function ValorantLayer({ accent }: { accent: string }) {
  const stroke = encodeURIComponent(accent);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40' fill='none' stroke='${stroke}' stroke-width='1.2' stroke-linecap='round'>
    <line x1='20' y1='5' x2='20' y2='14'/>
    <line x1='20' y1='26' x2='20' y2='35'/>
    <line x1='5' y1='20' x2='14' y2='20'/>
    <line x1='26' y1='20' x2='35' y2='20'/>
    <circle cx='20' cy='20' r='1.5' fill='${stroke}'/>
  </svg>`;
  return (
    <>
      <PatternTile svg={svg} size={36} opacity={0.22} />
      <DriftingMotifs accent={accent} count={3} kind="spike" />
      <ScanBeam accent={accent} duration={6} />
    </>
  );
}

/** League of Legends — hextech: hex with inner diamond + conic gold sweep */
function LolLayer({ accent }: { accent: string }) {
  const stroke = encodeURIComponent(accent);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 52' fill='none' stroke='${stroke}' stroke-width='1'>
    <path d='M30 1L59 17v18L30 51L1 35V17L30 1z' opacity='0.55'/>
    <path d='M30 18L40 26L30 34L20 26z' opacity='0.75'/>
    <circle cx='30' cy='26' r='2' fill='${stroke}' opacity='0.9'/>
  </svg>`;
  return (
    <>
      <PatternTile svg={svg} size={42} sizeY={36.4} opacity={0.18} />
      <ConicSweep accent={accent} duration={20} />
    </>
  );
}

/** CS2 — tactical: crosshair grid + horizontal bullet-trace streaks */
function CsgoLayer({ accent }: { accent: string }) {
  const stroke = encodeURIComponent(accent);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' fill='none' stroke='${stroke}' stroke-width='1.2' stroke-linecap='round'>
    <line x1='16' y1='5' x2='16' y2='12'/>
    <line x1='16' y1='20' x2='16' y2='27'/>
    <line x1='5' y1='16' x2='12' y2='16'/>
    <line x1='20' y1='16' x2='27' y2='16'/>
  </svg>`;
  return (
    <>
      <PatternTile svg={svg} size={28} opacity={0.22} />
      <BulletTraces accent={accent} />
    </>
  );
}

/** Genshin — magical wish: twinkling 4-point sparkles + drifting primogems */
function GenshinLayer({ accent }: { accent: string }) {
  return (
    <>
      <SparkleField accent={accent} count={6} />
      <DriftingMotifs accent={accent} count={3} kind="primogem" />
    </>
  );
}

/** Mobile Legends — MOBA action: concentric skill-ring grid + speed lines */
function MlbbLayer({ accent }: { accent: string }) {
  const stroke = encodeURIComponent(accent);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 44 44' fill='none' stroke='${stroke}' stroke-width='1'>
    <circle cx='22' cy='22' r='14' opacity='0.5'/>
    <circle cx='22' cy='22' r='8' opacity='0.4'/>
    <circle cx='22' cy='22' r='2' fill='${stroke}' opacity='0.9'/>
    <line x1='22' y1='4' x2='22' y2='10' opacity='0.6'/>
    <line x1='22' y1='34' x2='22' y2='40' opacity='0.6'/>
    <line x1='4' y1='22' x2='10' y2='22' opacity='0.6'/>
    <line x1='34' y1='22' x2='40' y2='22' opacity='0.6'/>
  </svg>`;
  return (
    <>
      <PatternTile svg={svg} size={38} opacity={0.2} />
      <SpeedLines accent={accent} />
    </>
  );
}

/** WoW — fantasy: runic glyph circles + drifting mist particles */
function WowLayer({ accent }: { accent: string }) {
  const stroke = encodeURIComponent(accent);
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' fill='none' stroke='${stroke}' stroke-width='1'>
    <circle cx='24' cy='24' r='14' opacity='0.55'/>
    <path d='M24 10 L24 38 M10 24 L38 24 M14 14 L34 34 M34 14 L14 34' opacity='0.35'/>
    <circle cx='24' cy='24' r='4' opacity='0.8'/>
    <circle cx='24' cy='24' r='1.5' fill='${stroke}' opacity='0.9'/>
  </svg>`;
  return (
    <>
      <PatternTile svg={svg} size={44} opacity={0.18} />
      <MistParticles accent={accent} count={6} />
    </>
  );
}

// ── Pattern primitives ────────────────────────────────────────

interface PatternTileProps {
  svg: string;
  /** Tile width in px. */
  size: number;
  /** Tile height in px (defaults to `size` for square tiles). */
  sizeY?: number;
  opacity: number;
}

function PatternTile({ svg, size, sizeY, opacity }: PatternTileProps) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity,
        backgroundImage: `url("data:image/svg+xml;utf8,${svg}")`,
        backgroundSize: `${size}px ${sizeY ?? size}px`,
        maskImage: "radial-gradient(ellipse at center, black 35%, transparent 92%)",
        WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 92%)",
      }}
    />
  );
}

function ScanBeam({ accent, duration }: { accent: string; duration: number }) {
  return (
    <div
      className="absolute inset-x-0 h-16"
      style={{
        background: `linear-gradient(to bottom, transparent 0%, ${accent}55 50%, transparent 100%)`,
        animation: `game-scan ${duration}s linear infinite`,
        filter: "blur(4px)",
        mixBlendMode: "screen",
      }}
    />
  );
}

function ConicSweep({ accent, duration }: { accent: string; duration: number }) {
  return (
    <div
      className="absolute -inset-1/4"
      style={{
        background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, ${accent}33 60deg, transparent 120deg, transparent 360deg)`,
        animation: `game-conic-spin ${duration}s linear infinite`,
        opacity: 0.35,
      }}
    />
  );
}

function SpeedLines({ accent }: { accent: string }) {
  return (
    <div
      className="absolute inset-0"
      style={{
        opacity: 0.3,
        backgroundImage: `repeating-linear-gradient(115deg, ${accent}66 0px, ${accent}66 2px, transparent 2px, transparent 22px)`,
        backgroundSize: "80px 80px",
        animation: "game-wave-slide 8s linear infinite",
        maskImage:
          "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
      }}
    />
  );
}

function BulletTraces({ accent }: { accent: string }) {
  return (
    <>
      {[
        { top: "22%", duration: 3.2, delay: 0 },
        { top: "55%", duration: 4.1, delay: -1.4 },
        { top: "78%", duration: 3.6, delay: -2.5 },
      ].map((t, i) => (
        <span
          key={i}
          className="absolute inset-x-0 h-px"
          style={{
            top: t.top,
            background: `linear-gradient(to right, transparent 0%, ${accent}cc 50%, transparent 100%)`,
            boxShadow: `0 0 8px ${accent}aa`,
            width: "60%",
            animation: `game-trace-streak ${t.duration}s linear infinite`,
            animationDelay: `${t.delay}s`,
          }}
        />
      ))}
    </>
  );
}

function SparkleField({ accent, count }: { accent: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 53 + 9) % 96;
        const top = (i * 37 + 13) % 88;
        const size = 8 + ((i * 5) % 8);
        const duration = 3 + (i % 3);
        const delay = -(i * 0.7);
        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${left}%`,
              top: `${top}%`,
              width: `${size}px`,
              height: `${size}px`,
              animation: `game-sparkle-twinkle ${duration}s ease-in-out infinite`,
              animationDelay: `${delay}s`,
            }}
          >
            <Sparkle accent={accent} />
          </span>
        );
      })}
    </>
  );
}

function Sparkle({ accent }: { accent: string }) {
  // 4-point star — wider on the cross, tapering to the diagonals
  return (
    <svg viewBox="0 0 40 40" className="size-full">
      <path
        d="M20 0 L23 17 L40 20 L23 23 L20 40 L17 23 L0 20 L17 17 Z"
        fill={accent}
        opacity="0.9"
      >
        <animate
          attributeName="opacity"
          values="0.4;1;0.4"
          dur="3s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

function MistParticles({ accent, count }: { accent: string; count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 41 + 7) % 100;
        const size = 4 + ((i * 5) % 4);
        const duration = 14 + (i % 5) * 2;
        const delay = -((i * 2.3) % 12);
        return (
          <span
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${left}%`,
              bottom: "-5%",
              width: `${size}px`,
              height: `${size}px`,
              background: accent,
              boxShadow: `0 0 10px ${accent}`,
              animation: `game-particle-drift ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
    </>
  );
}

interface DriftingMotifsProps {
  accent: string;
  count: number;
  kind: "spike" | "primogem";
}

/**
 * Game-iconic drifting elements. Spikes are triangular wedges (Valorant);
 * primogems are rotated rhombuses (Genshin).
 */
function DriftingMotifs({ accent, count, kind }: DriftingMotifsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const left = (i * 67 + 13) % 90;
        const size = 14 + ((i * 9) % 10);
        const duration = 11 + (i % 4) * 2;
        const delay = -((i * 2.1) % 10);
        return (
          <span
            key={i}
            className="absolute"
            style={{
              left: `${left}%`,
              bottom: "-5%",
              width: `${size}px`,
              height: `${size}px`,
              animation: `game-motif-drift ${duration}s linear infinite`,
              animationDelay: `${delay}s`,
              filter: `drop-shadow(0 0 6px ${accent}88)`,
            }}
          >
            {kind === "spike" ? <SpikeIcon accent={accent} /> : <PrimogemIcon accent={accent} />}
          </span>
        );
      })}
    </>
  );
}

function SpikeIcon({ accent }: { accent: string }) {
  // Triangular wedge with a vertical body — evokes the Valorant spike silhouette
  return (
    <svg viewBox="0 0 24 36" className="size-full" fill="none">
      <path
        d="M12 0 L20 14 L20 30 L12 36 L4 30 L4 14 Z"
        stroke={accent}
        strokeWidth="1.5"
        opacity="0.9"
      />
      <path
        d="M12 6 L16 14 L12 22 L8 14 Z"
        fill={accent}
        opacity="0.6"
      />
    </svg>
  );
}

function PrimogemIcon({ accent }: { accent: string }) {
  // Rotated rhombus with inner facet — Genshin primogem shorthand
  return (
    <svg viewBox="0 0 24 30" className="size-full" fill="none">
      <path
        d="M12 0 L24 12 L12 30 L0 12 Z"
        stroke={accent}
        strokeWidth="1.5"
        opacity="0.9"
        fill={accent}
        fillOpacity="0.15"
      />
      <path d="M12 5 L18 12 L12 22 L6 12 Z" fill={accent} opacity="0.45" />
    </svg>
  );
}
