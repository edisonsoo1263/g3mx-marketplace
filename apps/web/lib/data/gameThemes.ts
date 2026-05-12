/**
 * Per-game visual themes. Each game gets its own brand-aligned color pair so
 * cards in the marketplace grid actually feel like the game they represent
 * instead of one generic cyan-on-dark tile.
 *
 * Slug must match `public.games.slug` in the Supabase catalogue.
 *
 * `primary` is the main glow/accent (used for borders, initial text, badge).
 * `secondary` pairs with primary in the gradient. Pick something contrasting
 * but on-brand.
 */

export interface GameTheme {
  primary: string;
  secondary: string;
}

const themes: Record<string, GameTheme> = {
  // Tier 1
  valorant: { primary: "#ff4655", secondary: "#0f1923" }, // Valorant red on dark navy
  "league-of-legends": { primary: "#c89b3c", secondary: "#0a1428" }, // Hextech gold + Demacian blue
  cs2: { primary: "#f47521", secondary: "#1a3a52" }, // CS orange + Steel blue
  mlbb: { primary: "#7c3aed", secondary: "#06b6d4" }, // Land of Dawn violet + cyan
  "free-fire": { primary: "#ff6b00", secondary: "#dc2626" }, // Garena orange-red
  "pubg-mobile": { primary: "#f59e0b", secondary: "#1f2937" }, // Frying-pan yellow on tactical grey
  "genshin-impact": { primary: "#3fc7b6", secondary: "#fbbf24" }, // Anemo teal + Geo gold
  "honkai-star-rail": { primary: "#a855f7", secondary: "#06b6d4" }, // Trailblaze violet + cyan

  // Tier 2
  "wild-rift": { primary: "#3b82f6", secondary: "#c89b3c" }, // Rift blue + Hextech gold
  "cod-mobile": { primary: "#10b981", secondary: "#1f2937" }, // Tactical green on dark
  "apex-legends": { primary: "#ef4444", secondary: "#f97316" }, // Legend red + orange
  fortnite: { primary: "#3b82f6", secondary: "#a855f7" }, // Battle bus blue + purple llama
  aov: { primary: "#fbbf24", secondary: "#ef4444" }, // AOV gold + red
  "honor-of-kings": { primary: "#fbbf24", secondary: "#7c3aed" }, // Honor gold + king purple
  "marvel-rivals": { primary: "#dc2626", secondary: "#fbbf24" }, // Comic red + yellow
  "overwatch-2": { primary: "#f97316", secondary: "#1e3a8a" }, // Tracer orange + Overwatch blue
  "fc-26": { primary: "#22c55e", secondary: "#06b6d4" }, // Pitch green + EA cyan
  "dota-2": { primary: "#a31818", secondary: "#363636" }, // Dire red on Radiant grey

  // Tier 3
  wow: { primary: "#f0a83a", secondary: "#b91c1c" }, // Horde gold + red
  ffxiv: { primary: "#5c8fbf", secondary: "#f0a83a" }, // Eorzea blue + crystal gold
  "lost-ark": { primary: "#fbbf24", secondary: "#7f1d1d" }, // Ark gold + crimson
  "poe-2": { primary: "#8b4513", secondary: "#d4af37" }, // Exile bronze + gold
  "diablo-4": { primary: "#dc2626", secondary: "#1a0a0a" }, // Hell red on black
  warzone: { primary: "#f97316", secondary: "#1f2937" }, // Gulag orange + tactical grey
  "r6-siege": { primary: "#1a1a1a", secondary: "#f0a83a" }, // Siege black + ace gold
  "rocket-league": { primary: "#3b82f6", secondary: "#f97316" }, // Octane blue + orange
  coc: { primary: "#fbbf24", secondary: "#ef4444" }, // Town hall gold + barbarian red
  "clash-royale": { primary: "#3b82f6", secondary: "#fbbf24" }, // Arena blue + crown gold
  "brawl-stars": { primary: "#fbbf24", secondary: "#7c3aed" }, // Star yellow + showdown purple
  "identity-v": { primary: "#a855f7", secondary: "#0f0f0f" }, // Manor purple on shadow black
  "pokemon-unite": { primary: "#fde047", secondary: "#ef4444" }, // Pikachu yellow + pokeball red
  "pokemon-go": { primary: "#ef4444", secondary: "#3b82f6" }, // Valor red + Mystic blue
  roblox: { primary: "#e21b1b", secondary: "#232527" }, // Roblox red on dark
  minecraft: { primary: "#22c55e", secondary: "#92400e" }, // Grass green + dirt brown
  "gta-5": { primary: "#ec4899", secondary: "#06b6d4" }, // Vice City pink + cyan
  "new-world": { primary: "#fbbf24", secondary: "#16a34a" }, // Aeternum gold + green
  bdo: { primary: "#a78bfa", secondary: "#fbbf24" }, // Pearl purple + gold
  wuwa: { primary: "#3fc7b6", secondary: "#f0a83a" }, // Resonance teal + gold
  zzz: { primary: "#fbbf24", secondary: "#ef4444" }, // Cunning Hares yellow + red
};

// Fallback by category — keeps unmapped games (e.g. new additions via admin)
// from defaulting to bland cyan-only.
const CATEGORY_FALLBACK: Record<string, GameTheme> = {
  FPS: { primary: "#ef4444", secondary: "#1f2937" },
  MOBA: { primary: "#a855f7", secondary: "#06b6d4" },
  Gacha: { primary: "#fbbf24", secondary: "#a855f7" },
  MMORPG: { primary: "#f0a83a", secondary: "#7f1d1d" },
  "Battle Royale": { primary: "#f97316", secondary: "#1f2937" },
  Sports: { primary: "#22c55e", secondary: "#06b6d4" },
  Card: { primary: "#3b82f6", secondary: "#fbbf24" },
  Sandbox: { primary: "#22c55e", secondary: "#92400e" },
  Strategy: { primary: "#fbbf24", secondary: "#ef4444" },
  Survival: { primary: "#a855f7", secondary: "#0f0f0f" },
  Action: { primary: "#ec4899", secondary: "#06b6d4" },
  AR: { primary: "#ef4444", secondary: "#3b82f6" },
};

const DEFAULT_THEME: GameTheme = {
  primary: "#00f0ff",
  secondary: "#7c3aed",
};

export function getGameTheme(slug: string, category?: string): GameTheme {
  return themes[slug] ?? (category ? CATEGORY_FALLBACK[category] : null) ?? DEFAULT_THEME;
}
