# Game card artwork

Drop landscape images here named after each game's slug. The `GameShowcase`
component on `/boosts` will pick them up automatically and replace the SVG
fallback.

## Required filenames

| Slug | Recommended file |
|------|------------------|
| `valorant` | `valorant.png` (or .jpg / .webp) |
| `genshin` | `genshin.png` |
| `mlbb` | `mlbb.png` |
| `lol` | `lol.png` |
| `wow` | `wow.png` |
| `csgo` | `csgo.png` |

## Wiring the file to a game

Open `apps/web/lib/data/catalog.ts` and add the `cardImage` field to the
matching game entry:

```ts
{
  slug: "valorant",
  name: "Valorant",
  region: "GLOBAL",
  publisher: "Riot Games",
  accent: "#ff4655",
  cardImage: "/games/valorant.png",   // ← add this
}
```

## Recommended image specs

- **Aspect ratio:** 5:3 (landscape) — matches the card frame exactly
- **Resolution:** at least 600×360, ideally 1000×600 for retina
- **Format:** WEBP for best compression, PNG/JPG also fine
- **Color treatment:** doesn't matter — the card applies a heavy multiply
  tint in the game's accent color over the image, so even a desaturated or
  off-color source ends up looking on-brand
- **Composition:** center the subject (character / logo / scene). The card
  has a bottom-up dark gradient that covers the lower 30% for label
  legibility, so don't put critical detail there.

## Licensing reminder

Don't ship copyrighted game artwork in production. Use:

- Officially licensed press kits from each game's publisher
- Original concept art / commissioned illustrations
- AI-generated themed art with proper licensing
- Royalty-free stock matching each game's vibe

Until you have artwork in place, the page falls back to the stylized
SVG illustrations in `components/boosts/GameArt.tsx` — no broken images.
