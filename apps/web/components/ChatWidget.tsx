"use client";

import { FormEvent, useMemo, useState } from "react";

type Message = { role: "user" | "bot"; text: string };

const chatApiUrl = process.env.NEXT_PUBLIC_CHATBOT_API_URL || "";
const chatInMaintenance = process.env.NEXT_PUBLIC_AI_CHAT_MAINTENANCE === "true";
const chatHidden = process.env.NEXT_PUBLIC_SHOW_AI_CHAT === "false";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "bot",
      text: "Hi, I can help with Rangbheeni’s products, stories, events, and collaborations.",
    },
  ]);

  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const chatAvailable = !chatInMaintenance && Boolean(chatApiUrl);

  async function send(event: FormEvent) {
    event.preventDefault();

    if (!chatAvailable) {
      setOpen(false);
      return;
    }

    const text = input.trim();
    if (!text || loading) return;

    setInput("");
    setMessages((existing) => [...existing, { role: "user", text }]);
    setLoading(true);

    try {
      const response = await fetch(`${chatApiUrl.replace(/\/$/, "")}/chat/message`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const payload = response.ok ? await response.json() : null;

      setMessages((existing) => [
        ...existing,
        {
          role: "bot",
          text:
            payload?.answer ??
            "I do not have that information in Rangbheeni’s published content. Please contact Rangbheeni at enquiries.rangbheeni@gmail.com.",
        },
      ]);
    } catch {
      setMessages((existing) => [
        ...existing,
        {
          role: "bot",
          text:
            "I do not have that information in Rangbheeni’s published content. Please contact Rangbheeni at enquiries.rangbheeni@gmail.com.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function toggleChat() {
    if (!chatAvailable) {
      setOpen(false);
      return;
    }

    setOpen((value) => !value);
  }

  if (chatHidden) return null;

  return (
    <>
      {open && chatAvailable ? (
        <aside className="chat-panel" aria-label="Rangbheeni chat assistant">
          <div className="chat-head">
            <span>Rangbheeni Assistant</span>
            <button
              className="announcement-close"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          <div className="chat-messages">
            {messages.map((message, index) => (
              <div key={index} className={`chat-msg ${message.role}`}>
                {message.text}
              </div>
            ))}

            {loading ? <div className="chat-msg bot">Checking Rangbheeni content…</div> : null}
          </div>

          <form className="chat-form" onSubmit={send}>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask a question"
              aria-label="Ask a question"
            />
            <button type="submit">Send</button>
          </form>
        </aside>
      ) : null}

      <button
        className="chat-button"
        onClick={toggleChat}
        aria-label={chatAvailable ? "Open Rangbheeni chat" : "Rangbheeni chat"}
        title={chatAvailable ? "Open Rangbheeni chat" : "Rangbheeni"}
      >
        {open && chatAvailable ? "Close" : "Chat"}
      </button>
    </>
  );
}

