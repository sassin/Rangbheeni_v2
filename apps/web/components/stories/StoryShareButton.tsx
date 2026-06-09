"use client";

import { useState } from "react";

export default function StoryShareButton({ slug }: { slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    const url = `${window.location.origin}/stories/${slug}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy story link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={copyLink}
      className="rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
    >
      {copied ? "Link copied" : "Share story"}
    </button>
  );
}
