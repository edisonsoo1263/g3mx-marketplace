"use client";

import { Bot, User, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { ChatMsg } from "@/hooks/useChat";

interface ChatMessageProps {
  message: ChatMsg;
}

/**
 * ChatMessage — single message bubble. User messages anchor right with cyan
 * accent; assistant messages anchor left with neutral panel surface. Errors
 * get a magenta tint + alert icon.
 */
export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-2 items-start",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <Avatar role={message.role} error={message.error} />

      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          "whitespace-pre-wrap break-words",
          isUser
            ? "bg-[var(--color-neon-cyan)]/15 border border-[var(--color-neon-cyan)]/35 text-white rounded-tr-sm"
            : message.error
              ? "bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/35 text-white/90 rounded-tl-sm"
              : "bg-[var(--color-bg-panel-elevated)] border border-[var(--color-border-subtle)] text-white/90 rounded-tl-sm",
        )}
      >
        {message.content || (
          <span className="inline-flex items-center gap-1 text-white/55">
            <span className="size-1.5 rounded-full bg-current animate-pulse" />
            <span
              className="size-1.5 rounded-full bg-current animate-pulse"
              style={{ animationDelay: "120ms" }}
            />
            <span
              className="size-1.5 rounded-full bg-current animate-pulse"
              style={{ animationDelay: "240ms" }}
            />
          </span>
        )}
        {message.streaming && message.content && (
          <span
            aria-hidden
            className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-[var(--color-neon-cyan)] animate-pulse"
          />
        )}
      </div>
    </div>
  );
}

function Avatar({
  role,
  error,
}: {
  role: "user" | "assistant";
  error?: boolean;
}) {
  if (role === "user") {
    return (
      <span
        aria-hidden
        className="grid place-items-center size-7 rounded-full bg-gradient-to-br from-[var(--color-neon-cyan)] to-[var(--color-neon-magenta)] shrink-0"
      >
        <User className="size-3.5 text-[var(--color-text-inverse)]" />
      </span>
    );
  }
  return (
    <span
      aria-hidden
      className={cn(
        "grid place-items-center size-7 rounded-full shrink-0 border",
        error
          ? "bg-[var(--color-danger)]/15 border-[var(--color-danger)]/40 text-[var(--color-danger)]"
          : "bg-[var(--color-bg-panel)] border-[var(--color-border-subtle)] text-[var(--color-neon-cyan)]",
      )}
    >
      {error ? <AlertCircle className="size-3.5" /> : <Bot className="size-3.5" />}
    </span>
  );
}
