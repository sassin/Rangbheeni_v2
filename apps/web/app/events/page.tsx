import Link from "next/link";
import type { EventDto } from "@rangbheeni/shared-types";
import { getEvents } from "@/lib/api";
import PageBackground from "@/components/layout/PageBackground";
import DenimTexture from "@/components/shared/DenimTexture";
import AnimatedRangDivider from "@/components/shared/AnimatedRangDivider";
import ExpandableEventCard from "@/components/events/ExpandableEventCard";

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

function PastEventRow({ event }: { event: EventDto }) {
  return (
    <div className="grid gap-2 border-b border-black/10 py-5 md:grid-cols-[170px_1fr] md:items-center">
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
    </div>
  );
}

export default async function EventsPage() {
  const events = await getEvents().catch(() => []);

  const today = new Date();
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  );

  const sorted = events.slice();

  const upcoming = sorted
    .filter((event) => parseEventDate(event).getTime() >= todayUTC.getTime())
    .sort((a, b) => parseEventDate(a).getTime() - parseEventDate(b).getTime());

  const past = sorted
    .filter((event) => parseEventDate(event).getTime() < todayUTC.getTime())
    .sort((a, b) => parseEventDate(b).getTime() - parseEventDate(a).getTime());

  const primaryUpcoming = upcoming[0];
  const secondaryUpcoming = upcoming.slice(1, 5);

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

            <AnimatedRangDivider />
          </section>

          <section className="mt-14 max-w-6xl">
            <div className="mb-7 flex items-end justify-between gap-6">
              <div>
                <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
                  Upcoming event
                </h2>
                <AnimatedRangDivider className="mt-4" />
                <p className="mt-4 max-w-3xl font-body text-neutral-700">
                  Compact listings open like a textile seam, so the page stays clean until details are needed.
                </p>
              </div>
            </div>

            {primaryUpcoming ? (
              <div className="grid gap-5">
                <ExpandableEventCard event={primaryUpcoming} featured />

                {secondaryUpcoming.length > 0 ? (
                  <div className="grid gap-5">
                    {secondaryUpcoming.map((event) => (
                      <ExpandableEventCard key={event.id} event={event} />
                    ))}
                  </div>
                ) : null}
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
          </section>

          <section className="mt-16 max-w-6xl border-t border-black/10 pt-12">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
                  Past events
                </h2>
                <AnimatedRangDivider className="mt-4" />
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
