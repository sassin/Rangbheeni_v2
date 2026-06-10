"use client";

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

function limitByWordsAndChars(
  value: string,
  maxWords: number,
  maxChars: number,
) {
  const charLimited = value.length > maxChars ? value.slice(0, maxChars) : value;
  const words = charLimited.trim().split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return charLimited;
  }

  return words.slice(0, maxWords).join(" ");
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

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Ask about Rangbheeni’s work, products, events, stories, or collaborations.",
    },
  ]);

  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    setSessionId(getOrCreateSessionId());
  }, []);

  useEffect(() => {
    if (open && !pending) {
      window.setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open, pending]);

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

      const response = await fetch(
        `${chatApiUrl.replace(/\/$/, "")}/chat/message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: outboundQuestion,
            sessionId,
          }),
          signal: controller.signal,
        },
      );

      window.clearTimeout(timeout);

      let payload: any = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const message =
          typeof payload?.message === "string"
            ? payload.message
            : "I could not prepare a response right now. Please try again shortly.";

        replaceLoadingMessage(message);
        return;
      }

      const answer =
        typeof payload?.answer === "string" && payload.answer.trim()
          ? payload.answer.trim()
          : "I do not have that information in Rangbheeni’s published content.";

      replaceLoadingMessage(answer);
    } catch {
      replaceLoadingMessage(
        "I could not prepare a response right now. Please try again shortly.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-8 right-5 z-[80] flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[min(92vw,390px)] overflow-hidden rounded-[1.8rem] border border-[var(--color-primary)]/25 bg-[#f4efe4]/95 shadow-2xl backdrop-blur">
          <div className="border-b border-black/10 bg-white/45 px-5 py-4">
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

          <div className="max-h-[390px] space-y-3 overflow-y-auto px-5 py-4">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={[
                  "rounded-2xl px-4 py-3 font-body text-sm leading-6",
                  message.role === "user"
                    ? "ml-8 bg-[var(--color-lightgreen)]/35 text-[var(--color-brown)]"
                    : "mr-8 bg-white/70 text-neutral-800",
                ].join(" ")}
              >
                {message.loading ? <LoadingDots /> : message.text}
              </div>
            ))}
          </div>

          <form onSubmit={submit} className="border-t border-black/10 bg-white/35 p-4">
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
                const next = `${input.slice(0, start)}${pasted}${input.slice(end)}`;
                handleInput(next);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit();
                }
              }}
              placeholder={pending ? "" : "Ask a short Rangbheeni-related question..."}
              className="min-h-[86px] w-full resize-none rounded-2xl border border-black/10 bg-white/75 px-4 py-3 font-body text-sm leading-6 text-[var(--color-brown)] outline-none placeholder:text-neutral-500 focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
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
          onClick={() => setOpen(true)}
          className="grid h-14 w-14 place-items-center rounded-full border border-[var(--color-primary)]/35 bg-[#f4efe4]/95 text-[var(--color-brown)] shadow-xl backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/35 hover:text-[var(--color-primary)]"
          aria-label="Open chat"
        >
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M5.5 18.2c-1.2-1.2-1.9-2.8-1.9-4.6 0-4 3.7-7.2 8.4-7.2s8.4 3.2 8.4 7.2-3.7 7.2-8.4 7.2c-.9 0-1.8-.1-2.6-.4L5 21l.5-2.8Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M8.4 13.1h.01M12 13.1h.01M15.6 13.1h.01"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
}


