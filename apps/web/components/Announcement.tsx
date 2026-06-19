"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

const contentApiUrl =
  process.env.NEXT_PUBLIC_CONTENT_API_URL || "http://localhost:4000";

const announcementEnabled =
  process.env.NEXT_PUBLIC_ANNOUNCEMENT_ENABLED !== "false";

type LaunchAnnouncement = {
  id: string;
  title: string;
  message: string;
  displayType?: "modal" | "banner";
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  fallback?: boolean;
};

const defaultAnnouncement: LaunchAnnouncement = {
  id: "default-updates-v1",
  title: "Stay connected with Rangbheeni",
  message:
    "Get occasional updates about our events, products, impact stories, and new initiatives.",
  fallback: true,
};

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function Announcement() {
  const [announcement, setAnnouncement] = useState<LaunchAnnouncement | null>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "invalid" | "error">("idle");

  useEffect(() => {
    if (!announcementEnabled) return;

    let ignore = false;

    fetch(`${contentApiUrl.replace(/\/$/, "")}/public/announcement/active`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: LaunchAnnouncement | null) => {
        if (ignore) return;

        const selected = data?.id ? data : defaultAnnouncement;
        const key = `rangbheeni_announcement_dismissed_${selected.id}`;

        if (window.sessionStorage.getItem(key) === "true") return;
        setAnnouncement(selected);
      })
      .catch(() => {
        if (ignore) return;

        const key = `rangbheeni_announcement_dismissed_${defaultAnnouncement.id}`;
        if (window.sessionStorage.getItem(key) !== "true") {
          setAnnouncement(defaultAnnouncement);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const storageKey = useMemo(() => {
    if (!announcement) return "";
    return `rangbheeni_announcement_dismissed_${announcement.id}`;
  }, [announcement]);

  function close() {
    if (storageKey) window.sessionStorage.setItem(storageKey, "true");
    setAnnouncement(null);
  }

  async function submitEmail(event: FormEvent) {
    event.preventDefault();

    const normalized = email.trim().toLowerCase();
    if (!isValidEmail(normalized)) {
      setStatus("invalid");
      return;
    }

    setStatus("saving");

    try {
      const response = await fetch(
        `${contentApiUrl.replace(/\/$/, "")}/public/newsletter/subscribe`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: normalized }),
        },
      );

      if (!response.ok) throw new Error("Failed");

      setStatus("saved");
      window.setTimeout(close, 700);
    } catch {
      setStatus("error");
    }
  }

  if (!announcementEnabled || !announcement) return null;

  return (
    <div
      className="fixed inset-0 z-[90] grid place-items-center bg-black/35 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="announcement-title"
    >
      <div className="relative w-[min(92vw,520px)] rounded-[2rem] border border-[var(--color-primary)]/25 bg-[#f4efe4] p-6 shadow-2xl">
        <button
          type="button"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white/70 font-body text-xl leading-none text-[var(--color-brown)] hover:bg-white"
          aria-label="Close announcement"
          onClick={close}
        >
          ×
        </button>

        <p className="font-body text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-primary)]">
          Rangbheeni update
        </p>

        <h2
          id="announcement-title"
          className="mt-3 font-display text-3xl leading-tight text-[var(--color-brown)]"
        >
          {announcement.title}
        </h2>

        <p className="mt-4 font-body text-sm leading-7 text-neutral-700">
          {announcement.message}
        </p>

        {announcement.ctaUrl && announcement.ctaLabel ? (
          <a
            href={announcement.ctaUrl}
            onClick={close}
            className="mt-5 inline-flex rounded-full border border-[var(--color-primary)]/35 bg-white/80 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
          >
            {announcement.ctaLabel}
          </a>
        ) : null}

        {announcement.fallback ? (
          <form onSubmit={submitEmail} className="mt-6">
            <label className="font-body text-xs font-semibold uppercase tracking-[0.18em] text-neutral-600">
              Email for updates
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === "error" || status === "invalid") setStatus("idle");
                }}
                placeholder="you@example.com"
                className="min-h-11 flex-1 rounded-full border border-black/10 bg-white/80 px-4 font-body text-sm text-[var(--color-brown)] outline-none focus:border-[var(--color-primary)]"
              />

              <button
                type="submit"
                disabled={status === "saving"}
                className="rounded-full border border-[var(--color-primary)]/35 bg-white/80 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)] disabled:opacity-50"
              >
                {status === "saving" ? "Saving..." : "Notify me"}
              </button>
            </div>

            {status === "saved" ? (
              <p className="mt-3 font-body text-sm text-[var(--color-primary)]">
                Thank you. We’ll keep you posted.
              </p>
            ) : null}

            {status === "invalid" ? (
              <p className="mt-3 font-body text-sm text-red-700">
                Please enter a valid email address.
              </p>
            ) : null}

            {status === "error" ? (
              <p className="mt-3 font-body text-sm text-red-700">
                We could not save your email right now. Please try again shortly.
              </p>
            ) : null}
          </form>
        ) : null}
      </div>
    </div>
  );
}

export default Announcement;
