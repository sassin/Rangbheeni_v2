"use client";

import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

export default function StoryModalShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/stories") return null;

  function close() {
    router.push("/stories", { scroll: false });
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(44,31,20,0.42)] p-3 backdrop-blur-sm md:p-5"
      role="dialog"
      aria-modal="true"
      onClick={close}
    >
      <button
        type="button"
        onClick={close}
        aria-label="Close story"
        className="absolute right-4 top-4 z-20 rounded-full border border-white/50 bg-[#efeeea]/90 px-4 py-2 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:bg-white"
      >
        Close
      </button>

      <div className="relative z-10" onClick={(event) => event.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
