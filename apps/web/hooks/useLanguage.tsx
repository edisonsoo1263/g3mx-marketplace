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
import { translate, type Locale, SUPPORTED_LOCALES } from "@/lib/i18n/translations";

const STORAGE_KEY = "g3mx.locale";
const SUPPORTED_CODES = new Set<Locale>(SUPPORTED_LOCALES.map((l) => l.code));

interface LanguageContextValue {
  locale: Locale;
  setLocale: (next: Locale) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitialLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && SUPPORTED_CODES.has(stored as Locale)) {
      return stored as Locale;
    }
    const nav = window.navigator.language;
    if (nav.toLowerCase().startsWith("zh-tw") || nav.toLowerCase().startsWith("zh-hk")) {
      return "zh-TW";
    }
    if (nav.toLowerCase().startsWith("zh")) {
      return "zh-CN";
    }
  } catch {
    // Ignore — storage may be unavailable in private mode.
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with "en" on the server and the first client render so that
  // hydration markup matches. After mount, switch to the user's saved locale.
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const next = readInitialLocale();
    if (next !== locale) {
      setLocaleState(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Best-effort persistence only.
      }
    }
  }, []);

  const t = useCallback((key: string) => translate(locale, key), [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage must be used inside <LanguageProvider>");
  }
  return ctx;
}
