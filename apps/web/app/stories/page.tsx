import Link from "next/link";
import type { StoryDto } from "@rangbheeni/shared-types";
import { getStories } from "@/lib/api";
import PageBackground from "@/components/layout/PageBackground";
import DenimTexture from "@/components/shared/DenimTexture";

export const dynamic = "force-dynamic";

function formatDate(value?: string | null) {
  if (!value) return "";
  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;

  return dt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function RangLine() {
  return (
    <div className="mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)] opacity-90" />
  );
}

function StoryVisual({ story, large = false }: { story: StoryDto; large?: boolean }) {
  if (!story.coverImage?.url) return null;

  return (
    <div
      className={[
        "relative overflow-hidden bg-[#e8dfcf]",
        large ? "min-h-[360px] rounded-[2.2rem]" : "h-52 rounded-[1.6rem]",
      ].join(" ")}
    >
      <img
        src={story.coverImage.url}
        alt={story.coverImage.altText || story.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(86,43,0,0.26),transparent_48%)]" />
    </div>
  );
}

function PrimaryStoryCard({ story }: { story: StoryDto }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className={[
        "group grid gap-7 overflow-hidden rounded-[2.3rem] border border-black/10 bg-white/55 p-6 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md",
        story.coverImage?.url ? "lg:grid-cols-[0.9fr_1.1fr]" : "",
      ].join(" ")}
    >
      <StoryVisual story={story} large />

      <div className="flex min-h-[330px] flex-col justify-center">
        <p className="font-body text-xs uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Current story
        </p>

        <h2 className="mt-4 font-heading text-3xl font-bold leading-[1.06] text-[var(--color-brown)] md:text-5xl">
          {story.title}
        </h2>

        {story.publishedDate ? (
          <p className="mt-4 font-body text-sm font-semibold text-neutral-500">
            {formatDate(story.publishedDate)}
          </p>
        ) : null}

        <p className="mt-5 max-w-3xl font-body text-base leading-8 text-neutral-800">
          {story.excerpt}
        </p>

        <span className="mt-7 inline-flex w-fit rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-6 py-3 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-lightgreen)]/30 group-hover:text-[var(--color-primary)]">
          Read story
        </span>
      </div>
    </Link>
  );
}

function StoryTile({ story, index }: { story: StoryDto; index: number }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className={[
        "group relative overflow-hidden rounded-[1.8rem] border border-black/10 bg-white/55 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md",
        index % 3 === 1 ? "md:mt-8" : "",
      ].join(" ")}
    >
      <StoryVisual story={story} />

      <div className={story.coverImage?.url ? "pt-5" : "pt-2"}>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
          {formatDate(story.publishedDate)}
        </p>

        <h3 className="mt-2 font-heading text-2xl font-bold leading-tight text-[var(--color-brown)] transition group-hover:text-[var(--color-primary)]">
          {story.title}
        </h3>

        <p className="mt-3 line-clamp-4 font-body text-sm leading-7 text-neutral-700">
          {story.excerpt}
        </p>

        <p className="mt-5 font-body text-sm font-semibold text-[var(--color-primary)]">
          Read →
        </p>
      </div>
    </Link>
  );
}

function ArchiveRow({ story }: { story: StoryDto }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className="grid gap-2 border-b border-black/10 py-4 transition hover:border-[var(--color-primary)]/40 md:grid-cols-[160px_1fr_auto] md:items-center"
    >
      <span className="font-body text-sm font-semibold text-[var(--color-primary)]">
        {formatDate(story.publishedDate)}
      </span>

      <span className="font-heading text-lg font-bold text-[var(--color-brown)]">
        {story.title}
      </span>

      <span className="font-body text-sm font-semibold text-[var(--color-primary)]">
        Open
      </span>
    </Link>
  );
}

export default async function StoriesPage() {
  const stories = await getStories().catch(() => []);

  const ordered = stories.slice().sort((a, b) => {
    const aFeatured = a.featured ? 1 : 0;
    const bFeatured = b.featured ? 1 : 0;
    if (aFeatured !== bFeatured) return bFeatured - aFeatured;

    const ad = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
    const bd = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
    return bd - ad;
  });

  const primary = ordered[0];
  const highlighted = ordered.slice(1, 7);
  const archive = ordered.slice(7);

  return (
    <PageBackground variant="paper">
      <main className="relative min-h-screen overflow-x-hidden bg-[#efeeea] text-[var(--color-brown)]">
        <DenimTexture opacity="soft" />

        <div className="relative z-10 pb-20 pl-24 pr-8 pt-28 md:pl-52 md:pr-20 lg:pl-72">
          <section className="max-w-6xl">
            <p className="font-body text-xs uppercase tracking-[0.28em] text-[var(--color-primary)]">
              Our Stories
            </p>

            <h1 className="mt-4 max-w-5xl font-heading text-4xl font-bold leading-[1.05] tracking-tight text-[var(--color-brown)] md:text-6xl">
              Stories of cloth, craft, care, and community.
            </h1>

            <p className="mt-6 max-w-4xl font-body text-base leading-8 text-neutral-800 md:text-lg">
              A curated view into Rangbheeni’s work with women, upcycled textiles,
              community engagement, and climate-conscious livelihoods.
            </p>

            <RangLine />

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#current-stories"
                className="rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
              >
                Current stories
              </a>
              <a
                href="#story-archive"
                className="rounded-full border border-black/10 bg-white/55 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] hover:border-[var(--color-primary)]"
              >
                All stories
              </a>
            </div>
          </section>

          <section id="current-stories" className="mt-14 max-w-6xl scroll-mt-24">
            {primary ? (
              <PrimaryStoryCard story={primary} />
            ) : (
              <div className="rounded-[2rem] border border-dashed border-[var(--color-primary)]/35 bg-white/45 p-8">
                <h2 className="font-heading text-2xl font-bold text-[var(--color-brown)]">
                  No stories are currently published.
                </h2>
                <p className="mt-3 font-body text-neutral-700">
                  Stories will appear here once they are published in the Rangbheeni database.
                </p>
              </div>
            )}

            {highlighted.length > 0 ? (
              <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {highlighted.map((story, index) => (
                  <StoryTile key={story.id} story={story} index={index} />
                ))}
              </div>
            ) : null}
          </section>

          <section id="story-archive" className="mt-16 max-w-6xl scroll-mt-24 border-t border-black/10 pt-12">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
                  All stories
                </h2>
                <p className="mt-2 max-w-3xl font-body text-neutral-700">
                  Older stories are kept here as a compact archive. This can become a separate
                  archive route later without changing the database.
                </p>
              </div>

              <Link
                href="mailto:enquiries.rangbheeni@gmail.com"
                className="font-body text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                Inquire about stories
              </Link>
            </div>

            <div className="mt-7 border-t border-black/10">
              {archive.length > 0 ? (
                archive.map((story) => <ArchiveRow key={story.id} story={story} />)
              ) : ordered.length > 0 ? (
                <p className="py-6 font-body text-neutral-700">
                  All published stories are already shown above.
                </p>
              ) : null}
            </div>
          </section>
        </div>
      </main>
    </PageBackground>
  );
}

