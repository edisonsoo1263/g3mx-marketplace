"use client";

import { Check } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/translations";
import { cn } from "@/lib/utils/cn";

export function LanguageSelector() {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
          {t("settings.preferences.language")}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
          {t("settings.preferences.language.hint")}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={t("settings.preferences.language")}
        className="grid grid-cols-1 sm:grid-cols-3 gap-2"
      >
        {SUPPORTED_LOCALES.map((opt) => (
          <LocaleCard
            key={opt.code}
            code={opt.code}
            label={opt.label}
            native={opt.native}
            flag={opt.flag}
            active={opt.code === locale}
            onPick={() => setLocale(opt.code)}
          />
        ))}
      </div>
    </div>
  );
}

function LocaleCard({
  code,
  label,
  native,
  flag,
  active,
  onPick,
}: {
  code: Locale;
  label: string;
  native: string;
  flag: string;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      data-locale={code}
      onClick={onPick}
      className={cn(
        "relative flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-left",
        "border bg-[var(--color-bg-panel-elevated)]/60 transition-[border-color,box-shadow,transform]",
        "duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
        active
          ? "border-[var(--color-neon-cyan)] shadow-[0_0_24px_oklch(78%_0.18_200/30%)]"
          : "border-[var(--color-border-subtle)] hover:border-[var(--color-border-strong)] hover:-translate-y-0.5",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid place-items-center size-10 rounded-lg font-display font-black text-lg shrink-0",
          active
            ? "bg-[var(--color-neon-cyan)] text-[var(--color-text-inverse)]"
            : "bg-[var(--color-bg-panel)] text-[var(--color-text-primary)] border border-[var(--color-border-subtle)]",
        )}
      >
        {flag}
      </span>
      <span className="flex-1 min-w-0 leading-tight">
        <span className="block text-sm font-semibold text-[var(--color-text-primary)]">
          {native}
        </span>
        <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-text-muted)] mt-0.5">
          {label}
        </span>
      </span>
      {active && (
        <Check className="size-4 text-[var(--color-neon-cyan)] shrink-0" aria-hidden />
      )}
    </button>
  );
}
