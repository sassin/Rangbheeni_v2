import { footerContent } from "@/content/global/footer";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-0 border-t border-black/10">
      <div className="mx-auto max-w-6xl px-2 py-8 font-body text-sm text-neutral-600">
        © {year} {footerContent.copyrightName}. All rights reserved.
      </div>

      {footerContent.tagline ? (
        <div className="absolute bottom-8 right-6 text-[9px] font-bold uppercase tracking-[0.6em] text-[var(--color-brown)] opacity-40 select-none">
          <p className="hidden md:block">{footerContent.tagline}</p>
        </div>
      ) : null}
    </footer>
  );
}
