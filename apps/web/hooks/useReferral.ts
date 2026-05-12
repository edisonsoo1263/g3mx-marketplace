"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "g3mx_ref_code";

/**
 * Reads the captured referral handle (the user who invited the current
 * visitor) from localStorage. Persists across tabs via the storage event.
 *
 * The capture happens in `/app/ref/[handle]/page.tsx` when a visitor lands
 * on a referral link. Once a backend exists this will be reconciled into a
 * server-side referrer→referee mapping; for now it lives client-side.
 */
export function useReferral(): string | null {
  const [refCode, setRefCode] = useState<string | null>(null);

  useEffect(() => {
    try {
      setRefCode(localStorage.getItem(STORAGE_KEY));
    } catch {
      // ignore — privacy mode / disabled storage
    }

    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) setRefCode(e.newValue);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return refCode;
}

export function setReferral(handle: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, handle);
    document.cookie = `g3mx_ref=${handle}; max-age=${60 * 60 * 24 * 30}; path=/; SameSite=Lax`;
  } catch {
    // ignore
  }
}

export function clearReferral(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    document.cookie = "g3mx_ref=; max-age=0; path=/; SameSite=Lax";
  } catch {
    // ignore
  }
}
