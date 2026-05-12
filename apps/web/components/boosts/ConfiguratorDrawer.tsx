"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ConfiguratorDrawerProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/**
 * ConfiguratorDrawer — slide-in panel that hosts the BoostConfigurator. On
 * desktop it slides in from the right (560px wide); on mobile it covers the
 * full viewport. Backdrop click + Esc close. Body scroll locked while open.
 */
export function ConfiguratorDrawer({ open, onClose, children }: ConfiguratorDrawerProps) {
  const reduced = useReducedMotion();

  // Esc closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[var(--color-bg-overlay)] backdrop-blur-sm"
            aria-hidden
          />

          {/* Drawer panel */}
          <motion.aside
            key="drawer"
            role="dialog"
            aria-label="Boost configurator"
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: "100%" }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, x: "100%" }}
            transition={{
              duration: reduced ? 0.15 : 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={cn(
              "fixed top-0 right-0 z-50 h-full w-full sm:w-[560px] lg:w-[600px]",
              "bg-[var(--color-bg-panel)] border-l border-[var(--color-border-subtle)]",
              "shadow-[-12px_0_48px_rgb(0_0_0_/_60%)]",
              "flex flex-col",
            )}
          >
            <header className="px-5 h-16 flex items-center justify-between border-b border-[var(--color-border-subtle)] shrink-0 bg-[var(--color-bg-deep)]/40">
              <div className="leading-tight">
                <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/55">
                  Configurator
                </div>
                <div className="text-base font-semibold text-white">
                  Customize your boost
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close configurator"
                className="grid place-items-center size-9 rounded-md cursor-pointer text-white/70 hover:text-white hover:bg-[var(--color-bg-panel-elevated)] transition-colors"
              >
                <X className="size-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-5 py-6">{children}</div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
