"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

const chatApiUrl =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL || "http://localhost:4100";

const FRONTEND_MAX_WORDS = 100;
const SEND_MAX_WORDS = 80;
const FRONTEND_MAX_CHARS = 900;
const SEND_MAX_CHARS = 700;
const MIN_SUBMIT_INTERVAL_MS = 5000;

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
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
  const words = normalizeText(charLimited).split(/\s+/).filter(Boolean);

  if (words.length <= maxWords) {
    return normalizeText(charLimited);
  }

  return words.slice(0, maxWords).join(" ");
}

function countWords(value: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean).length;
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

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [lastSubmitAt, setLastSubmitAt] = useState(0);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      text: "Namaste. Ask a short question about Rangbheeni, our products, events, stories, or collaborations.",
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

  const displayWordCount = useMemo(() => countWords(input), [input]);
  const canSend = input.trim().length > 0 && !pending;

  function applyFrontendLimit(value: string) {
    return limitByWordsAndChars(value, FRONTEND_MAX_WORDS, FRONTEND_MAX_CHARS);
  }

  function handleInput(value: string) {
    setInput(applyFrontendLimit(value));
  }

  function messageForError(status?: number) {
    if (status === 429) {
      return "Please wait a few seconds before asking another question.";
    }

    if (status === 408) {
      return "The assistant is taking longer than expected. Please try again shortly.";
    }

    return "I could not prepare an answer right now. Please contact Rangbheeni at enquiries.rangbheeni@gmail.com.";
  }

  async function submit(event?: FormEvent) {
    event?.preventDefault();

    const now = Date.now();
    const waitMs = MIN_SUBMIT_INTERVAL_MS - (now - lastSubmitAt);

    if (pending) return;

    if (waitMs > 0) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          text: "Please wait a few seconds before asking another question.",
        },
      ]);
      return;
    }

    const visibleQuestion = applyFrontendLimit(input);
    const outboundQuestion = limitByWordsAndChars(
      visibleQuestion,
      SEND_MAX_WORDS,
      SEND_MAX_CHARS,
    );

    if (!outboundQuestion) return;

    setInput("");
    setPending(true);
    setLastSubmitAt(now);

    setMessages((current) => [
      ...current,
      { role: "user", text: visibleQuestion },
      { role: "assistant", text: "Preparing an answer…" },
    ]);

    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 60000);

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
            : messageForError(response.status);

        setMessages((current) => [
          ...current.slice(0, -1),
          { role: "assistant", text: message },
        ]);
        return;
      }

      const answer =
        typeof payload?.answer === "string" && payload.answer.trim()
          ? payload.answer.trim()
          : "I do not have that information in Rangbheeni’s published content. Please contact Rangbheeni at enquiries.rangbheeni@gmail.com.";

      const suffix = payload?.inputTruncated
        ? "\n\nNote: I answered using the first part of your question."
        : "";

      setMessages((current) => [
        ...current.slice(0, -1),
        { role: "assistant", text: `${answer}${suffix}` },
      ]);
    } catch {
      setMessages((current) => [
        ...current.slice(0, -1),
        {
          role: "assistant",
          text: "The assistant is taking longer than expected. Please try again shortly.",
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] flex flex-col items-end gap-3">
      {open ? (
        <div className="w-[min(92vw,390px)] overflow-hidden rounded-[1.8rem] border border-[var(--color-primary)]/25 bg-[#f4efe4]/95 shadow-2xl backdrop-blur">
          <div className="border-b border-black/10 bg-white/45 px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  Rangbheeni assistant
                </p>
                <h2 className="mt-1 font-heading text-xl font-bold text-[var(--color-brown)]">
                  Start a conversation
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 font-body text-xs font-semibold text-[var(--color-brown)] hover:bg-white"
              >
                Close
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
                {message.text}
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
              placeholder={
                pending
                  ? "Preparing an answer…"
                  : "Ask a short Rangbheeni-related question..."
              }
              className="min-h-[86px] w-full resize-none rounded-2xl border border-black/10 bg-white/75 px-4 py-3 font-body text-sm leading-6 text-[var(--color-brown)] outline-none placeholder:text-neutral-500 focus:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-70"
            />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="font-body text-[11px] text-neutral-600">
                {displayWordCount}/{FRONTEND_MAX_WORDS} words
              </p>

              <button
                type="submit"
                disabled={!canSend}
                className="rounded-full border border-[var(--color-primary)]/35 bg-white/80 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Preparing..." : "Send"}
              </button>
            </div>

            <p className="mt-2 font-body text-[10px] leading-4 text-neutral-500">
              For detailed orders, pricing, or availability, contact enquiries.rangbheeni@gmail.com.
            </p>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="group inline-flex items-center gap-3 rounded-full border border-[var(--color-primary)]/35 bg-[#f4efe4]/95 px-5 py-3 font-body text-sm font-semibold text-[var(--color-brown)] shadow-xl backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/35 hover:text-[var(--color-primary)]"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] shadow-[0_0_12px_rgba(9,113,13,0.45)]" />
        <span>{open ? "Close conversation" : "Start a conversation"}</span>
      </button>
    </div>
  );
}
