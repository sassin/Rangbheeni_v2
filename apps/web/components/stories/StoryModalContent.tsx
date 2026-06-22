import Link from "next/link";
import type { StoryDto, StorySection } from "@rangbheeni/shared-types";
import StoryShareButton from "@/components/stories/StoryShareButton";

type StoryImage = {
  url: string;
  alt: string;
  caption: string;
};

type TextBlock = {
  type: "p" | "quote";
  text: string;
};

function formatDate(value?: string | null) {
  if (!value) return "Rangbheeni story";

  const dt = new Date(value);
  if (Number.isNaN(dt.getTime())) return value;

  return dt.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getSectionText(section: StorySection) {
  const value = (section as any).text;
  return typeof value === "string" ? value.trim() : "";
}

function getSectionImage(section: StorySection): StoryImage | null {
  const raw = section as any;

  const caption =
    typeof raw.caption === "string"
      ? raw.caption
      : typeof raw.alt === "string"
        ? raw.alt
        : "Rangbheeni story image";

  if (raw.type === "image" && typeof raw.url === "string") {
    return {
      url: raw.url,
      alt: typeof raw.alt === "string" ? raw.alt : caption,
      caption,
    };
  }

  if (raw.image && typeof raw.image.url === "string") {
    return {
      url: raw.image.url,
      alt: typeof raw.image.alt === "string" ? raw.image.alt : caption,
      caption: typeof raw.image.caption === "string" ? raw.image.caption : caption,
    };
  }

  if (typeof raw.imageUrl === "string") {
    return {
      url: raw.imageUrl,
      alt: typeof raw.alt === "string" ? raw.alt : caption,
      caption,
    };
  }

  return null;
}

function collectArticleImages(story: StoryDto) {
  const images: StoryImage[] = [];

  for (const section of story.sections || []) {
    const image = getSectionImage(section);
    if (image && !images.some((existing) => existing.url === image.url)) {
      images.push(image);
    }
  }

  // Article images are separate from thumbnail/cover when present.
  // If no article image exists, the cover image is used as a safe fallback.
  if (!images.length && story.coverImage?.url) {
    images.push({
      url: story.coverImage.url,
      alt: story.coverImage.altText || story.title,
      caption: story.coverImage.altText || story.title,
    });
  }

  return images.slice(0, 4);
}

function textBlocks(story: StoryDto): TextBlock[] {
  const blocks = (story.sections || [])
    .map((section) => {
      const raw = section as any;
      const text = getSectionText(section);
      if (!text) return null;

      return {
        type: raw.type === "quote" ? "quote" : "p",
        text,
      } as TextBlock;
    })
    .filter(Boolean) as TextBlock[];

  if (blocks.length) return blocks;
  return story.excerpt ? [{ type: "p", text: story.excerpt }] : [];
}

function StoryFigure({ image, index }: { image: StoryImage; index: number }) {
  const labels = ["Main image", "Second image", "Third image", "Fourth image"];

  return (
    <figure className="my-7 break-inside-avoid overflow-hidden border-y border-black/20 bg-[#efe6d3] py-3">
      <div className="overflow-hidden bg-[#ded2bb]">
        <img
          src={image.url}
          alt={image.alt}
          className="max-h-[420px] w-full object-cover grayscale-[0.05] contrast-[1.02]"
        />
      </div>
      <figcaption className="mt-2 flex flex-col gap-1 border-t border-black/10 pt-2 font-body text-[11px] leading-5 text-neutral-600 md:flex-row md:items-center md:justify-between">
        <span>{image.caption}</span>
        <span className="uppercase tracking-[0.18em] text-[var(--color-primary)]">
          {labels[index] || "Story image"}
        </span>
      </figcaption>
    </figure>
  );
}

function StoryBody({ story, images }: { story: StoryDto; images: StoryImage[] }) {
  const blocks = textBlocks(story);
  const max = Math.max(blocks.length, images.length);

  return (
    <div className="text-[var(--color-brown)]">
      {Array.from({ length: max }).map((_, index) => {
        const image = images[index];
        const block = blocks[index];

        return (
          <section key={index} className="break-inside-avoid">
            {image ? <StoryFigure image={image} index={index} /> : null}

            {block?.type === "quote" ? (
              <blockquote className="my-7 border-y border-black/25 py-5 font-heading text-2xl font-bold leading-9 text-[var(--color-brown)] md:text-3xl">
                “{block.text}”
              </blockquote>
            ) : block ? (
              <p className="mb-5 font-body text-[16px] leading-8 text-neutral-850 md:text-[17px] md:leading-9">
                {block.text}
              </p>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}

export default function StoryModalContent({
  story,
  modal = false,
}: {
  story: StoryDto;
  modal?: boolean;
}) {
  const images = collectArticleImages(story);

  return (
    <article
      className={[
        "relative overflow-hidden bg-[#f1eadb] text-[var(--color-brown)]",
        modal
          ? "max-h-[calc(100vh-2rem)] w-[min(980px,calc(100vw-1.5rem))] rounded-[1.1rem] shadow-[0_28px_90px_rgba(69,44,23,0.24)]"
          : "min-h-screen",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18] mix-blend-multiply"
        style={{
          backgroundImage:
            "linear-gradient(rgba(69,44,23,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(69,44,23,0.035) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />

      <div
        className={[
          "relative overflow-y-auto",
          modal ? "max-h-[calc(100vh-2rem)]" : "min-h-screen",
        ].join(" ")}
      >
        <div className={modal ? "px-5 py-5 md:px-9 md:py-8" : "px-6 py-28 md:px-16 lg:px-24"}>
          <div className="sticky top-0 z-20 -mx-5 -mt-5 mb-6 flex items-center justify-between gap-3 border-b border-black/20 bg-[#f1eadb]/95 px-5 py-3 backdrop-blur md:-mx-9 md:-mt-8 md:px-9">
            <p className="font-heading text-sm font-bold uppercase tracking-[0.24em] text-[var(--color-brown)]">
              Rangbheeni Chronicle
            </p>

            <div className="flex items-center gap-2">
              <StoryShareButton slug={story.slug} />

              <Link
                href="/stories"
                aria-label="Close story"
                title="Close story"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/15 bg-[#fbf7ec]/85 text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <header className="mx-auto max-w-4xl border-y border-black/25 py-7 text-center">
            <p className="font-body text-xs uppercase tracking-[0.28em] text-[var(--color-primary)]">
              {formatDate(story.publishedDate)}
            </p>

            <h1 className="mt-4 font-heading text-4xl font-bold leading-[1.02] tracking-tight text-[var(--color-brown)] md:text-6xl">
              {story.title}
            </h1>

            {story.excerpt ? (
              <p className="mx-auto mt-5 max-w-3xl font-body text-base leading-8 text-neutral-800 md:text-lg">
                {story.excerpt}
              </p>
            ) : null}
          </header>

          <section className="mx-auto mt-8 max-w-4xl pb-8">
            <StoryBody story={story} images={images} />
          </section>
        </div>
      </div>
    </article>
  );
}
