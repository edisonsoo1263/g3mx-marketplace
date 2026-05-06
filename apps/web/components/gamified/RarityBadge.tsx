import type { Rarity } from "@/components/ui/GlowingBorder";
import { cn } from "@/lib/utils/cn";

interface RarityBadgeProps {
  rarity: Rarity;
  className?: string;
}

const labelMap: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
  mythic: "Mythic",
};

const colorVar: Record<Rarity, string> = {
  common: "var(--color-rarity-common)",
  uncommon: "var(--color-rarity-uncommon)",
  rare: "var(--color-rarity-rare)",
  epic: "var(--color-rarity-epic)",
  legendary: "var(--color-rarity-legendary)",
  mythic: "var(--color-rarity-mythic)",
};

export function RarityBadge({ rarity, className }: RarityBadgeProps) {
  const color = colorVar[rarity];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.2em] rounded",
        className,
      )}
      style={{
        color,
        background: `${color}1a`,
        border: `1px solid ${color}55`,
      }}
    >
      <span
        aria-hidden
        className="size-1.5 rounded-full"
        style={{ background: color, boxShadow: `0 0 8px ${color}` }}
      />
      {labelMap[rarity]}
    </span>
  );
}
