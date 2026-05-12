"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, Trash2, ImagePlus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils/cn";

interface ProfilePhotoUploadProps {
  /** Current avatar URL (could be a remote URL or a freshly-created object URL). */
  value: string | null;
  /** Called with the new object URL after the user picks a file, or null on remove. */
  onChange: (next: string | null) => void;
  /** Seed used to draw a deterministic gradient when no photo is set. */
  fallbackSeed: string;
}

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export function ProfilePhotoUpload({ value, onChange, fallbackSeed }: ProfilePhotoUploadProps) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  // Track object URL so we can revoke it when the component unmounts.
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  function handlePick() {
    inputRef.current?.click();
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    if (!ACCEPTED.includes(file.type)) {
      setError("Unsupported format. Please upload PNG, JPG, or WebP.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("File is too large. Max size is 5 MB.");
      return;
    }
    setError(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    onChange(url);
  }

  function handleRemove() {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    onChange(null);
    setError(null);
  }

  const hue1 = hash(fallbackSeed) % 360;
  const hue2 = (hue1 + 60) % 360;

  return (
    <div className="flex items-start gap-5 flex-wrap">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={handlePick}
          aria-label={t("settings.profile.photo.upload")}
          className={cn(
            "group relative grid place-items-center size-24 md:size-28 rounded-2xl overflow-hidden",
            "border border-[var(--color-border-strong)] bg-[var(--color-bg-panel-elevated)] cursor-pointer",
            "transition-[transform,box-shadow,border-color] duration-[var(--duration-normal)] ease-[var(--ease-out-expo)]",
            "hover:-translate-y-0.5 hover:border-[var(--color-neon-cyan)]",
            "hover:shadow-[0_0_24px_oklch(78%_0.18_200/35%)]",
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="Profile preview"
              className="absolute inset-0 size-full object-cover"
            />
          ) : (
            <span
              aria-hidden
              className="absolute inset-0 grid place-items-center font-display font-black text-4xl text-[var(--color-text-inverse)]"
              style={{
                background: `linear-gradient(135deg, hsl(${hue1} 80% 55%), hsl(${hue2} 90% 60%))`,
              }}
            >
              {fallbackSeed.slice(0, 1).toUpperCase()}
            </span>
          )}
          <span
            className={cn(
              "absolute inset-0 grid place-items-center bg-[var(--color-bg-overlay)]/60 backdrop-blur-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-normal)]",
              "text-white font-medium text-xs gap-1.5",
            )}
          >
            <Camera className="size-5" />
            <span>{t("settings.profile.photo.upload")}</span>
          </span>
        </button>
      </div>

      <div className="flex-1 min-w-[200px] space-y-3">
        <div>
          <div className="text-sm font-semibold text-[var(--color-text-primary)]">
            {t("settings.profile.photo")}
          </div>
          <p className="text-xs text-[var(--color-text-secondary)] mt-1">
            {t("settings.profile.photo.hint")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePick}
            className={cn(
              "inline-flex items-center gap-2 h-9 px-3.5 rounded-full cursor-pointer",
              "text-sm font-medium text-[var(--color-text-primary)]",
              "border border-[var(--color-border-strong)] bg-[var(--color-bg-panel-elevated)]",
              "hover:border-[var(--color-neon-cyan)] hover:text-[var(--color-neon-cyan)] transition-colors",
            )}
          >
            <ImagePlus className="size-4" />
            {t("settings.profile.photo.upload")}
          </button>
          {value && (
            <button
              type="button"
              onClick={handleRemove}
              className={cn(
                "inline-flex items-center gap-2 h-9 px-3.5 rounded-full cursor-pointer",
                "text-sm font-medium text-[var(--color-text-secondary)]",
                "border border-[var(--color-border-subtle)] bg-transparent",
                "hover:border-[var(--color-danger)] hover:text-[var(--color-danger)] transition-colors",
              )}
            >
              <Trash2 className="size-4" />
              {t("settings.profile.photo.remove")}
            </button>
          )}
        </div>

        {error && (
          <p className="text-xs text-[var(--color-danger)]" role="alert">
            {error}
          </p>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="hidden"
        onChange={handleFile}
        aria-hidden
      />
    </div>
  );
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}
