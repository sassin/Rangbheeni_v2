"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { EventDto } from "@rangbheeni/shared-types";

function formatDate(value: string) {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;

  return dt.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthDay(value: string) {
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return { month: "", day: "" };

  return {
    month: dt.toLocaleDateString(undefined, { month: "short" }),
    day: dt.toLocaleDateString(undefined, { day: "2-digit" }),
  };
}

function ZipperSeam({ open }: { open: boolean }) {
  const teeth = Array.from({ length: 30 });

  return (
    <div className="relative h-10 overflow-hidden border-y border-black/10 bg-[#efe6d3]/75">
      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          opacity: open ? 0.18 : 0.36,
          scaleY: open ? 1.5 : 1,
        }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-x-0 top-1/2 h-[1px] -translate-y-1/2 bg-[var(--color-brown)]"
      />

      <div className="absolute inset-x-5 top-1/2 flex -translate-y-1/2 items-center justify-between">
        {teeth.map((_, index) => (
          <motion.span
            key={index}
            initial={false}
            animate={{
              y: open ? (index % 2 === 0 ? -2 : 2) : 0,
              rotate: open ? (index % 2 === 0 ? -18 : 18) : 0,
              opacity: open ? 0.45 : 0.85,
            }}
            transition={{
              duration: 0.42,
              delay: open ? index * 0.008 : (teeth.length - index) * 0.006,
              ease: "easeOut",
            }}
            className="h-3 w-[3px] rounded-full bg-[var(--color-brown)]/55"
          />
        ))}
      </div>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          left: open ? "calc(100% - 36px)" : "10px",
          rotate: open ? 7 : 0,
        }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-1/2 z-10 h-6 w-6 -translate-y-1/2 rounded-[5px] border border-[var(--color-primary)]/45 bg-[#fbf7ec] shadow-sm"
      >
        <div className="absolute left-1/2 top-full h-4 w-[1px] -translate-x-1/2 bg-[var(--color-primary)]/55" />
        <div className="absolute left-1/2 top-[calc(100%+12px)] h-3.5 w-3.5 -translate-x-1/2 rotate-45 rounded-[3px] border border-[var(--color-primary)]/45 bg-[#fbf7ec]" />
      </motion.div>

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          clipPath: open
            ? "polygon(0 0, 48% 0, 43% 100%, 0 100%)"
            : "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
        }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-gradient-to-r from-[#f7f0e1]/45 to-transparent"
      />

      <motion.div
        aria-hidden="true"
        initial={false}
        animate={{
          clipPath: open
            ? "polygon(52% 0, 100% 0, 100% 100%, 57% 100%)"
            : "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)",
        }}
        transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 bg-gradient-to-l from-[#f7f0e1]/45 to-transparent"
      />
    </div>
  );
}

export default function ExpandableEventCard({
  event,
  featured = false,
}: {
  event: EventDto;
  featured?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const date = formatMonthDay(event.startDate);
  const ctaHref = event.ctaUrl || "mailto:enquiries.rangbheeni@gmail.com";
  const ctaLabel = event.ctaLabel || "Inquire about this event";

  return (
    <article
      className={[
        "relative overflow-hidden rounded-[1.6rem] border border-black/10 bg-white/62 shadow-sm backdrop-blur transition-colors duration-300",
        open ? "border-[var(--color-primary)]/25 bg-white/78" : "",
        featured ? "md:rounded-[1.9rem]" : "",
      ].join(" ")}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid w-full gap-4 p-4 text-left md:grid-cols-[78px_1fr_auto] md:items-center md:p-5"
        aria-expanded={open}
      >
        <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-[1.15rem] bg-[#f4efe4]/90 shadow-sm">
          <span className="font-body text-[10px] uppercase tracking-[0.22em] text-[var(--color-primary)]">
            {date.month}
          </span>
          <span className="mt-1 font-heading text-3xl font-bold leading-none text-[var(--color-brown)]">
            {date.day}
          </span>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[var(--color-lightgreen)]/30 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-brown)]">
              {event.type || "Event"}
            </span>
          </div>

          <h3 className="mt-2 font-heading text-2xl font-bold leading-tight text-[var(--color-brown)] md:text-3xl">
            {event.title}
          </h3>

          <p className="mt-2 line-clamp-2 font-body text-sm leading-6 text-neutral-700">
            {event.shortDescription ||
              event.fullDescription ||
              "Event details will be updated soon."}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 font-body text-xs font-medium text-neutral-600">
            <span>{formatDate(event.startDate)}</span>
            {event.timeText ? <span>{event.timeText}</span> : null}
            {event.city ? <span>{event.city}</span> : null}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {event.image?.url ? (
            <div className="hidden h-20 w-24 overflow-hidden rounded-[1rem] bg-[#e8dfcf] md:block">
              <img
                src={event.image.url}
                alt={event.image.altText || event.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <span
            className={[
              "inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/70 text-[var(--color-brown)] transition",
              open ? "rotate-180 border-[var(--color-primary)]/30 text-[var(--color-primary)]" : "",
            ].join(" ")}
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
              <path
                d="M7 10l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </button>

      <ZipperSeam open={open} />

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="event-details"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-5 pt-4 md:px-5">
              <div className="border-l border-[var(--color-primary)]/25 pl-5">
                <p className="max-w-3xl font-body text-sm leading-7 text-neutral-800">
                  {event.fullDescription ||
                    event.shortDescription ||
                    "More event details will be announced soon."}
                </p>

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-body text-sm text-neutral-700">
                  {event.venue ? <span>{event.venue}</span> : null}
                  {event.address ? <span>{event.address}</span> : null}
                </div>

                <Link
                  href={ctaHref}
                  className="mt-5 inline-flex rounded-full border border-[var(--color-primary)]/35 bg-white/75 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
                >
                  {ctaLabel}
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </article>
  );
}
