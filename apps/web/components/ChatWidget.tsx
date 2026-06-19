"use client";

import { featureFlags } from "@/lib/featureFlags";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const chatApiUrl =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL || "http://localhost:4100";

const FRONTEND_MAX_WORDS = 100;
const SEND_MAX_WORDS = 80;
const FRONTEND_MAX_CHARS = 900;
const SEND_MAX_CHARS = 700;
const MIN_SUBMIT_INTERVAL_MS = 5000;
const REQUEST_TIMEOUT_MS = 30000;

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
  loading?: boolean;
};

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function limitByWordsAndChars(value: string, maxWords: number, maxChars: number) {
  const charLimited = value.length > maxChars ? value.slice(0, maxChars) : value;
  const words = charLimited.trim().split(/\s+/).filter(Boolean);
  return words.length <= maxWords ? charLimited : words.slice(0, maxWords).join(" ");
}

function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";

  const key = "rangbheeni_chat_session_id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const generated =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `rangbheeni-${Date.now()}-${Math.random().toString(36).slice(2)}`;

  window.localStorage.setItem(key, generated);
  return generated;
}

function LoadingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-label="Loading">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.2s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:-0.1s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
    </span>
  );
}

export function ChatWidget() {
  if (!featureFlags.aiChat) return null;

  if (!featureFlags.aiChat) return null;

  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Hi, I can help with Rangbheeni’s products, stories, events, and collaborations.",
    },
  ]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (open && !pending) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, pending]);

  useEffect(() => {
    if (!open) return;

    window.requestAnimationFrame(() => {
      const el = messagesRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, [messages, open]);

  const canSend = useMemo(() => input.trim().length > 0 && !pending, [input, pending]);

  function applyFrontendLimit(value: string) {
    return limitByWordsAndChars(value, FRONTEND_MAX_WORDS, FRONTEND_MAX_CHARS);
  }

  function handleInput(value: string) {
    setInput(applyFrontendLimit(value));
  }

  function replaceLoadingMessage(text: string) {
    setMessages((current) => {
      const next = [...current];
      let loadingIndex = -1;

      for (let index = next.length - 1; index >= 0; index -= 1) {
        if (next[index]?.role === "assistant" && next[index]?.loading) {
          loadingIndex = index;
          break;
        }
      }

      if (loadingIndex >= 0) {
        next[loadingIndex] = { role: "assistant", text };
        return next;
      }

      return [...next, { role: "assistant", text }];
    });
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();
    if (pending) return;

    const now = Date.now();
    const waitMs = MIN_SUBMIT_INTERVAL_MS - (now - lastSubmitAt);

    if (waitMs > 0) {
      replaceLoadingMessage("Please wait a few seconds before asking another question.");
      return;
    }

    const visibleQuestion = applyFrontendLimit(input);
    const outboundQuestion = normalizeText(
      limitByWordsAndChars(visibleQuestion, SEND_MAX_WORDS, SEND_MAX_CHARS),
    );

    if (!outboundQuestion) return;

    setInput("");
    setPending(true);
    setLastSubmitAt(now);

    setMessages((current) => [
      ...current,
      { role: "user", text: visibleQuestion.trim() },
      { role: "assistant", text: "", loading: true },
    ]);

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

      const response = await fetch(`${chatApiUrl.replace(/\/$/, "")}/chat/message`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: outboundQuestion, sessionId }),
        signal: controller.signal,
      });

      window.clearTimeout(timeout);

      let payload: any = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        replaceLoadingMessage(
          typeof payload?.message === "string"
            ? payload.message
            : "I could not respond right now. Please try again shortly.",
        );
        return;
      }

      replaceLoadingMessage(
        typeof payload?.answer === "string" && payload.answer.trim()
          ? payload.answer.trim()
          : "I do not have that in Rangbheeni’s published information yet.",
      );
    } catch {
      replaceLoadingMessage("I could not respond right now. Please try again shortly.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-14 right-5 z-[80] flex flex-col items-end gap-3">
      {open ? (
        <div className="flex h-[520px] max-h-[calc(100dvh-6rem)] w-[min(92vw,390px)] flex-col overflow-hidden rounded-[1.8rem] border border-[var(--color-primary)]/25 bg-[#f4efe4]/95 shadow-2xl backdrop-blur">
          <div className="shrink-0 border-b border-black/10 bg-white/45 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <p className="font-body text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">
                Rangbheeni assistant
              </p>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full border border-black/10 bg-white/70 font-body text-lg leading-none text-[var(--color-brown)] hover:bg-white"
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          <div
            ref={messagesRef}
            onWheel={(event) => {
              const el = messagesRef.current;
              if (!el) return;
              event.stopPropagation();
              el.scrollTop += event.deltaY;
            }}
            style={{ overflowY: "scroll" }}
            className="min-h-0 flex-1 space-y-3 overscroll-contain px-5 py-4 [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-black/5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[var(--color-primary)]/45"
          >
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={[
                  "break-words rounded-2xl px-4 py-3 font-body text-sm leading-6",
                  message.role === "user"
                    ? "ml-8 bg-[var(--color-lightgreen)]/35 text-[var(--color-brown)]"
                    : "mr-8 bg-white/70 text-neutral-800",
                ].join(" ")}
              >
                {message.loading ? <LoadingDots /> : message.text}
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="shrink-0 border-t border-black/10 bg-white/35 p-4">
            <textarea
              ref={inputRef}
              value={input}
              disabled={pending}
              onChange={(event) => handleInput(event.target.value)}
              onPaste={(event) => {
                event.preventDefault();
                const pasted = event.clipboardData.getData("text");
                const target = event.currentTarget;
                const start = target.selectionStart ?? input.length;
                const end = target.selectionEnd ?? input.length;
                handleInput(`${input.slice(0, start)}${pasted}${input.slice(end)}`);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder={pending ? "" : "Ask a short Rangbheeni-related question..."}
              className="h-20 max-h-20 w-full resize-none overflow-y-auto rounded-2xl border border-black/10 bg-white/75 px-4 py-3 font-body text-sm leading-6 text-[var(--color-brown)] outline-none placeholder:text-neutral-500 focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
            />

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-full border border-[var(--color-primary)]/35 bg-white/80 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!featureFlags.aiChatMaintenance) setOpen(true);
          }}
          disabled={featureFlags.aiChatMaintenance}
          title={featureFlags.aiChatMaintenance ? "Rangbheeni assistant is temporarily unavailable." : "Open chat"}
          className={[
            "relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border border-[var(--color-primary)]/35 bg-[#f4efe4]/95 text-[var(--color-brown)] shadow-xl backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/35 hover:text-[var(--color-primary)]",
            featureFlags.aiChatMaintenance ? "cursor-not-allowed opacity-60 grayscale" : "",
          ].join(" ")}
          aria-label={featureFlags.aiChatMaintenance ? "Chat temporarily unavailable" : "Open chat"}
        >
          <img
            src="/images/rangbheeni.svg"
            alt=""
            aria-hidden="true"
            className="absolute left-[40%] top-[67%] h-14 w-14 -translate-x-1/2 -translate-y-1/2 scale-[4] object-contain"
          />
        </button>
      )}
    </div>
  );
}

export default ChatWidget;
