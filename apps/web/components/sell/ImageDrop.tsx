"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ImageDropProps {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  /** Max accepted size in bytes. Default 5MB. */
  maxBytes?: number;
}

const ACCEPT = ["image/png", "image/jpeg", "image/webp", "image/avif"];

/**
 * ImageDrop — drag/drop or click-to-browse cover image picker. Reads the file
 * into a data URL for local preview. The seller backend will swap this for a
 * real CDN upload when wired up.
 */
export function ImageDrop({ value, onChange, maxBytes = 5 * 1024 * 1024 }: ImageDropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  function ingest(file: File | undefined | null) {
    setError(null);
    if (!file) return;
    if (!ACCEPT.includes(file.type)) {
      setError("Use PNG, JPG, WEBP, or AVIF.");
      return;
    }
    if (file.size > maxBytes) {
      setError(`File too large. Max ${(maxBytes / 1024 / 1024).toFixed(0)}MB.`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : null;
      onChange(dataUrl);
    };
    reader.onerror = () => setError("Could not read that file. Try another.");
    reader.readAsDataURL(file);
  }

  function clear() {
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor="cover-image"
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          ingest(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          "relative block rounded-2xl overflow-hidden cursor-pointer select-none",
          "border-2 border-dashed transition-[border-color,background-color,box-shadow]",
          dragOver
            ? "border-[var(--color-neon-cyan)] bg-[var(--color-neon-cyan)]/5 shadow-[0_0_0_4px_oklch(78%_0.18_200/15%)]"
            : value
            ? "border-[var(--color-border-strong)]"
            : "border-[var(--color-border-strong)] hover:border-[var(--color-neon-cyan)]/60",
        )}
        aria-label="Upload cover image"
      >
        <input
          ref={inputRef}
          id="cover-image"
          type="file"
          accept={ACCEPT.join(",")}
          onChange={(e) => ingest(e.target.files?.[0])}
          className="sr-only"
        />

        {value ? (
          <>
            <div className="relative w-full aspect-[16/9] bg-[var(--color-bg-deep)]">
              <Image
                src={value}
                alt="Cover preview"
                fill
                className="object-cover"
                unoptimized // data URLs aren't routed through the optimizer
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg-deep)]/90 via-transparent to-transparent"
              />
            </div>
            <div className="absolute bottom-3 left-3 text-xs font-mono uppercase tracking-[0.2em] text-white/80">
              Cover preview
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                clear();
              }}
              aria-label="Remove image"
              className="absolute top-3 right-3 grid place-items-center size-9 rounded-full bg-[var(--color-bg-deep)]/80 backdrop-blur text-white border border-white/20 cursor-pointer hover:bg-[var(--color-bg-deep)] hover:border-[var(--color-danger)] transition-colors"
            >
              <X className="size-4" />
            </button>
          </>
        ) : (
          <div className="aspect-[16/9] flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid place-items-center size-12 rounded-xl bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)]">
              <ImagePlus className="size-5 text-[var(--color-neon-cyan)]" />
            </span>
            <div>
              <div className="text-base font-semibold text-white">
                Drag &amp; drop a cover image
              </div>
              <div className="text-xs text-white/60 mt-1">
                or click to browse · PNG, JPG, WEBP up to{" "}
                {(maxBytes / 1024 / 1024).toFixed(0)}MB
              </div>
              <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 mt-2">
                16:9 recommended
              </div>
            </div>
          </div>
        )}
      </label>

      {error && (
        <div className="flex items-center gap-2 text-xs text-[var(--color-danger)]">
          <AlertCircle className="size-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
