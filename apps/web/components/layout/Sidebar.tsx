"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Trophy,
  Users,
  Coins,
  Package,
  ListOrdered,
  Wallet,
  Settings,
  ShieldCheck,
  HelpCircle,
  Sparkles,
  X,
} from "lucide-react";
import { useSidebar } from "@/hooks/useSidebar";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  /** Renders the link in a non-clickable greyed-out "coming soon" state. */
  disabled?: boolean;
  /** Optional sub-label shown below the main label (e.g. "Coming soon"). */
  subLabel?: string;
}

const mainLinks: NavItem[] = [
  { href: "/", label: "Home", icon: Home },
  { href: "/boosts", label: "Boosts", icon: Trophy },
  { href: "/accounts", label: "Accounts", icon: Users, disabled: true, subLabel: "Coming soon" },
  { href: "/topups", label: "Top-ups", icon: Coins, disabled: true, subLabel: "Coming soon" },
];

const profileLinks: NavItem[] = [
  { href: "/account/orders", label: "My Orders", icon: Package, badge: "2" },
  { href: "/account/listings", label: "My Listings", icon: ListOrdered },
  { href: "/account/wallet", label: "Wallet", icon: Wallet },
  { href: "/account/settings", label: "Settings", icon: Settings },
];

const supportLinks: NavItem[] = [
  { href: "/escrow", label: "Escrow & Disputes", icon: ShieldCheck },
  { href: "/help", label: "Help", icon: HelpCircle },
];

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Sidebar() {
  const { open, closeSidebar, collapsed } = useSidebar();
  const { isAuthenticated, loginWithWallet } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // On mobile the drawer is always full width. Collapsed mode only applies on lg+.
  const lgCollapsed = collapsed;

  function handleSellerGateway() {
    closeSidebar();
    if (!isAuthenticated) {
      loginWithWallet()
        .then(() => router.push("/sell/onboarding"))
        .catch(() => undefined);
      return;
    }
    router.push("/sell/onboarding");
  }

  return (
    <>
      {/* Mobile-only backdrop */}
      <div
        aria-hidden
        onClick={closeSidebar}
        className={cn(
          "fixed inset-0 z-40 bg-[var(--color-bg-overlay)] backdrop-blur-sm lg:hidden",
          "transition-opacity duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
      />

      {/* Sidebar — fixed overlay on mobile, sticky in-flow on lg+ */}
      <aside
        aria-label="Primary navigation"
        className={cn(
          "z-50 flex flex-col shrink-0 w-[280px]",
          "bg-[var(--color-bg-panel)] border-r border-[var(--color-border-subtle)]",
          // Mobile: fixed, slides in/out. Always full width.
          "fixed top-0 left-0 h-full",
          "transition-[transform,width] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)] will-change-transform",
          open ? "translate-x-0" : "max-lg:-translate-x-full",
          // Desktop: sticky, always visible. Width animates between expanded/collapsed.
          "lg:sticky lg:top-0 lg:h-screen lg:translate-x-0",
          lgCollapsed ? "lg:w-[80px]" : "lg:w-[280px]",
        )}
      >
        {/* Header: brand mark (+ wordmark when expanded) + mobile close */}
        <div
          className={cn(
            "h-16 flex items-center gap-2 border-b border-[var(--color-border-subtle)] shrink-0",
            lgCollapsed
              ? "lg:px-2 lg:justify-center px-4 justify-between"
              : "px-4 justify-between",
          )}
        >
          <Link
            href="/"
            onClick={closeSidebar}
            aria-label="G3MX home"
            className="flex items-center gap-2.5 cursor-pointer transition-[filter] hover:brightness-110 select-none min-w-0"
          >
            <Image
              src="/brand/g3mx-mark.png"
              alt="G3MX"
              width={612}
              height={408}
              priority
              sizes="48px"
              className={cn(
                "object-contain shrink-0",
                lgCollapsed ? "lg:size-12 size-10" : "size-10",
              )}
            />
            <span
              className={cn(
                "font-display text-xl font-black tracking-tight text-white leading-none",
                lgCollapsed && "lg:hidden",
              )}
            >
              G3MX
            </span>
          </Link>

          {/* Mobile-only close */}
          <button
            type="button"
            onClick={closeSidebar}
            aria-label="Close menu"
            className="lg:hidden cursor-pointer grid place-items-center size-9 rounded-md text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors shrink-0"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 overflow-y-auto space-y-5",
            lgCollapsed ? "lg:p-2 p-3" : "p-3",
          )}
        >
          <NavGroup collapsed={lgCollapsed}>
            {mainLinks.map((l) => (
              <SidebarLink
                key={l.href}
                item={l}
                active={isActive(pathname, l.href)}
                collapsed={lgCollapsed}
                onClick={closeSidebar}
              />
            ))}
          </NavGroup>

          <NavGroup title="Profile" collapsed={lgCollapsed}>
            {profileLinks.map((l) => (
              <SidebarLink
                key={l.href}
                item={l}
                active={isActive(pathname, l.href)}
                collapsed={lgCollapsed}
                onClick={closeSidebar}
              />
            ))}
          </NavGroup>

          <NavGroup title="Support" collapsed={lgCollapsed}>
            {supportLinks.map((l) => (
              <SidebarLink
                key={l.href}
                item={l}
                active={isActive(pathname, l.href)}
                collapsed={lgCollapsed}
                onClick={closeSidebar}
              />
            ))}
          </NavGroup>
        </nav>

        {/* Seller Gateway CTA */}
        <div
          className={cn(
            "border-t border-[var(--color-border-subtle)] shrink-0",
            lgCollapsed ? "lg:p-2 lg:flex lg:justify-center p-4 block" : "p-4",
          )}
        >
          <button
            type="button"
            onClick={handleSellerGateway}
            title={lgCollapsed ? "List Your Service" : undefined}
            className={cn(
              "inline-flex items-center justify-center gap-2 cursor-pointer select-none",
              "font-semibold tracking-tight text-[var(--color-text-inverse)]",
              "bg-[length:200%_100%] bg-[position:0%_50%]",
              "transition-[transform,background-position,box-shadow] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
              "hover:-translate-y-0.5 hover:bg-[position:100%_50%] active:translate-y-0",
              "shadow-[0_0_0_1px_oklch(70%_0.28_340/55%),0_0_24px_oklch(70%_0.28_340/35%)]",
              "hover:shadow-[0_0_0_1px_oklch(78%_0.18_200/55%),0_0_36px_oklch(78%_0.18_200/55%)]",
              // Mobile + expanded desktop: full-width pill
              "h-11 w-full rounded-full text-sm",
              // Desktop collapsed: square button to match the G logo
              lgCollapsed && "lg:size-12 lg:w-12 lg:rounded-xl",
            )}
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--color-neon-magenta), var(--color-neon-violet), var(--color-neon-cyan))",
            }}
          >
            <Sparkles className="size-5 shrink-0" />
            <span className={cn(lgCollapsed && "lg:hidden")}>List Your Service</span>
          </button>
          {!lgCollapsed && (
            <div className="mt-3 text-[10px] font-mono uppercase tracking-[0.2em] text-white text-center">
              G3MX · v0.1.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function NavGroup({
  title,
  collapsed,
  children,
}: {
  title?: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      {title && !collapsed && (
        <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-[0.3em] text-white">
          {title}
        </div>
      )}
      {title && collapsed && (
        <div aria-hidden className="my-2 mx-auto h-px w-8 bg-[var(--color-border-subtle)]" />
      )}
      <ul className="space-y-0.5">{children}</ul>
    </div>
  );
}

function SidebarLink({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  // Disabled "coming soon" — render a non-interactive div with reduced opacity
  if (item.disabled) {
    const tooltip = collapsed
      ? `${item.label}${item.subLabel ? ` · ${item.subLabel}` : ""}`
      : undefined;
    return (
      <li>
        <div
          aria-disabled="true"
          title={tooltip}
          className={cn(
            "relative flex items-center rounded-lg select-none cursor-not-allowed",
            "text-white/40",
            collapsed
              ? "lg:justify-center lg:px-0 lg:py-2.5 gap-3 px-3 py-2.5"
              : "gap-3 px-3 py-2.5",
          )}
        >
          <Icon className="size-5 shrink-0 text-white/30" />
          {!collapsed && (
            <>
              <span className="flex-1 text-base leading-tight">
                {item.label}
                {item.subLabel && (
                  <span className="block text-[11px] font-mono uppercase tracking-wider text-white/30 mt-0.5">
                    {item.subLabel}
                  </span>
                )}
              </span>
            </>
          )}
        </div>
      </li>
    );
  }

  return (
    <li>
      <Link
        href={item.href}
        onClick={onClick}
        title={collapsed ? item.label : undefined}
        className={cn(
          "group relative flex items-center rounded-lg cursor-pointer",
          "transition-colors",
          collapsed
            ? "lg:justify-center lg:px-0 lg:py-2.5 gap-3 px-3 py-2.5"
            : "gap-3 px-3 py-2.5",
          active
            ? "bg-[var(--color-bg-panel-elevated)] text-white"
            : "text-white hover:bg-[var(--color-bg-panel-elevated)]/60",
        )}
      >
        {active && (
          <span
            aria-hidden
            className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[3px] rounded-r-full"
            style={{
              background: "var(--color-neon-cyan)",
              boxShadow: "0 0 12px var(--color-neon-cyan)",
            }}
          />
        )}
        <Icon
          className={cn(
            "size-5 shrink-0 transition-colors",
            active
              ? "text-[var(--color-neon-cyan)]"
              : "text-[var(--color-text-muted)] group-hover:text-[var(--color-neon-cyan)]",
          )}
        />
        <span className={cn("flex-1 text-base", collapsed && "lg:hidden")}>{item.label}</span>
        {item.badge && !collapsed && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[var(--color-neon-cyan)]/15 text-[var(--color-neon-cyan)] border border-[var(--color-neon-cyan)]/30">
            {item.badge}
          </span>
        )}
        {item.badge && collapsed && (
          <span
            aria-hidden
            className="hidden lg:block absolute top-1.5 right-1.5 size-2 rounded-full bg-[var(--color-neon-cyan)]"
            style={{ boxShadow: "0 0 6px var(--color-neon-cyan)" }}
          />
        )}
      </Link>
    </li>
  );
}
