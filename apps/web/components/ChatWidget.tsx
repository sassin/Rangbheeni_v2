"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type Message = { role: "user" | "bot"; text: string };

const chatApiUrl =
  process.env.NEXT_PUBLIC_CHATBOT_API_URL || "http://localhost:4100";

const fallbackAnswer =
  "I do not have that information in Rangbheeni’s published content. Please contact Rangbheeni at enquiries.rangbheeni@gmail.com.";

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Namaste. Ask about Rangbheeni, our products, events, stories, or collaborations. I will answer only from Rangbheeni content.",
    },
  ]);
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function toggleOpen() {
    setOpen((value) => {
      const next = !value;
      if (next) {
        window.setTimeout(() => inputRef.current?.focus(), 80);
      }
      return next;
    });
  }

  async function send(event: FormEvent) {
    event.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((existing) => [...existing, { role: "user", text }]);
    setLoading(true);

    try {
      const response = await fetch(
        `${chatApiUrl.replace(/\/$/, "")}/chat/message`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: text, sessionId }),
        },
      );

      const payload = response.ok ? await response.json() : null;

      setMessages((existing) => [
        ...existing,
        {
          role: "bot",
          text: typeof payload?.answer === "string" ? payload.answer : fallbackAnswer,
        },
      ]);
    } catch {
      setMessages((existing) => [...existing, { role: "bot", text: fallbackAnswer }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[80] font-body md:bottom-7 md:right-7">
      {open ? (
        <aside
          aria-label="Rangbheeni chat assistant"
          className="mb-4 flex h-[min(640px,calc(100vh-7.5rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[2rem] border border-[var(--color-primary)]/25 bg-[#f7f0e4]/95 text-[var(--color-brown)] shadow-[0_24px_70px_rgba(69,44,23,0.24)] backdrop-blur-xl"
        >
          <div className="relative overflow-hidden border-b border-black/10 bg-white/45 px-5 py-4">
            <div className="absolute -right-10 -top-12 h-28 w-28 rounded-full bg-[var(--color-lightgreen)]/35 blur-2xl" />
            <div className="relative flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-[10px] uppercase tracking-[0.24em] text-[var(--color-primary)]">
                  Rangbheeni Assistant
                </p>
                <h2 className="mt-1 font-heading text-xl font-bold leading-tight text-[var(--color-brown)]">
                  Ask from our published content
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white/70 text-xl leading-none text-[var(--color-brown)] transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-lightgreen)]/25"
              >
                ×
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={[
                  "max-w-[88%] whitespace-pre-wrap rounded-[1.15rem] px-4 py-3 text-sm leading-6 shadow-sm",
                  message.role === "user"
                    ? "ml-auto bg-[var(--color-primary)]/95 text-white"
                    : "mr-auto border border-black/10 bg-white/75 text-neutral-800",
                ].join(" ")}
              >
                {message.text}
              </div>
            ))}

            {loading ? (
              <div className="mr-auto max-w-[88%] rounded-[1.15rem] border border-black/10 bg-white/75 px-4 py-3 text-sm leading-6 text-neutral-700 shadow-sm">
                Checking Rangbheeni content…
              </div>
            ) : null}
          </div>

          <form onSubmit={send} className="border-t border-black/10 bg-white/45 p-3">
            <div className="flex items-center gap-2 rounded-full border border-[var(--color-primary)]/25 bg-white/80 p-1.5 shadow-sm">
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about products, events, stories…"
                aria-label="Ask a Rangbheeni question"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-[var(--color-brown)] outline-none placeholder:text-neutral-500"
              />
              <button
                type="submit"
                disabled={loading || input.trim().length === 0}
                className="rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--color-brown)] shadow-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-45"
              >
                Send
              </button>
            </div>
          </form>
        </aside>
      ) : null}

      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={open}
        className="group ml-auto flex items-center gap-3 rounded-full border border-[var(--color-primary)]/35 bg-white/80 px-5 py-3 text-sm font-semibold text-[var(--color-brown)] shadow-[0_12px_38px_rgba(69,44,23,0.18)] backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] transition group-hover:bg-white/65">
          {open ? "×" : "✦"}
        </span>
        <span>{open ? "Close conversation" : "Start a conversation"}</span>
      </button>
    </div>
  );
}
