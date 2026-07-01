import Link from "next/link";
import { Suspense } from "react";
import type { StoryDto } from "@rangbheeni/shared-types";
import { getStories, getGalleryImages } from "@/lib/api";
import PageBackground from "@/components/layout/PageBackground";
import DenimTexture from "@/components/shared/DenimTexture";
import PageContentReveal from "@/components/shared/PageContentReveal";
import PageHeroReveal from "@/components/shared/PageHeroReveal";
import StoryGalleryCarousel from "@/components/stories/StoryGalleryCarousel";

export const revalidate = 300;

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

function isStoryFeatured(story: StoryDto) {
  return (
    (story as StoryDto & { featured?: boolean }).featured === true ||
    typeof story.featuredRank === "number"
  );
}

function getFirstReadableParagraph(story: StoryDto) {
  for (const block of story.blocks || []) {
    if (block.type !== "paragraph" && block.type !== "quote") continue;

    const text = typeof block.text === "string" ? block.text.trim() : "";
    if (text) return text;
  }

  return story.excerpt || "";
}

function StoryVisual({ story, large = false }: { story: StoryDto; large?: boolean }) {
  if (!story.coverImage?.url) return null;

  return (
    <div
      className={[
        "relative overflow-hidden bg-[#e8dfcf]",
        large ? "h-64 rounded-[1.7rem] md:h-72" : "h-52 rounded-[1.6rem]",
      ].join(" ")}
    >
      <img
        src={story.coverImage.url}
        alt={story.coverImage.altText || story.title}
        className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(86,43,0,0.22),transparent_48%)]" />
    </div>
  );
}

function PrimaryStoryCard({ story }: { story: StoryDto }) {
  const firstParagraph = getFirstReadableParagraph(story);

  return (
    <Link
      href={`/stories/${story.slug}`}
      prefetch
      className={[
        "group grid h-full gap-5 overflow-hidden rounded-[1.8rem] border border-black/10 bg-white/55 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md md:p-5",
        story.coverImage?.url ? "lg:grid-cols-[0.58fr_1fr]" : "",
      ].join(" ")}
    >
      <StoryVisual story={story} large />

      <div className="flex flex-col justify-center">
        <p className="font-body text-xs uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Featured story
        </p>

        <h2 className="mt-3 font-heading text-2xl font-bold leading-[1.08] text-[var(--color-brown)] md:text-4xl">
          {story.title}
        </h2>

        {story.publishedDate ? (
          <p className="mt-3 font-body text-sm font-semibold text-neutral-500">
            {formatDate(story.publishedDate)}
          </p>
        ) : null}

        {firstParagraph ? (
          <p className="mt-4 hidden max-w-3xl font-body text-[15px] leading-7 text-neutral-800 md:block">
            {firstParagraph}
          </p>
        ) : null}

        <span className="mt-5 inline-flex w-fit rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-5 py-2.5 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-lightgreen)]/30 group-hover:text-[var(--color-primary)]">
          Read more
        </span>
      </div>
    </Link>
  );
}

function SupportingFeaturedCard({ story }: { story: StoryDto }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      prefetch
      className="group grid overflow-hidden rounded-[1.8rem] border border-black/10 bg-white/50 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
    >
      <StoryVisual story={story} />

      <div className={story.coverImage?.url ? "pt-5" : "pt-2"}>
        <p className="font-body text-[11px] uppercase tracking-[0.2em] text-[var(--color-primary)]">
          {formatDate(story.publishedDate)}
        </p>

        <h3 className="mt-2 font-heading text-2xl font-bold leading-tight text-[var(--color-brown)] transition group-hover:text-[var(--color-primary)]">
          {story.title}
        </h3>

        <p className="mt-3 hidden font-body text-sm leading-7 text-neutral-700 md:line-clamp-3">
          {story.excerpt}
        </p>

        <p className="mt-5 font-body text-sm font-semibold text-[var(--color-primary)]">
          Read →
        </p>
      </div>
    </Link>
  );
}

function StoryTile({ story, index }: { story: StoryDto; index: number }) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      prefetch
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

        <p className="mt-3 hidden font-body text-sm leading-7 text-neutral-700 md:line-clamp-4">
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
      prefetch
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

function StoriesContentFallback() {
  return (
    <section
      aria-hidden="true"
      className="mt-12 max-w-6xl stories-soft-enter"
    >
      <div className="rounded-[1.8rem] border border-black/10 bg-white/35 p-4 shadow-sm backdrop-blur md:p-5">
        <div className="grid gap-5 lg:grid-cols-[0.58fr_1fr]">
          <div className="h-64 rounded-[1.7rem] bg-white/35 md:h-72" />
          <div className="flex flex-col justify-center">
            <div className="h-3 w-32 rounded-full bg-[var(--color-primary)]/15" />
            <div className="mt-5 h-10 w-4/5 rounded-2xl bg-[var(--color-brown)]/10" />
            <div className="mt-4 h-4 w-28 rounded-full bg-black/10" />
            <div className="mt-5 hidden h-4 w-full max-w-2xl rounded-full bg-black/10 md:block" />
            <div className="mt-3 hidden h-4 w-5/6 rounded-full bg-black/10 md:block" />
            <div className="mt-6 h-10 w-32 rounded-full bg-white/45" />
          </div>
        </div>
      </div>
    </section>
  );
}

async function StoriesContent() {
  const [stories, galleryItems] = await Promise.all([
    getStories().catch(() => []),
    getGalleryImages().catch(() => []),
  ]);

  const carouselImages = galleryItems.flatMap((item) =>
    item.image?.url
      ? [
          {
            id: item.id,
            url: item.image.url,
            altText: item.image.altText,
            hoverText: item.hoverText,
            sortOrder: item.sortOrder,
          },
        ]
      : []
  );

  const ordered = stories.slice().sort((a, b) => {
    const ar = typeof a.featuredRank === "number" ? a.featuredRank : null;
    const br = typeof b.featuredRank === "number" ? b.featuredRank : null;

    if (ar !== null || br !== null) {
      if (ar === null) return 1;
      if (br === null) return -1;
      if (ar !== br) return ar - br;
    }

    const ad = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
    const bd = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
    return bd - ad;
  });

  const featuredStories = ordered.filter(isStoryFeatured);
  const nonFeaturedStories = ordered.filter((story) => !isStoryFeatured(story));

  const primary = featuredStories[0] || ordered[0];
  const secondaryFeatured =
    featuredStories.length > 0
      ? featuredStories.slice(1, 3)
      : ordered.slice(1, 3);

  const archive =
    featuredStories.length > 0 ? nonFeaturedStories : ordered.slice(3);

  return (
    <div className="stories-soft-enter">
      <section id="featured-story" className="mt-12 max-w-6xl scroll-mt-24">
        <div className="mb-5 flex items-center gap-4">
          <p className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Featured stories
          </p>
          <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-brown)]/20 to-transparent" />
        </div>

        {primary ? (
          <div
            className={[
              "grid gap-5",
              secondaryFeatured.length > 0
                ? "lg:grid-cols-[1.16fr_0.84fr] lg:items-start"
                : "",
            ].join(" ")}
          >
            <PrimaryStoryCard story={primary} />

            {secondaryFeatured.length > 0 ? (
              <div className="grid gap-5">
                {secondaryFeatured.map((story) => (
                  <SupportingFeaturedCard key={story.id} story={story} />
                ))}
              </div>
            ) : null}
          </div>
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
      </section>

      {carouselImages.length > 0 ? (
        <section
          id="work-in-motion"
          className="mt-12 max-w-6xl scroll-mt-24 stories-soft-enter-gallery"
        >
          <StoryGalleryCarousel images={carouselImages} />
        </section>
      ) : null}

      <section
        id="story-archive"
        className="mt-14 max-w-6xl scroll-mt-24 border-t border-black/10 pt-12 stories-soft-enter-archive"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
              All stories
            </h2>
            <p className="mt-2 max-w-3xl font-body text-neutral-700">
              Non-featured stories are kept here as a compact archive, so the page stays calm
              while the featured stories and gallery wall carry the visual rhythm.
            </p>
          </div>

          <Link
            href="mailto:enquiries.rangbheeni@gmail.com"
            className="font-body text-sm font-semibold text-[var(--color-primary)] hover:underline"
          >
            Inquire about stories
          </Link>
        </div>

        {archive.length > 0 ? (
          archive.length <= 6 ? (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {archive.map((story, index) => (
                <StoryTile key={story.id} story={story} index={index} />
              ))}
            </div>
          ) : (
            <div className="mt-7 border-t border-black/10">
              {archive.map((story) => (
                <ArchiveRow key={story.id} story={story} />
              ))}
            </div>
          )
        ) : ordered.length > 0 ? (
          <p className="py-6 font-body text-neutral-700">
            All published stories are currently featured above.
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default function StoriesPage() {
  return (
    <PageBackground variant="paper">
      <main className="relative min-h-screen overflow-x-hidden bg-[#efeeea] text-[var(--color-brown)]">
        <DenimTexture opacity="soft" />

        <PageContentReveal className="relative z-10 pb-20 pl-24 pr-8 pt-28 md:pl-52 md:pr-20 lg:pl-72">
          <section className="max-w-6xl">
            <PageHeroReveal
              eyebrow="Our Stories"
              title="Stories of cloth, craft, care, and community."
              description="A curated view into Rangbheeni’s work with women, upcycled textiles, community engagement, and climate-conscious livelihoods."
            />
          </section>

          <Suspense fallback={<StoriesContentFallback />}>
            <StoriesContent />
          </Suspense>
        </PageContentReveal>
      </main>
    </PageBackground>
  );
}
