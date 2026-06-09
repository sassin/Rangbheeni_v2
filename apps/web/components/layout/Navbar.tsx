"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { navigationCta, primaryNavigation } from "@/content/global/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const navLinks = useMemo(() => primaryNavigation.filter((item) => !item.hidden), []);

  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isSoft = !isHome || (mounted && scrolled);

  const linkClass = (active: boolean) =>
    [
      "font-body text-[15px] transition-colors duration-300",
      active
        ? "text-[var(--color-primary)]"
        : isSoft
          ? "text-[var(--color-brown)]/75 hover:text-[var(--color-brown)]"
          : "text-white/78 hover:text-white",
    ].join(" ");

  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <div
        className={[
          "transition-all duration-500 ease-out",
          isSoft
            ? "bg-[linear-gradient(to_bottom,rgba(252,248,242,0.72),rgba(252,248,242,0.28),transparent)] backdrop-blur-md"
            : "bg-transparent",
        ].join(" ")}
      >
        <div
          className={[
            "mx-auto flex max-w-6xl items-center justify-between px-4 transition-all duration-500 md:px-6",
            isSoft ? "py-3 md:py-4" : "py-4 md:py-5",
          ].join(" ")}
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading text-2xl font-bold md:text-3xl">
              <span className="bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)] bg-clip-text text-transparent">
                Rangbheeni
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((item) => {
              const active = pathname === item.href;
              return (
                <Link key={item.href} href={item.href} className={linkClass(active)}>
                  {item.label}
                </Link>
              );
            })}

            <Link
              href={navigationCta.href}
              className={[
                "font-body text-sm font-semibold transition-colors duration-300",
                isSoft
                  ? "text-[var(--color-brown)]/80 hover:text-[var(--color-primary)]"
                  : "text-white/88 hover:text-white",
              ].join(" ")}
            >
              {navigationCta.label}
            </Link>
          </nav>

          <div className="flex items-center md:hidden">
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen((value) => !value)}
              className={[
                "p-2 transition-colors duration-300",
                isSoft ? "text-[var(--color-brown)]" : "text-white",
              ].join(" ")}
            >
              <div className="flex flex-col gap-1.5">
                {[0, 1, 2].map((line) => (
                  <span
                    key={line}
                    className={[
                      "block h-0.5 w-5 rounded transition-colors duration-300",
                      isSoft ? "bg-[var(--color-brown)]" : "bg-white",
                    ].join(" ")}
                  />
                ))}
              </div>
            </button>
          </div>
        </div>

        {open ? (
          <div className="border-t border-[var(--color-brown)]/8 bg-[rgba(252,248,242,0.88)] backdrop-blur-md md:hidden">
            <div className="mx-auto max-w-6xl px-4 py-4">
              <nav className="flex flex-col gap-3">
                {navLinks.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "font-body text-base transition-colors duration-300",
                        active
                          ? "font-semibold text-[var(--color-primary)]"
                          : "text-[var(--color-brown)] hover:text-[var(--color-primary)]",
                      ].join(" ")}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                <div className="pt-2">
                  <Link
                    href={navigationCta.href}
                    className="font-body text-sm font-semibold text-[var(--color-brown)] transition-colors duration-300 hover:text-[var(--color-primary)]"
                  >
                    {navigationCta.label}
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
