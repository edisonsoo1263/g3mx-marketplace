"use client";

/**
 * GameArt — stylized SVG illustration for each supported title's showcase
 * card. The illustrations are deliberately abstract silhouettes evoking each
 * game's visual identity (logo shapes, characters, architecture, weapons)
 * without copying any trademarked artwork.
 *
 * Each art component fills its container via `preserveAspectRatio="xMidYMid
 * slice"` so the composition reads at any card aspect ratio. All shapes are
 * tinted in the game's accent color at varied opacities to build depth.
 */

interface GameArtProps {
  gameSlug: string;
  accent: string;
  className?: string;
}

export function GameArt({ gameSlug, accent, className }: GameArtProps) {
  switch (gameSlug) {
    case "valorant":
      return <ValorantArt accent={accent} className={className} />;
    case "genshin":
      return <GenshinArt accent={accent} className={className} />;
    case "mlbb":
      return <MlbbArt accent={accent} className={className} />;
    case "lol":
      return <LolArt accent={accent} className={className} />;
    case "wow":
      return <WowArt accent={accent} className={className} />;
    case "csgo":
      return <CsgoArt accent={accent} className={className} />;
    default:
      return null;
  }
}

interface ArtProps {
  accent: string;
  className?: string;
}

const SVG_PROPS = {
  viewBox: "0 0 200 120",
  preserveAspectRatio: "xMidYMid slice" as const,
} as const;

/** Valorant — angular V mark above a jagged city silhouette */
function ValorantArt({ accent, className }: ArtProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      <defs>
        <linearGradient id="val-glow" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {/* City skyline at the bottom */}
      <g fill={accent} opacity="0.4">
        <path d="M0 110 L12 88 L24 95 L36 78 L48 88 L60 75 L74 86 L86 70 L100 80 L114 68 L128 78 L142 72 L158 82 L172 76 L186 84 L200 78 L200 120 L0 120 Z" />
      </g>
      {/* Faint architectural strokes */}
      <g stroke={accent} strokeWidth="0.6" opacity="0.25" fill="none">
        <line x1="20" y1="100" x2="20" y2="115" />
        <line x1="60" y1="92" x2="60" y2="115" />
        <line x1="100" y1="88" x2="100" y2="115" />
        <line x1="140" y1="84" x2="140" y2="115" />
        <line x1="180" y1="86" x2="180" y2="115" />
      </g>
      {/* Big V mark — central, dominant */}
      <g transform="translate(100 60)" filter="drop-shadow(0 4px 16px rgb(0 0 0 / 60%))">
        <path
          d="M -38 -32 L -22 -32 L 0 28 L 22 -32 L 38 -32 L 8 38 L -8 38 Z"
          fill="url(#val-glow)"
        />
        <path
          d="M -22 -32 L -8 -32 L 0 -8 L 8 -32 L 22 -32 L 6 4 L -6 4 Z"
          fill={accent}
          opacity="0.4"
        />
      </g>
      {/* Subtle scan lines */}
      <g opacity="0.08" stroke={accent} strokeWidth="0.5">
        <line x1="0" y1="20" x2="200" y2="20" />
        <line x1="0" y1="40" x2="200" y2="40" />
        <line x1="0" y1="60" x2="200" y2="60" />
      </g>
    </svg>
  );
}

/** Genshin — pagoda + cherry blossom + character profile */
function GenshinArt({ accent, className }: ArtProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      {/* Distant mountain ridge */}
      <g fill={accent} opacity="0.2">
        <path d="M0 90 L40 68 L80 80 L120 60 L160 75 L200 65 L200 120 L0 120 Z" />
      </g>
      {/* Pagoda — right side */}
      <g transform="translate(135 32)" fill={accent} opacity="0.7">
        {/* Roof tiers (top → bottom) */}
        <path d="M 5 8 L 20 -2 L 35 8 L 32 12 L 8 12 Z" />
        <rect x="14" y="12" width="12" height="6" opacity="0.85" />
        <path d="M 0 22 L 20 12 L 40 22 L 36 26 L 4 26 Z" />
        <rect x="10" y="26" width="20" height="8" opacity="0.85" />
        <path d="M -5 38 L 20 26 L 45 38 L 41 42 L -1 42 Z" />
        <rect x="6" y="42" width="28" height="40" opacity="0.85" />
        <rect x="14" y="50" width="4" height="14" fill="rgb(0 0 0 / 50%)" />
        <rect x="22" y="50" width="4" height="14" fill="rgb(0 0 0 / 50%)" />
      </g>
      {/* Cherry blossom branch */}
      <g fill={accent}>
        <path
          d="M 0 30 Q 30 50 70 35 Q 90 28 110 32"
          stroke={accent}
          strokeWidth="1"
          fill="none"
          opacity="0.5"
        />
        {[
          [12, 35, 2],
          [22, 42, 1.6],
          [34, 44, 2.2],
          [48, 40, 1.4],
          [60, 36, 1.8],
          [72, 33, 1.5],
          [86, 30, 2],
          [100, 32, 1.6],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} opacity={0.85} />
        ))}
      </g>
      {/* Character silhouette — left of center, looking right */}
      <g transform="translate(60 35)" fill={accent} opacity="0.85">
        {/* Hair flow */}
        <path d="M -8 -2 Q -12 8 -10 18 L -6 22 L 0 22 L 4 14 L 2 -2 Z" />
        {/* Head */}
        <ellipse cx="0" cy="2" rx="6" ry="7" />
        {/* Body / cloak */}
        <path d="M -8 14 L -2 12 L 6 14 L 12 30 L 10 50 L -10 50 L -14 30 Z" />
        {/* Sword */}
        <path d="M 12 22 L 38 60" stroke={accent} strokeWidth="1.2" />
      </g>
    </svg>
  );
}

/** Mobile Legends — opposing fighter silhouettes facing off across a lane */
function MlbbArt({ accent, className }: ArtProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      {/* Lane / terrain */}
      <g fill={accent} opacity="0.18">
        <path d="M0 100 L40 88 L70 92 L130 92 L160 88 L200 100 L200 120 L0 120 Z" />
      </g>
      {/* Center diamond marker (objective) */}
      <g transform="translate(100 60)" fill={accent}>
        <path d="M 0 -10 L 8 0 L 0 10 L -8 0 Z" opacity="0.55" />
        <path d="M 0 -5 L 4 0 L 0 5 L -4 0 Z" opacity="0.85" />
      </g>
      {/* Left fighter — facing right */}
      <g transform="translate(40 60)" fill={accent}>
        <ellipse cx="0" cy="-12" rx="6" ry="7" opacity="0.85" />
        <path d="M -8 -4 L 8 -4 L 12 14 L 10 32 L -10 32 L -12 14 Z" opacity="0.85" />
        {/* Sword extending right */}
        <path
          d="M 8 -2 L 38 -8"
          stroke={accent}
          strokeWidth="1.4"
          opacity="0.95"
        />
        {/* Cape */}
        <path d="M -8 -4 L -16 8 L -14 24 L -10 16 Z" opacity="0.6" />
      </g>
      {/* Right fighter — mirrored */}
      <g transform="translate(160 60) scale(-1 1)" fill={accent}>
        <ellipse cx="0" cy="-12" rx="6" ry="7" opacity="0.85" />
        <path d="M -8 -4 L 8 -4 L 12 14 L 10 32 L -10 32 L -12 14 Z" opacity="0.85" />
        <path
          d="M 8 -2 L 38 -8"
          stroke={accent}
          strokeWidth="1.4"
          opacity="0.95"
        />
        <path d="M -8 -4 L -16 8 L -14 24 L -10 16 Z" opacity="0.6" />
      </g>
      {/* Energy rings emanating from center diamond */}
      <g fill="none" stroke={accent} opacity="0.25">
        <circle cx="100" cy="60" r="22" />
        <circle cx="100" cy="60" r="35" opacity="0.6" />
      </g>
    </svg>
  );
}

/** League of Legends — armored knight helm with crest */
function LolArt({ accent, className }: ArtProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      {/* Subtle hex pattern hint at bottom */}
      <g fill={accent} opacity="0.18">
        <path d="M 18 100 L 32 92 L 46 100 L 46 116 L 32 124 L 18 116 Z" />
        <path d="M 50 100 L 64 92 L 78 100 L 78 116 L 64 124 L 50 116 Z" />
        <path d="M 154 100 L 168 92 L 182 100 L 182 116 L 168 124 L 154 116 Z" />
        <path d="M 122 100 L 136 92 L 150 100 L 150 116 L 136 124 L 122 116 Z" />
      </g>
      {/* Helmet — central */}
      <g
        transform="translate(100 56)"
        filter="drop-shadow(0 6px 16px rgb(0 0 0 / 60%))"
      >
        {/* Crest plume */}
        <path
          d="M -20 -32 Q -10 -42 0 -38 Q 10 -42 20 -32 L 18 -22 L -18 -22 Z"
          fill={accent}
          opacity="0.95"
        />
        <path
          d="M -14 -22 L 14 -22 L 14 -16 L -14 -16 Z"
          fill={accent}
          opacity="0.6"
        />
        {/* Helmet body */}
        <path
          d="M -22 -16 Q -22 14 -10 24 L 10 24 Q 22 14 22 -16 Z"
          fill={accent}
          opacity="0.85"
        />
        {/* Visor slot */}
        <rect x="-14" y="-4" width="28" height="3" fill="rgb(0 0 0 / 70%)" />
        <rect x="-12" y="4" width="24" height="2" fill="rgb(0 0 0 / 50%)" />
        {/* Cheek guards */}
        <path
          d="M -22 -8 L -28 4 L -22 14 Z"
          fill={accent}
          opacity="0.7"
        />
        <path
          d="M 22 -8 L 28 4 L 22 14 Z"
          fill={accent}
          opacity="0.7"
        />
        {/* Pauldron hint */}
        <path
          d="M -28 24 L -8 24 L -2 36 L -32 36 Z"
          fill={accent}
          opacity="0.55"
        />
        <path
          d="M 8 24 L 28 24 L 32 36 L 2 36 Z"
          fill={accent}
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

/** World of Warcraft — castle with three towers + banner */
function WowArt({ accent, className }: ArtProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      {/* Distant mountain ridge */}
      <g fill={accent} opacity="0.18">
        <path d="M0 96 L30 76 L70 88 L110 70 L150 84 L200 74 L200 120 L0 120 Z" />
      </g>
      {/* Castle keep — central, main */}
      <g fill={accent}>
        {/* Main tower */}
        <rect x="86" y="40" width="28" height="60" opacity="0.85" />
        {/* Crenellations */}
        <path d="M 86 40 L 90 36 L 90 40 L 94 36 L 94 40 L 98 36 L 98 40 L 102 36 L 102 40 L 106 36 L 106 40 L 110 36 L 110 40 L 114 36 L 114 40 Z" opacity="0.85" />
        {/* Roof spire */}
        <path d="M 86 40 L 100 18 L 114 40 Z" opacity="0.95" />
        {/* Banner */}
        <path d="M 100 18 L 100 8 L 116 12 L 100 16 Z" opacity="0.85" />
        {/* Window */}
        <rect x="96" y="60" width="8" height="14" rx="4" fill="rgb(0 0 0 / 70%)" />
      </g>
      {/* Left tower */}
      <g fill={accent} opacity="0.7">
        <rect x="40" y="58" width="20" height="42" />
        <path d="M 40 58 L 43 55 L 43 58 L 47 55 L 47 58 L 51 55 L 51 58 L 55 55 L 55 58 L 59 55 L 59 58 Z" />
        <path d="M 40 58 L 50 42 L 60 58 Z" opacity="0.85" />
        <rect x="46" y="74" width="8" height="12" rx="4" fill="rgb(0 0 0 / 70%)" />
      </g>
      {/* Right tower */}
      <g fill={accent} opacity="0.7">
        <rect x="140" y="58" width="20" height="42" />
        <path d="M 140 58 L 143 55 L 143 58 L 147 55 L 147 58 L 151 55 L 151 58 L 155 55 L 155 58 L 159 55 L 159 58 Z" />
        <path d="M 140 58 L 150 42 L 160 58 Z" opacity="0.85" />
        <rect x="146" y="74" width="8" height="12" rx="4" fill="rgb(0 0 0 / 70%)" />
      </g>
      {/* Connecting walls */}
      <g fill={accent} opacity="0.55">
        <rect x="60" y="80" width="26" height="20" />
        <rect x="114" y="80" width="26" height="20" />
      </g>
    </svg>
  );
}

/** CS2 — tactical operator silhouette in shooting stance with rifle */
function CsgoArt({ accent, className }: ArtProps) {
  return (
    <svg {...SVG_PROPS} className={className}>
      {/* Backdrop crosshair grid */}
      <g stroke={accent} opacity="0.15" strokeWidth="0.6">
        <line x1="0" y1="40" x2="200" y2="40" />
        <line x1="0" y1="80" x2="200" y2="80" />
        <line x1="50" y1="0" x2="50" y2="120" />
        <line x1="100" y1="0" x2="100" y2="120" />
        <line x1="150" y1="0" x2="150" y2="120" />
      </g>
      {/* Distant horizon */}
      <g fill={accent} opacity="0.15">
        <rect x="0" y="100" width="200" height="20" />
      </g>
      {/* Operator silhouette — slightly turned right, lower 1/2 of card */}
      <g
        transform="translate(100 65)"
        fill={accent}
        filter="drop-shadow(0 6px 16px rgb(0 0 0 / 60%))"
      >
        {/* Helmet */}
        <path
          d="M -18 -22 Q -18 -32 -8 -34 L 6 -34 Q 18 -32 18 -20 L 18 -10 L -18 -10 Z"
          opacity="0.9"
        />
        {/* Helmet visor band */}
        <rect x="-16" y="-22" width="34" height="5" fill="rgb(0 0 0 / 60%)" />
        {/* Body / vest */}
        <path
          d="M -22 -10 L 22 -10 L 28 14 L 30 36 L -10 36 L -22 12 Z"
          opacity="0.88"
        />
        {/* Vest pockets */}
        <rect x="-12" y="0" width="10" height="8" fill="rgb(0 0 0 / 45%)" />
        <rect x="2" y="0" width="10" height="8" fill="rgb(0 0 0 / 45%)" />
        {/* Rifle held — extending right */}
        <g transform="translate(0 -2)">
          <rect x="14" y="-3" width="34" height="3" opacity="0.9" />
          <rect x="40" y="-5" width="14" height="2" opacity="0.9" />
          <path d="M 12 -3 L 18 4 L 14 4 L 10 -3 Z" opacity="0.9" />
          <rect x="6" y="-1" width="6" height="4" opacity="0.9" />
        </g>
        {/* Arms holding rifle */}
        <path
          d="M -8 -8 L -14 8 L -10 14 L -2 4 Z"
          opacity="0.7"
        />
        <path
          d="M 8 -8 L 22 -2 L 18 4 L 4 -2 Z"
          opacity="0.85"
        />
      </g>
      {/* Rain streaks */}
      <g stroke={accent} opacity="0.25" strokeWidth="0.6">
        <line x1="20" y1="0" x2="14" y2="20" />
        <line x1="50" y1="0" x2="44" y2="20" />
        <line x1="80" y1="0" x2="74" y2="20" />
        <line x1="160" y1="0" x2="154" y2="20" />
        <line x1="190" y1="0" x2="184" y2="20" />
        <line x1="35" y1="30" x2="29" y2="50" />
        <line x1="170" y1="30" x2="164" y2="50" />
      </g>
    </svg>
  );
}
