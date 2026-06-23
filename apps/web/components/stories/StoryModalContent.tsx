import Link from "next/link";
import type { StoryDto, StorySection } from "@rangbheeni/shared-types";
import StoryShareButton from "@/components/stories/StoryShareButton";

const MAX_STORY_WORDS = 950;

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

function limitWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return text.trim();
  return `${words.slice(0, maxWords).join(" ")}…`;
}

function limitBlocksByWords(blocks: TextBlock[], maxWords: number) {
  let remaining = maxWords;
  const limited: TextBlock[] = [];

  for (const block of blocks) {
    if (remaining <= 0) break;

    const words = block.text.trim().split(/\s+/).filter(Boolean);
    if (!words.length) continue;

    const text = words.length > remaining
      ? `${words.slice(0, remaining).join(" ")}…`
      : block.text.trim();

    limited.push({ ...block, text });
    remaining -= Math.min(words.length, remaining);
  }

  return limited;
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

  const source = blocks.length ? blocks : story.excerpt ? [{ type: "p", text: story.excerpt }] as TextBlock[] : [];
  return limitBlocksByWords(source, MAX_STORY_WORDS);
}

function textWithDropCap(text: string, index: number) {
  if (index !== 0 || !text) return text;

  return (
    <>
      <span className="float-left mr-2 mt-1 font-heading text-6xl font-bold leading-[0.85] text-[var(--color-brown)]">
        {text.slice(0, 1)}
      </span>
      {text.slice(1)}
    </>
  );
}

function StoryFigure({ image, index }: { image: StoryImage; index: number }) {
  const labels = ["Main image", "Second image", "Third image", "Fourth image"];

  return (
    <figure className="my-7 break-inside-avoid border-y border-black/25 py-3">
      <div className="overflow-hidden border border-black/15 bg-[#d8ccb5] p-1">
        <img
          src={image.url}
          alt={image.alt}
          className="max-h-[380px] w-full object-cover grayscale-[0.1] contrast-[1.04]"
        />
      </div>

      <figcaption className="mt-2 flex flex-col gap-1 border-t border-black/15 pt-2 font-body text-[11px] leading-5 text-neutral-600 md:flex-row md:items-center md:justify-between">
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
              <blockquote className="my-7 border-y border-black/25 py-5 font-quote text-xl leading-9 text-[var(--color-brown)] md:text-2xl">
                “{block.text}”
              </blockquote>
            ) : block ? (
              <p className="mb-5 font-body text-[16px] leading-8 text-neutral-800 md:text-[17px] md:leading-9">
                {textWithDropCap(block.text, index)}
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
        "relative overflow-hidden bg-[#f4eddd] text-[var(--color-brown)]",
        modal
          ? "max-h-[calc(100vh-2rem)] w-[min(760px,calc(100vw-1.5rem))] rounded-[0.45rem] shadow-[0_28px_90px_rgba(69,44,23,0.24)]"
          : "min-h-screen",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.32] mix-blend-multiply"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(69,44,23,0.12) 1px, transparent 0), linear-gradient(rgba(69,44,23,0.04) 1px, transparent 1px)",
          backgroundSize: "7px 7px, 100% 28px",
        }}
      />

      <div
        className={[
          "relative overflow-y-auto",
          modal ? "max-h-[calc(100vh-2rem)]" : "min-h-screen",
        ].join(" ")}
      >
        <div className={modal ? "px-5 py-5 md:px-9 md:py-8" : "px-6 py-28 md:px-16 lg:px-24"}>
          <div className="sticky top-0 z-20 -mx-5 -mt-5 mb-6 flex justify-end border-b border-black/25 bg-[#f4eddd]/96 px-5 py-3 backdrop-blur md:-mx-9 md:-mt-8 md:px-9">
            <div className="flex items-center gap-2">
              <StoryShareButton slug={story.slug} />

              <Link
                href="/stories"
                aria-label="Close story"
                title="Close story"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 bg-[#fbf7ec]/80 text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
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

          <header className="mx-auto max-w-3xl border-y-[3px] border-double border-black/40 py-7">
            <h1 className="mx-auto max-w-3xl text-center font-heading text-4xl font-bold leading-[1.02] tracking-tight text-[var(--color-brown)] md:text-5xl">
              {story.title}
            </h1>

            <p className="mt-4 border-t border-black/20 pt-3 text-right font-body text-xs uppercase tracking-[0.22em] text-neutral-600">
              {formatDate(story.publishedDate)}
            </p>

            {story.excerpt ? (
              <p className="mx-auto mt-5 max-w-2xl border-t border-black/20 pt-4 text-center font-body text-base leading-8 text-neutral-800">
                {limitWords(story.excerpt, 70)}
              </p>
            ) : null}
          </header>

          <section className="mx-auto mt-8 max-w-3xl pb-8">
            <StoryBody story={story} images={images} />
          </section>
        </div>
      </div>
    </article>
  );
}
