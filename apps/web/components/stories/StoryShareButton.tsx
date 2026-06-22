"use client";

import { useState } from "react";

type ShareNavigator = Navigator & {
  share?: (data: ShareData) => Promise<void>;
  clipboard?: {
    writeText: (text: string) => Promise<void>;
  };
};

export default function StoryShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/stories/${slug}`
        : `/stories/${slug}`;

    const nav: ShareNavigator | null =
      typeof window !== "undefined" ? (window.navigator as ShareNavigator) : null;

    try {
      if (nav?.share) {
        await nav.share({
          title: document.title || "Rangbheeni story",
          url,
        });
        return;
      }

      if (nav?.clipboard?.writeText) {
        await nav.clipboard.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      }
    } catch {
      if (nav?.clipboard?.writeText) {
        try {
          await nav.clipboard.writeText(url);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          setCopied(false);
        }
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Story link copied" : "Share story"}
      title={copied ? "Copied" : "Share story"}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-[#fbf7ec]/85 text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
        <path
          d="M8.5 12.5l7-4M8.5 11.5l7 4"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
        <circle cx="6.5" cy="12" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.5" cy="7" r="2.4" stroke="currentColor" strokeWidth="1.7" />
        <circle cx="17.5" cy="17" r="2.4" stroke="currentColor" strokeWidth="1.7" />
      </svg>

      {copied ? (
        <span className="absolute right-0 top-12 rounded-full bg-[var(--color-brown)] px-3 py-1 font-body text-xs font-semibold text-white shadow-sm">
          Copied
        </span>
      ) : null}
    </button>
  );
}
