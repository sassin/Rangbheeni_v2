import Link from "next/link";

type Story = {
  slug: string;
  title: string;
  excerpt: string;
  coverImage: string;
  featured?: boolean;
};

function RangDivider() {
  return (
    <div className="mt-4 h-1 w-28 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)]" />
  );
}

export default function FeaturedStories({ stories }: { stories: Story[] }) {
  const featured = (stories || []).filter((s) => s.featured);
  const pick = (featured.length ? featured : stories || []).slice(0, 3);

  return (
    <section className="">
      <div className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex items-end justify-between gap-6">
        <div>
          <h2 className="font-heading text-2xl font-bold text-[var(--color-brown)] md:text-3xl">
            Stories from the ground
          </h2>
          <p className="mt-2 font-body text-neutral-700 max-w-2xl">
            Real people, real work, real impact.
          </p>
          <RangDivider />
        </div>

        <Link
          href="/stories"
          className="hidden md:inline font-body text-sm font-semibold text-[var(--color-accentblue)] hover:underline underline-offset-4"
        >
          View all stories →
        </Link>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
        {pick.map((s) => (
          <Link
            key={s.slug}
            href={``}
            className="group overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div
              className="h-44 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${s.coverImage})` }}
              aria-label={s.title}
              role="img"
            />
            <div className="p-6">
              <h3 className="font-heading text-lg font-bold text-[var(--color-brown)] group-hover:text-[var(--color-primary)] transition">
                {s.title}
              </h3>
              <p className="mt-2 font-body text-sm text-neutral-700 line-clamp-3">
                {s.excerpt}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 md:hidden">
        <Link
          href="/stories"
          className="font-body text-sm font-semibold text-[var(--color-accentblue)] hover:underline underline-offset-4"
        >
          View all stories →
        </Link>
      </div>
      </div>
    </section>
  );
}