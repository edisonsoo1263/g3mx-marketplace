"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  /** True while the assistant is still streaming this turn. */
  streaming?: boolean;
  /** True when this turn ended in an error — UI may style differently. */
  error?: boolean;
}

export interface ChatMetadata {
  /** Identifier for the logged-in user (Privy user id), if any. */
  user_id?: string;
  /** Connected wallet address, if any. */
  wallet_address?: string;
}

interface UseChatOptions {
  /**
   * Read fresh on every send so metadata stays accurate as the user navigates
   * pages or signs in/out mid-conversation.
   */
  getMetadata?: () => ChatMetadata;
}

interface UseChatReturn {
  messages: ChatMsg[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  clear: () => void;
}

const STORAGE_KEY = "g3mx_chat_history";
const MAX_TURNS = 20;
const MAX_INPUT_CHARS = 4000;

function uid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * useChat — client-side conversation state for the support chatbot.
 *
 * - Persists the last MAX_TURNS messages to localStorage so refresh keeps history
 * - Streams the assistant response from /api/chat as plain UTF-8 chunks
 * - Optimistically appends an empty assistant message and progressively fills
 *   it as bytes arrive; the UI renders this with a typing cursor
 */
export function useChat(options?: UseChatOptions): UseChatReturn {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const getMetadataRef = useRef(options?.getMetadata);
  getMetadataRef.current = options?.getMetadata;

  // Hydrate from localStorage on mount (SSR-safe — runs only after hydration)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setMessages(
          (parsed as ChatMsg[])
            .filter((m) => m && typeof m.content === "string")
            .map((m) => ({ ...m, streaming: false })) // never persist a streaming flag
            .slice(-MAX_TURNS),
        );
      }
    } catch {
      // bad JSON — ignore
    }
  }, []);

  // Persist on every change (skip while streaming to avoid quota churn)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (messages.some((m) => m.streaming)) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      // localStorage may be full
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (raw: string) => {
      const text = raw.trim().slice(0, MAX_INPUT_CHARS);
      if (!text || isLoading) return;

      const userMsg: ChatMsg = {
        id: uid(),
        role: "user",
        content: text,
        createdAt: Date.now(),
      };
      const assistantId = uid();
      const assistantMsg: ChatMsg = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: Date.now(),
        streaming: true,
      };

      // Capture pre-send history so the request body uses a stable snapshot.
      const history = messages
        .filter((m) => !m.error) // don't replay error placeholders
        .slice(-MAX_TURNS);

      setMessages([...history, userMsg, assistantMsg]);
      setIsLoading(true);
      setError(null);

      const controller = new AbortController();
      abortRef.current = controller;

      // Auto-attach metadata so the AI can include the user's current page,
      // identity, and wallet when filing an issue report — read fresh on every
      // send so navigation between pages updates the URL.
      const userMeta = getMetadataRef.current?.() ?? {};
      const metadata = {
        url:
          typeof window !== "undefined" ? window.location.href : undefined,
        ...userMeta,
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...history, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
            metadata,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          let errMsg = `Request failed (${res.status})`;
          try {
            const data = (await res.json()) as { error?: string };
            if (data.error) errMsg = data.error;
          } catch {
            // not JSON
          }
          throw new Error(errMsg);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let acc = "";
        // eslint-disable-next-line no-constant-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: acc } : m,
            ),
          );
        }

        // Final flush + clear streaming flag
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: acc, streaming: false }
              : m,
          ),
        );
      } catch (e) {
        const aborted =
          e instanceof DOMException && e.name === "AbortError";
        const msg = aborted
          ? "Stopped."
          : e instanceof Error
            ? e.message
            : "Something went wrong.";
        setError(aborted ? null : msg);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: aborted
                    ? m.content || "(stopped)"
                    : `${msg} If this keeps happening, email support@g3mx.xyz.`,
                  streaming: false,
                  error: !aborted,
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [messages, isLoading],
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError(null);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  }, []);

  return { messages, sendMessage, isLoading, clear, error };
}
