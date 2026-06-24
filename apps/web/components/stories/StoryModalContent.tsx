import Link from "next/link";
import type { StoryBlockDto, StoryDto } from "@rangbheeni/shared-types";
import StoryShareButton from "@/components/stories/StoryShareButton";

const MAX_STORY_WORDS = 1050;
const MAX_ARTICLE_IMAGES = 4;

type StoryImage = {
  url: string;
  alt: string;
  caption: string;
};

type ArticleItem =
  | { type: "image"; image: StoryImage }
  | { type: "p"; text: string }
  | { type: "quote"; text: string }
  | { type: "subheading"; text: string };

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

function takeWords(text: string, remaining: number) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length || remaining <= 0) return { text: "", used: 0 };

  if (words.length <= remaining) {
    return { text: text.trim(), used: words.length };
  }

  return {
    text: `${words.slice(0, remaining).join(" ")}…`,
    used: remaining,
  };
}

function getBlockText(block: StoryBlockDto) {
  return typeof block.text === "string" ? block.text.trim() : "";
}

function getBlockImage(block: StoryBlockDto): StoryImage | null {
  if (block.type !== "image" || !block.image?.url) return null;

  const caption = block.caption || block.image.altText || "";
  return {
    url: block.image.url,
    alt: block.altText || block.image.altText || caption || "Rangbheeni story image",
    caption,
  };
}

function buildArticleItems(story: StoryDto) {
  const items: ArticleItem[] = [];
  const seenImages = new Set<string>();
  let imageCount = 0;
  let wordsRemaining = MAX_STORY_WORDS;

  for (const block of story.blocks || []) {
    const image = getBlockImage(block);

    if (image && imageCount < MAX_ARTICLE_IMAGES && !seenImages.has(image.url)) {
      seenImages.add(image.url);
      imageCount += 1;
      items.push({ type: "image", image });
      continue;
    }

    const text = getBlockText(block);
    if (!text || wordsRemaining <= 0) continue;

    const limited = takeWords(text, wordsRemaining);
    if (!limited.text) continue;

    wordsRemaining -= limited.used;

    items.push({
      type:
        block.type === "quote"
          ? "quote"
          : block.type === "subheading"
            ? "subheading"
            : "p",
      text: limited.text,
    });
  }

  if (!items.some((item) => item.type === "image") && story.coverImage?.url) {
    items.unshift({
      type: "image",
      image: {
        url: story.coverImage.url,
        alt: story.coverImage.altText || story.title,
        caption: story.coverImage.altText || "",
      },
    });
  }

  if (!items.some((item) => item.type === "p" || item.type === "quote") && story.excerpt) {
    items.push({ type: "p", text: limitWords(story.excerpt, MAX_STORY_WORDS) });
  }

  return items;
}

function textWithDropCap(text: string, index: number) {
  if (index !== 0 || !text) return text;

  return (
    <>
      <span className="float-left mr-2 mt-1 font-heading text-6xl font-bold leading-[0.82] text-[var(--color-brown)]">
        {text.slice(0, 1)}
      </span>
      {text.slice(1)}
    </>
  );
}

function StoryFigure({ image }: { image: StoryImage }) {
  return (
    <figure className="my-7 break-inside-avoid">
      <div className="overflow-hidden bg-[#d7cab2] p-[5px] shadow-[inset_0_0_22px_rgba(69,44,23,0.13),0_1px_0_rgba(69,44,23,0.18)]">
        <img
          src={image.url}
          alt={image.alt}
          className="max-h-[340px] w-full object-cover grayscale-[0.22] contrast-[1.08] sepia-[0.12]"
        />
      </div>

      {image.caption ? (
        <figcaption className="mt-2 font-body text-[11px] leading-5 text-neutral-600">
          {image.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function StoryBody({ story }: { story: StoryDto }) {
  const items = buildArticleItems(story);
  let paragraphIndex = 0;

  return (
    <div className="text-[var(--color-brown)]">
      {items.map((item, index) => {
        if (item.type === "image") {
          return <StoryFigure key={`${item.image.url}-${index}`} image={item.image} />;
        }

        if (item.type === "subheading") {
          return (
            <h2
              key={index}
              className="mb-4 mt-8 font-heading text-2xl font-bold leading-tight text-[var(--color-brown)]"
            >
              {item.text}
            </h2>
          );
        }

        if (item.type === "quote") {
          return (
            <blockquote
              key={index}
              className="my-7 px-4 font-quote text-xl leading-9 text-[var(--color-brown)] md:text-2xl"
            >
              “{item.text}”
            </blockquote>
          );
        }

        const currentParagraphIndex = paragraphIndex;
        paragraphIndex += 1;

        return (
          <p
            key={index}
            className="mb-5 font-body text-[16px] leading-8 text-neutral-800 md:text-[17px] md:leading-9"
          >
            {textWithDropCap(item.text, currentParagraphIndex)}
          </p>
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
  return (
    <article
      data-lenis-prevent
      data-lenis-prevent-wheel
      className={[
        "relative isolate bg-[#efe3c8] text-[var(--color-brown)]",
        modal
          ? "story-newspaper-scroll story-newspaper-paper max-h-[calc(100dvh-1.5rem)] w-[min(560px,calc(100vw-1rem))] overflow-y-auto overscroll-contain rounded-[0.35rem] shadow-[0_30px_100px_rgba(69,44,23,0.28)]"
          : "min-h-screen w-full",
      ].join(" ")}
    >
      <div
        className={[
          "relative z-10",
          modal
            ? "px-5 py-5 md:px-7 md:py-7"
            : "min-h-screen px-6 py-28 md:px-16 lg:px-24",
        ].join(" ")}
      >
        <div className="sticky top-3 z-30 mb-3 ml-auto flex w-fit items-center gap-2">
            <StoryShareButton slug={story.slug} />

            <Link
              href="/stories"
              aria-label="Close story"
              title="Close story"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f8efd9]/90 text-[var(--color-brown)] shadow-[0_1px_0_rgba(69,44,23,0.22),0_8px_24px_rgba(69,44,23,0.12)] transition hover:scale-105 hover:text-[var(--color-primary)] active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
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

        <div className="mx-auto max-w-[470px] text-center">
          <p className="font-heading text-2xl font-bold leading-none tracking-tight text-[var(--color-brown)] md:text-3xl">
            The Rangbheeni Chronicle
          </p>
        </div>

        <header className="mx-auto mt-8 max-w-[470px]">
          <h1 className="text-center font-heading text-4xl font-bold leading-[1.03] tracking-tight text-[var(--color-brown)] md:text-5xl">
            {story.title}
          </h1>

          <p className="mt-4 text-right font-body text-xs uppercase tracking-[0.22em] text-neutral-600">
            {formatDate(story.publishedDate)}
          </p>

          {story.excerpt ? (
            <p className="mx-auto mt-5 max-w-[450px] text-center font-body text-base leading-8 text-neutral-800">
              {limitWords(story.excerpt, 70)}
            </p>
          ) : null}
        </header>

        <section className="mx-auto mt-7 max-w-[470px] pb-12">
          <StoryBody story={story} />
        </section>
      </div>
    </article>
  );
}
