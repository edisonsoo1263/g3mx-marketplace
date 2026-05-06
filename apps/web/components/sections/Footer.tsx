import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

interface FooterLink {
  href: string;
  label: string;
  disabled?: boolean;
}

interface FooterGroup {
  title: string;
  links: FooterLink[];
}

const groups: FooterGroup[] = [
  {
    title: "Marketplace",
    links: [
      { href: "/boosts", label: "Boosting" },
      { href: "/accounts", label: "Account Trading", disabled: true },
      { href: "/topups", label: "Top-ups", disabled: true },
    ],
  },
  {
    title: "Trust",
    links: [
      { href: "/escrow", label: "Escrow" },
      { href: "/verification", label: "Seller Verification" },
      { href: "/disputes", label: "Disputes" },
      { href: "/security", label: "Security" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/blog", label: "Blog" },
      { href: "/careers", label: "Careers" },
      { href: "/contact", label: "Contact" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)] py-16 mt-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Image
            src="/brand/g3mx-logo.png"
            alt="G3MX"
            width={1536}
            height={1024}
            sizes="180px"
            className="h-14 w-auto select-none"
          />
          <p className="mt-3 text-sm text-[var(--color-text-secondary)] max-w-xs">
            The gamified marketplace for boosting, accounts, and top-ups. Built for crypto-native and
            crypto-curious gamers alike.
          </p>
        </div>
        {groups.map((g) => (
          <div key={g.title}>
            <div className="text-xs font-mono uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
              {g.title}
            </div>
            <ul className="mt-3 space-y-2">
              {g.links.map((l) => (
                <li key={l.href}>
                  {l.disabled ? (
                    <span
                      aria-disabled="true"
                      title="Coming soon"
                      className={cn(
                        "inline-flex items-center gap-2 text-sm text-white/40 cursor-not-allowed select-none",
                      )}
                    >
                      {l.label}
                      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/40">
                        Soon
                      </span>
                    </span>
                  ) : (
                    <Link
                      href={l.href}
                      className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                    >
                      {l.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[var(--color-border-subtle)] text-xs text-[var(--color-text-muted)] flex flex-col sm:flex-row justify-between gap-2">
        <span>© 2026 G3MX Marketplace. Pixels, neon, and on-chain trust.</span>
        <span className="font-mono">v0.1.0 · Build {new Date().getFullYear().toString(36)}</span>
      </div>
    </footer>
  );
}
