import Link from "next/link";
import type { StoryDto, StorySection } from "@rangbheeni/shared-types";
import StoryShareButton from "@/components/stories/StoryShareButton";

type StoryImage = {
  url: string;
  alt: string;
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
  return typeof value === "string" ? value : "";
}

function getSectionImage(section: StorySection): StoryImage | null {
  const raw = section as any;

  if (raw.type === "image" && typeof raw.url === "string") {
    return {
      url: raw.url,
      alt: typeof raw.alt === "string" ? raw.alt : "Rangbheeni story image",
    };
  }

  if (raw.image && typeof raw.image.url === "string") {
    return {
      url: raw.image.url,
      alt:
        typeof raw.image.alt === "string"
          ? raw.image.alt
          : "Rangbheeni story image",
    };
  }

  if (typeof raw.imageUrl === "string") {
    return {
      url: raw.imageUrl,
      alt: typeof raw.alt === "string" ? raw.alt : "Rangbheeni story image",
    };
  }

  return null;
}

function collectImages(story: StoryDto) {
  const images: StoryImage[] = [];

  if (story.coverImage?.url) {
    images.push({
      url: story.coverImage.url,
      alt: story.coverImage.altText || story.title,
    });
  }

  for (const section of story.sections || []) {
    const image = getSectionImage(section);
    if (image && !images.some((existing) => existing.url === image.url)) {
      images.push(image);
    }
  }

  return images.slice(0, 3);
}

function textSections(story: StoryDto) {
  return (story.sections || []).filter((section) => {
    const type = (section as any).type;
    return type === "p" || type === "quote" || typeof (section as any).text === "string";
  });
}

function RangRule() {
  return (
    <div className="my-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-black/15" />
      <div className="h-1.5 w-1.5 rounded-full bg-[var(--color-primary)]" />
      <div className="h-px flex-1 bg-black/15" />
    </div>
  );
}

function StoryFigure({
  image,
  placement,
}: {
  image: StoryImage;
  placement: "lead" | "left" | "right";
}) {
  const floatClass =
    placement === "left"
      ? "md:float-left md:mr-7"
      : "md:float-right md:ml-7";

  return (
    <figure
      className={[
        "float-none mb-5 mt-1 w-full overflow-hidden rounded-[1rem] border border-black/10 bg-[#e7ddc9] p-1 shadow-sm",
        floatClass,
        placement === "lead"
          ? "md:w-[42%] md:max-w-[360px]"
          : "md:w-[34%] md:max-w-[300px]",
      ].join(" ")}
    >
      <img
        src={image.url}
        alt={image.alt}
        className={[
          "w-full rounded-[0.75rem] object-cover grayscale-[0.08]",
          placement === "lead" ? "max-h-[340px]" : "max-h-[250px]",
        ].join(" ")}
      />
      <figcaption className="px-2 pb-1 pt-2 font-body text-[11px] leading-4 text-neutral-500">
        {image.alt}
      </figcaption>
    </figure>
  );
}

function StoryBody({ story, images }: { story: StoryDto; images: StoryImage[] }) {
  const sections = textSections(story);
  const secondaryImages = images.slice(1, 3);

  return (
    <div className="story-newspaper-body text-[var(--color-brown)]">
      {images[0] ? <StoryFigure image={images[0]} placement="lead" /> : null}

      {sections.map((section, index) => {
        const type = (section as any).type;
        const text = getSectionText(section);
        if (!text) return null;

        const imageToInsert =
          index === 2 ? secondaryImages[0] : index === 5 ? secondaryImages[1] : null;
        const placement = index === 2 ? "left" : "right";

        if (type === "quote") {
          return (
            <div key={index}>
              {imageToInsert ? (
                <StoryFigure image={imageToInsert} placement={placement as "left" | "right"} />
              ) : null}
              <blockquote className="my-6 border-y border-black/15 py-5 font-quote text-xl leading-9 text-[var(--color-brown)] md:text-2xl">
                “{text}”
              </blockquote>
            </div>
          );
        }

        return (
          <div key={index}>
            {imageToInsert ? (
              <StoryFigure image={imageToInsert} placement={placement as "left" | "right"} />
            ) : null}
            <p className="mb-5 font-body text-[16px] leading-8 text-neutral-800 md:text-[17px] md:leading-9">
              {text}
            </p>
          </div>
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
  const images = collectImages(story);

  return (
    <article
      className={[
        "relative overflow-hidden bg-[#efeeea] text-[var(--color-brown)]",
        modal
          ? "max-h-[calc(100vh-2rem)] w-[min(980px,calc(100vw-1.5rem))] rounded-[1.35rem] shadow-[0_28px_90px_rgba(69,44,23,0.24)]"
          : "min-h-screen",
      ].join(" ")}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-multiply"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(69,44,23,0.08) 6px), repeating-linear-gradient(90deg, transparent, transparent 7px, rgba(69,44,23,0.05) 8px)",
          backgroundSize: "8px 8px",
        }}
      />

      <div
        className={[
          "relative overflow-y-auto",
          modal ? "max-h-[calc(100vh-2rem)]" : "min-h-screen",
        ].join(" ")}
      >
        <div className={modal ? "px-5 py-5 md:px-9 md:py-8" : "px-6 py-28 md:px-16 lg:px-24"}>
          <div className="sticky top-0 z-10 -mx-5 -mt-5 mb-7 flex items-center justify-between gap-3 border-b border-black/10 bg-[#efeeea]/95 px-5 py-4 backdrop-blur md:-mx-9 md:-mt-8 md:px-9">
            <Link
              href="/stories"
              className="rounded-full border border-[var(--color-primary)]/35 bg-white/70 px-4 py-2 font-body text-sm font-semibold text-[var(--color-brown)] shadow-sm backdrop-blur transition hover:border-[var(--color-primary)] hover:bg-[var(--color-lightgreen)]/30 hover:text-[var(--color-primary)]"
            >
              Close
            </Link>

            <StoryShareButton slug={story.slug} />
          </div>

          <header className="mx-auto max-w-4xl text-center">
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

          <RangRule />

          <section className="mx-auto max-w-4xl pb-8">
            <StoryBody story={story} images={images} />
          </section>
        </div>
      </div>
    </article>
  );
}
