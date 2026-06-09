import Link from "next/link";
import type { EventDto } from "@rangbheeni/shared-types";
import { getEvents } from "@/lib/api";
import PageBackground from "@/components/layout/PageBackground";
import DenimTexture from "@/components/shared/DenimTexture";

export const dynamic = "force-dynamic";

function parseEventDate(event: EventDto) {
  return new Date(event.startDate);
}

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

function RangLine() {
  return (
    <div className="mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)] opacity-90" />
  );
}

function EventImage({ event }: { event: EventDto }) {
  if (!event.image?.url) return null;

  return (
    <div className="relative min-h-[320px] overflow-hidden rounded-[2rem] bg-[#e8dfcf] shadow-sm">
      <img
        src={event.image.url}
        alt={event.image.altText || event.title}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(86,43,0,0.25),transparent_48%)]" />
    </div>
  );
}

function EventDateBadge({ event }: { event: EventDto }) {
  const date = formatMonthDay(event.startDate);

  return (
    <div className="flex h-24 w-24 shrink-0 flex-col items-center justify-center rounded-[1.4rem] bg-white/70 shadow-sm backdrop-blur">
      <span className="font-body text-[11px] uppercase tracking-[0.22em] text-[var(--color-primary)]">
        {date.month}
      </span>
      <span className="mt-1 font-heading text-4xl font-bold leading-none text-[var(--color-brown)]">
        {date.day}
      </span>
    </div>
  );
}

function UpcomingEventCard({ event, large = false }: { event: EventDto; large?: boolean }) {
  const ctaHref = event.ctaUrl || "mailto:enquiries.rangbheeni@gmail.com";
  const ctaLabel = event.ctaLabel || "Inquire about this event";

  return (
    <article
      className={[
        "relative overflow-hidden rounded-[2rem] border border-black/10 bg-white/55 shadow-sm backdrop-blur",
        large ? "p-6 md:p-8" : "p-5",
      ].join(" ")}
    >
      <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-[var(--color-lightgreen)]/20 blur-3xl" />
      <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-[var(--color-accentblue)]/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-start">
        <EventDateBadge event={event} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-body text-xs uppercase tracking-[0.22em] text-[var(--color-primary)]">
              {event.type || "Event"}
            </span>
            {event.featured ? (
              <span className="rounded-full bg-[var(--color-lightgreen)]/30 px-3 py-1 font-body text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-brown)]">
                Featured
              </span>
            ) : null}
          </div>

          <h2
            className={[
              "mt-3 font-heading font-bold leading-[1.08] tracking-tight text-[var(--color-brown)]",
              large ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl",
            ].join(" ")}
          >
            {event.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 font-body text-sm font-medium text-neutral-700">
            <span>{formatDate(event.startDate)}</span>
            {event.timeText ? <span>{event.timeText}</span> : null}
            {event.city ? <span>{event.city}</span> : null}
            {event.venue ? <span>{event.venue}</span> : null}
          </div>

          {event.shortDescription || event.fullDescription ? (
            <p className="mt-5 max-w-3xl font-body text-[15px] leading-7 text-neutral-800">
              {event.shortDescription || event.fullDescription}
            </p>
          ) : null}

          <div className="mt-7">
            <Link
              href={ctaHref}
              className="inline-flex rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-6 py-3 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function PastEventRow({ event }: { event: EventDto }) {
  return (
    <div className="grid gap-2 border-b border-black/10 py-5 md:grid-cols-[170px_1fr_auto] md:items-center">
      <div className="font-body text-sm font-semibold text-[var(--color-primary)]">
        {formatDate(event.startDate)}
      </div>

      <div>
        <h3 className="font-heading text-lg font-bold text-[var(--color-brown)]">
          {event.title}
        </h3>
        <p className="font-body text-sm text-neutral-600">
          {[event.type, event.city, event.venue].filter(Boolean).join(" • ")}
        </p>
      </div>

      <Link
        href="mailto:enquiries.rangbheeni@gmail.com"
        className="font-body text-sm font-semibold text-[var(--color-primary)] hover:underline"
      >
        Inquire
      </Link>
    </div>
  );
}

export default async function EventsPage() {
  const events = await getEvents().catch(() => []);

  const today = new Date();
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const sorted = events
    .slice()
    .sort((a, b) => parseEventDate(a).getTime() - parseEventDate(b).getTime());

  const upcoming = sorted.filter(
    (event) => parseEventDate(event).getTime() >= todayUTC.getTime(),
  );

  const past = sorted
    .filter((event) => parseEventDate(event).getTime() < todayUTC.getTime())
    .sort((a, b) => parseEventDate(b).getTime() - parseEventDate(a).getTime());

  const primaryUpcoming = upcoming[0];
  const secondaryUpcoming = upcoming.slice(1, 4);

  return (
    <PageBackground variant="paper">
      <main className="relative min-h-screen overflow-x-hidden bg-[#efeeea] text-[var(--color-brown)]">
        <DenimTexture opacity="soft" />

        <div className="relative z-10 pb-20 pl-24 pr-8 pt-28 md:pl-52 md:pr-20 lg:pl-72">
          <section className="max-w-6xl">
            <p className="font-body text-xs uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Our Events
            </p>

            <h1 className="mt-4 max-w-5xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-brown)] md:text-6xl">
              Meet Rangbheeni at exhibitions, workshops, and community spaces.
            </h1>

            <p className="mt-6 max-w-4xl font-body text-base leading-8 text-neutral-800 md:text-lg">
              Upcoming events are highlighted first. For past exhibitions or workshop references,
              use the inquiry link and the Rangbheeni team can share relevant details.
            </p>

            <RangLine />
          </section>

          <section className="mt-14 max-w-6xl">
            <div className="mb-7 flex items-end justify-between gap-6">
              <div>
                <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
                  Upcoming event
                </h2>
                <p className="mt-2 max-w-3xl font-body text-neutral-700">
                  The next public Rangbheeni listing appears here when scheduled.
                </p>
              </div>
            </div>

            {primaryUpcoming ? (
              <div
                className={[
                  "grid gap-7",
                  primaryUpcoming.image?.url ? "lg:grid-cols-[1fr_0.78fr]" : "",
                ].join(" ")}
              >
                <UpcomingEventCard event={primaryUpcoming} large />
                <EventImage event={primaryUpcoming} />
              </div>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[var(--color-primary)]/35 bg-white/45 p-8">
                <h3 className="font-heading text-2xl font-bold text-[var(--color-brown)]">
                  No upcoming event is currently listed.
                </h3>
                <p className="mt-3 max-w-3xl font-body leading-7 text-neutral-700">
                  Please contact Rangbheeni for upcoming exhibitions, workshops, collaboration
                  stalls, or textile reuse events.
                </p>
                <Link
                  href="mailto:enquiries.rangbheeni@gmail.com"
                  className="mt-6 inline-flex rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-6 py-3 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
                >
                  Inquire about events
                </Link>
              </div>
            )}

            {secondaryUpcoming.length > 0 ? (
              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {secondaryUpcoming.map((event) => (
                  <UpcomingEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : null}
          </section>

          <section className="mt-16 max-w-6xl border-t border-black/10 pt-12">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
                  Past events
                </h2>
                <p className="mt-2 max-w-3xl font-body text-neutral-700">
                  A compact record of previous Rangbheeni engagements.
                </p>
              </div>

              <Link
                href="mailto:enquiries.rangbheeni@gmail.com"
                className="font-body text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                Inquire about past events
              </Link>
            </div>

            <div className="mt-7 border-t border-black/10">
              {past.length > 0 ? (
                past.slice(0, 12).map((event) => <PastEventRow key={event.id} event={event} />)
              ) : (
                <p className="py-6 font-body text-neutral-700">
                  No past events are currently listed.
                </p>
              )}
            </div>
          </section>
        </div>
      </main>
    </PageBackground>
  );
}

