"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export type StoryGalleryCarouselImage = {
  id: string;
  url: string;
  altText?: string | null;
  hoverText?: string | null;
  sortOrder: number;
};

const SESSION_START_KEY = "rangbheeni-gallery-weave-start-v2";
const FRAME_SIZE = 4;
const FRAME_INTERVAL_MS = 3600;

function circularItem<T>(items: T[], index: number) {
  return items[((index % items.length) + items.length) % items.length];
}

function buildFrame(
  images: StoryGalleryCarouselImage[],
  startIndex: number
): StoryGalleryCarouselImage[] {
  if (!images.length) return [];

  const frame: StoryGalleryCarouselImage[] = [];
  const count = Math.min(FRAME_SIZE, images.length);

  for (let offset = 0; offset < count; offset += 1) {
    frame.push(circularItem(images, startIndex + offset));
  }

  return frame;
}

function getRandomStartIndex(images: StoryGalleryCarouselImage[]) {
  if (!images.length) return 0;

  const sortOrders = images.map((image) => image.sortOrder);
  const min = Math.min(...sortOrders);
  const max = Math.max(...sortOrders);

  let randomSortOrder: number | null = null;

  try {
    const stored = window.sessionStorage.getItem(SESSION_START_KEY);

    if (stored) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed)) randomSortOrder = parsed;
    }

    if (randomSortOrder === null) {
      randomSortOrder = Math.floor(Math.random() * (max - min + 1)) + min;
      window.sessionStorage.setItem(SESSION_START_KEY, String(randomSortOrder));
    }
  } catch {
    randomSortOrder = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const index = images.findIndex((image) => image.sortOrder >= randomSortOrder);
  return index >= 0 ? index : 0;
}

export default function StoryGalleryCarousel({
  images,
}: {
  images: StoryGalleryCarouselImage[];
}) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement | null>(null);

  const [startIndex, setStartIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(() => new Set());

  const orderedImages = useMemo(
    () =>
      [...images]
        .filter((image) => image.url)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [images]
  );

  const currentFrame = useMemo(
    () => buildFrame(orderedImages, startIndex),
    [orderedImages, startIndex]
  );

  const nextFrame = useMemo(
    () => buildFrame(orderedImages, startIndex + 1),
    [orderedImages, startIndex]
  );

  useEffect(() => {
    if (!orderedImages.length) return;
    setStartIndex(getRandomStartIndex(orderedImages));
  }, [orderedImages]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.25 }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !orderedImages.length) return;

    const urlsToPrepare = [...currentFrame, ...nextFrame]
      .map((image) => image?.url)
      .filter(Boolean) as string[];

    for (const url of urlsToPrepare) {
      if (loadedUrls.has(url)) continue;

      const image = new window.Image();
      image.onload = () => {
        setLoadedUrls((current) => {
          const next = new Set(current);
          next.add(url);
          return next;
        });
      };
      image.src = url;
    }
  }, [currentFrame, isVisible, loadedUrls, nextFrame, orderedImages.length]);

  useEffect(() => {
    if (
      reduceMotion ||
      paused ||
      !isVisible ||
      orderedImages.length <= 1
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setStartIndex((current) => {
        const next = (current + 1) % orderedImages.length;
        const frame = buildFrame(orderedImages, next);

        const ready = frame.every(
          (image) => !image?.url || loadedUrls.has(image.url)
        );

        return ready ? next : current;
      });
    }, FRAME_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [isVisible, loadedUrls, orderedImages, paused, reduceMotion]);

  if (!currentFrame.length) return null;

  const [large, tall, smallOne, smallTwo] = currentFrame;
  const caption =
    large?.hoverText ||
    tall?.hoverText ||
    smallOne?.hoverText ||
    smallTwo?.hoverText ||
    null;

  return (
    <section
      ref={rootRef}
      className="mx-auto mt-20 w-full max-w-5xl px-4 sm:mt-24 sm:px-6 lg:px-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-5 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-brown)]/25 to-transparent" />
        <p className="shrink-0 font-body text-[11px] font-semibold uppercase tracking-[0.26em] text-[var(--color-primary)]">
          Rangbheeni in motion
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[var(--color-brown)]/25 to-transparent" />
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#f8efdf]/70 p-3 shadow-sm backdrop-blur-sm md:p-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,rgba(111,78,45,0.55)_1px,transparent_0)] [background-size:14px_14px]"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18] [background-image:linear-gradient(90deg,rgba(140,91,47,0.25)_1px,transparent_1px),linear-gradient(0deg,rgba(72,113,91,0.2)_1px,transparent_1px)] [background-size:28px_28px]"
        />

        <div className="relative grid min-h-[360px] gap-3 md:min-h-[430px] md:grid-cols-[1.08fr_0.92fr]">
          <PatchFrame
            image={large}
            name="large"
            className="md:row-span-2"
            imageClassName="aspect-[4/3] md:h-full md:aspect-auto"
            loadedUrls={loadedUrls}
            setLoadedUrls={setLoadedUrls}
          />

          <PatchFrame
            image={tall}
            name="tall"
            className="hidden md:block"
            imageClassName="aspect-[16/10]"
            loadedUrls={loadedUrls}
            setLoadedUrls={setLoadedUrls}
          />

          <div className="grid grid-cols-2 gap-3">
            <PatchFrame
              image={smallOne}
              name="small-one"
              imageClassName="aspect-square"
              loadedUrls={loadedUrls}
              setLoadedUrls={setLoadedUrls}
            />

            <PatchFrame
              image={smallTwo}
              name="small-two"
              imageClassName="aspect-square"
              loadedUrls={loadedUrls}
              setLoadedUrls={setLoadedUrls}
            />
          </div>
        </div>

        {caption ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={caption}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-3 inline-flex max-w-xl rounded-full border border-white/70 bg-white/65 px-4 py-2 font-body text-xs leading-5 text-[var(--color-brown)] shadow-sm"
            >
              {caption}
            </motion.div>
          </AnimatePresence>
        ) : null}

        {orderedImages.length > 1 ? (
          <div className="relative mt-4 flex justify-center gap-1.5">
            {orderedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setStartIndex(index)}
                className={[
                  "h-1.5 rounded-full transition-all duration-500",
                  index === startIndex
                    ? "w-8 bg-[var(--color-primary)]"
                    : "w-2 bg-[var(--color-brown)]/20 hover:bg-[var(--color-brown)]/45",
                ].join(" ")}
                aria-label={`Show gallery image group ${image.sortOrder}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function PatchFrame({
  image,
  name,
  className = "",
  imageClassName,
  loadedUrls,
  setLoadedUrls,
}: {
  image?: StoryGalleryCarouselImage;
  name: string;
  className?: string;
  imageClassName: string;
  loadedUrls: Set<string>;
  setLoadedUrls: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  if (!image) return null;

  return (
    <figure
      className={[
        "relative overflow-hidden rounded-[1.35rem] border border-white/70 bg-white/45 shadow-sm",
        className,
      ].join(" ")}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={`${name}-${image.id}`}
          src={image.url}
          alt={image.altText || image.hoverText || "Rangbheeni gallery image"}
          className={[
            "h-full w-full object-cover",
            imageClassName,
          ].join(" ")}
          loading={loadedUrls.has(image.url) ? "eager" : "lazy"}
          initial={{ opacity: 0, scale: 1.035, filter: "blur(6px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.99, filter: "blur(3px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          onLoad={() => {
            setLoadedUrls((current) => {
              const next = new Set(current);
              next.add(image.url);
              return next;
            });
          }}
        />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/12 via-transparent to-white/10" />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0_8px,transparent_8px_16px)] opacity-70"
      />
    </figure>
  );
}
