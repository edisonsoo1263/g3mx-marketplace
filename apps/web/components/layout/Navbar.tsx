"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { BorderBeam } from "border-beam";
import { useAuth } from "@/hooks/useAuth";
import { useSidebar } from "@/hooks/useSidebar";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils/cn";

export function Navbar() {
  const { user, isReady, isAuthenticated, loginWithWallet, logout } = useAuth();
  const { toggle: toggleSidebar, collapsed, toggleCollapsed } = useSidebar();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        return;
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/boosts?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-[var(--color-bg-deep)]/70 border-b border-[var(--color-border-subtle)]">
      <div className="px-3 sm:px-6 h-16 flex items-center gap-3">
        {/* Mobile: open drawer */}
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Open menu"
          className={cn(
            "lg:hidden cursor-pointer grid place-items-center size-10 rounded-md shrink-0",
            "text-white/70 hover:text-[var(--color-neon-cyan)]",
            "hover:bg-[var(--color-bg-panel)] transition-colors",
          )}
        >
          <Menu className="size-5" />
        </button>

        {/* Desktop: collapse / expand sidebar */}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-pressed={collapsed}
          title={collapsed ? "Expand" : "Collapse"}
          className={cn(
            "hidden lg:grid place-items-center size-10 rounded-lg shrink-0 cursor-pointer",
            "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60",
            "text-white/80 hover:text-[var(--color-neon-cyan)]",
            "hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-panel)] transition-colors",
          )}
        >
          {collapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </button>

        {/* Search */}
        <form onSubmit={onSubmit} className="flex-1 max-w-2xl" role="search">
          <BorderBeam size="md" colorVariant="colorful" theme="dark" className="block">
            <label
              className={cn(
                "flex items-center gap-2.5 h-10 px-3.5 rounded-full",
                "border border-[var(--color-border-subtle)] bg-[var(--color-bg-panel)]/60",
                "transition-[border-color,box-shadow] duration-[var(--duration-normal)]",
                "focus-within:border-[var(--color-neon-cyan)] focus-within:shadow-[0_0_0_3px_oklch(78%_0.18_200/15%)]",
              )}
            >
              <Search className="size-4 text-white/50 shrink-0" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search games, boosts, accounts…"
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/50"
                aria-label="Search"
              />
              <kbd
                aria-hidden="true"
                className={cn(
                  "hidden sm:inline-flex items-center justify-center shrink-0",
                  "h-7 min-w-[2.25rem] px-2 rounded-md leading-none",
                  "text-[11px] font-semibold font-mono uppercase tracking-wider",
                  "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] text-white/70",
                )}
              >
                ⌘K
              </kbd>
            </label>
          </BorderBeam>
        </form>

        {/* Right side: auth */}
        <div className="ml-auto flex items-center gap-2 shrink-0">
          {!isReady ? (
            <div className="size-9 rounded-full bg-[var(--color-bg-panel)] animate-pulse" />
          ) : isAuthenticated && user ? (
            <UserMenu user={user} onLogout={() => logout()} />
          ) : (
            <LoginButton onClick={() => loginWithWallet().catch(() => undefined)} />
          )}
        </div>
      </div>
    </header>
  );
}

/**
 * Log in button — wraps a solid pill in `BorderBeam` so the animated beam
 * provides the rainbow border. The static gradient border was replaced with
 * the beam to avoid stacking two color rings.
 */
function LoginButton({ onClick }: { onClick: () => void }) {
  return (
    <BorderBeam
      size="sm"
      colorVariant="colorful"
      theme="dark"
      strength={0.9}
      className={cn(
        "inline-flex cursor-pointer select-none rounded-full",
        "transition-transform duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        "hover:-translate-y-0.5 active:translate-y-0",
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="px-5 h-9 rounded-full bg-[var(--color-bg-deep)] text-white text-sm font-semibold tracking-tight cursor-pointer"
      >
        Log in
      </button>
    </BorderBeam>
  );
}
