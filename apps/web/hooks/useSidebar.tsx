"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface SidebarContextValue {
  /** Mobile overlay drawer is open. Only meaningful below the lg breakpoint. */
  open: boolean;
  /** Desktop persistent rail is collapsed to icon-only. Persisted across sessions. */
  collapsed: boolean;
  /** Mobile-aware: opens drawer on mobile, no-op on desktop. */
  toggle: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleCollapsed: () => void;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

const STORAGE_KEY = "g3mx_sidebar_collapsed";

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsedState] = useState(false);

  // Restore persisted desktop collapsed state on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setCollapsedState(true);
    } catch {
      // localStorage unavailable — fall back to default
    }
  }, []);

  const setCollapsed = useCallback((v: boolean) => {
    setCollapsedState(v);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(v));
    } catch {
      // ignore
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsedState((c) => {
      const next = !c;
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const openSidebar = useCallback(() => setOpen(true), []);
  const closeSidebar = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);

  // Esc closes the mobile drawer
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const value = useMemo(
    () => ({
      open,
      collapsed,
      toggle,
      openSidebar,
      closeSidebar,
      toggleCollapsed,
      setCollapsed,
    }),
    [open, collapsed, toggle, openSidebar, closeSidebar, toggleCollapsed, setCollapsed],
  );

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>;
}

export function useSidebar(): SidebarContextValue {
  const ctx = useContext(SidebarContext);
  if (!ctx) throw new Error("useSidebar must be used inside <SidebarProvider>");
  return ctx;
}
