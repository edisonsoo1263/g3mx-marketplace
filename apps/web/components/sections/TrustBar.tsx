import { ShieldCheck, Lock, Headset, Sparkles } from "lucide-react";

const items = [
  { icon: ShieldCheck, label: "Escrow Protected", sub: "Crypto + card" },
  { icon: Lock, label: "Verified Boosters", sub: "ID + KYC checked" },
  { icon: Headset, label: "24/7 Support", sub: "Live chat in <2 min" },
  { icon: Sparkles, label: "Loot rewards", sub: "Earn XP every order" },
];

export function TrustBar() {
  return (
    <section className="relative py-12 border-y border-[var(--color-border-subtle)] bg-[var(--color-bg-deep)]/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
        {items.map(({ icon: Icon, label, sub }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="grid place-items-center size-10 rounded-md bg-[var(--color-bg-panel)] border border-[var(--color-border-subtle)]">
              <Icon className="size-5 text-[var(--color-neon-cyan)]" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-[var(--color-text-primary)]">{label}</div>
              <div className="text-xs text-[var(--color-text-muted)]">{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
