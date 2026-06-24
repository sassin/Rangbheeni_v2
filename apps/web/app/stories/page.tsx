import Link from "next/link";
import type { StoryDto } from "@rangbheeni/shared-types";
import { getStories } from "@/lib/api";
import PageBackground from "@/components/layout/PageBackground";

export const dynamic = "force-dynamic";

function formatDate(iso?: string | null) {
  if (!iso) return "";

  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

function getStoryImage(story: StoryDto) {
  if (story.coverImage?.url) return story.coverImage.url;

  const imageBlock = story.blocks?.find((block) => block.type === "image" && block.image?.url);
  return imageBlock?.image?.url || "";
}

function getFirstReadableParagraph(story: StoryDto) {
  const block = story.blocks?.find((item) => {
    if (item.type !== "paragraph" && item.type !== "quote") return false;
    return typeof item.text === "string" && item.text.trim().length > 0;
  });

  return block?.text?.trim() || story.excerpt || story.title;
}

function storyPreview(story: StoryDto) {
  return {
    slug: story.slug,
    title: story.title,
    excerpt: getFirstReadableParagraph(story),
    coverImage: getStoryImage(story),
    featured: story.featured,
    publishedDate: story.publishedDate ?? undefined,
  };
}

function StoryCard({
  story,
  large = false,
}: {
  story: ReturnType<typeof storyPreview>;
  large?: boolean;
}) {
  return (
    <Link
      href={`/stories/${story.slug}`}
      className={[
        "group overflow-hidden rounded-2xl border bg-white shadow-sm transition",
        "hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md",
        large ? "border-[var(--color-lightgreen)]/25" : "border-black/5",
      ].join(" ")}
    >
      <div
        className={[
          "w-full bg-[var(--color-cream)] bg-cover bg-center",
          large ? "h-56" : "h-44",
        ].join(" ")}
        style={story.coverImage ? { backgroundImage: `url(${story.coverImage})` } : undefined}
        aria-label={story.title}
        role="img"
      />

      <div className={large ? "p-6" : "p-5"}>
        {story.publishedDate ? (
          <div className="font-body text-xs text-neutral-500">
            {formatDate(story.publishedDate)}
          </div>
        ) : null}

        <h3
          className={[
            "mt-1 font-heading font-bold text-[var(--color-brown)] transition",
            "group-hover:text-[var(--color-primary)]",
            large ? "text-xl" : "text-lg",
          ].join(" ")}
        >
          {story.title}
        </h3>

        <p className="mt-2 line-clamp-3 font-body text-sm leading-relaxed text-neutral-700">
          {story.excerpt}
        </p>

        <div className="mt-4 font-body text-sm font-semibold text-[var(--color-primary)]">
          {large ? "Read story →" : "Read →"}
        </div>
      </div>
    </Link>
  );
}

export default async function StoriesPage() {
  const stories = await getStories().catch(() => []);

  const all = stories
    .map(storyPreview)
    .sort((a, b) => {
      const da = a.publishedDate ? new Date(a.publishedDate).getTime() : 0;
      const db = b.publishedDate ? new Date(b.publishedDate).getTime() : 0;
      return db - da;
    });

  const featured = all.filter((story) => story.featured);
  const rest = all.filter((story) => !story.featured);

  return (
    <PageBackground variant="jute">
      <main className="mx-auto max-w-6xl px-6 pb-12 pt-28">
        <header>
          <p className="font-body text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
            Our Stories
          </p>

          <h1 className="mt-3 font-heading text-3xl font-bold text-[var(--color-brown)] md:text-5xl">
            Stories
          </h1>

          <p className="mt-4 max-w-3xl font-body text-lg leading-relaxed text-neutral-800 md:text-xl">
            Real work. Real people. Real climate action—where textile waste becomes livelihoods and dignity.
          </p>

          <div className="mt-5 h-1 w-32 rounded-full bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-lightgreen)] to-[var(--color-accentblue)]" />
        </header>

        {featured.length > 0 ? (
          <section className="mt-12">
            <h2 className="font-heading text-2xl font-bold text-[var(--color-brown)] md:text-3xl">
              Featured
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {featured.slice(0, 4).map((story) => (
                <StoryCard key={story.slug} story={story} large />
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-14">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-heading text-2xl font-bold text-[var(--color-brown)] md:text-3xl">
              All stories
            </h2>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {(rest.length ? rest : all).map((story) => (
              <StoryCard key={story.slug} story={story} />
            ))}
          </div>
        </section>
      </main>
    </PageBackground>
  );
}
