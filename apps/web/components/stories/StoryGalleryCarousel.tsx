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

const SESSION_START_KEY = "rangbheeni-gallery-reel-v1";
const ROTATE_MS = 6500;

function circularItem<T>(items: T[], index: number) {
  return items[((index % items.length) + items.length) % items.length];
}

function randomStart(length: number) {
  if (!length) return 0;

  try {
    const stored = window.sessionStorage.getItem(SESSION_START_KEY);
    if (stored) {
      const parsed = Number(stored);
      if (Number.isFinite(parsed)) return parsed % length;
    }

    const next = Math.floor(Math.random() * length);
    window.sessionStorage.setItem(SESSION_START_KEY, String(next));
    return next;
  } catch {
    return Math.floor(Math.random() * length);
  }
}

export default function StoryGalleryCarousel({
  images,
}: {
  images: StoryGalleryCarouselImage[];
}) {
  const reduceMotion = Boolean(useReducedMotion());
  const rootRef = useRef<HTMLElement | null>(null);

  const [startIndex, setStartIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(() => new Set());

  const orderedImages = useMemo(
    () =>
      [...images]
        .filter((image) => image.url)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [images]
  );

  const frame = useMemo(() => {
    if (!orderedImages.length) return [];

    return Array.from({ length: Math.min(4, orderedImages.length) }, (_, index) =>
      circularItem(orderedImages, startIndex + index)
    );
  }, [orderedImages, startIndex]);

  const preloadImages = useMemo(() => {
    if (!orderedImages.length) return [];

    return Array.from({ length: Math.min(3, orderedImages.length) }, (_, index) =>
      circularItem(orderedImages, startIndex + frame.length + index)
    );
  }, [orderedImages, startIndex, frame.length]);

  useEffect(() => {
    if (!orderedImages.length) return;
    setStartIndex(randomStart(orderedImages.length));
  }, [orderedImages.length]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.18, rootMargin: "120px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const urls = [...frame, ...preloadImages]
      .map((image) => image?.url)
      .filter(Boolean) as string[];

    for (const url of urls) {
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
  }, [frame, loadedUrls, preloadImages, visible]);

  useEffect(() => {
    if (reduceMotion || paused || !visible || orderedImages.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setStartIndex((current) => (current + 1) % orderedImages.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [orderedImages.length, paused, reduceMotion, visible]);

  if (!frame.length) return null;

  const [mainImage, ...reelImages] = frame;

  return (
    <section
      ref={rootRef}
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-5 flex items-center gap-4">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Gallery wall
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-brown)]/20 to-transparent" />
      </div>

      <div className="relative overflow-hidden rounded-[1.8rem] border border-black/10 bg-white/35 p-2 shadow-sm backdrop-blur">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(90deg,rgba(108,73,37,0.32)_1px,transparent_1px),linear-gradient(0deg,rgba(68,104,83,0.20)_1px,transparent_1px)] [background-size:18px_18px]"
        />

        <div className="relative grid gap-2 lg:grid-cols-[1.45fr_0.85fr]">
          <GalleryImageFrame
            image={mainImage}
            reduceMotion={reduceMotion}
            loadedUrls={loadedUrls}
            setLoadedUrls={setLoadedUrls}
            className="h-[310px] sm:h-[360px] lg:h-[420px]"
            imageClassName="object-cover"
            priority
          />

          <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {reelImages.map((image, index) => (
              <GalleryImageFrame
                key={`${image.id}-${index}`}
                image={image}
                reduceMotion={reduceMotion}
                loadedUrls={loadedUrls}
                setLoadedUrls={setLoadedUrls}
                className="h-[140px] sm:h-[150px] lg:h-[calc((420px-16px)/3)]"
                imageClassName="object-cover"
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function GalleryImageFrame({
  image,
  reduceMotion,
  loadedUrls,
  setLoadedUrls,
  className,
  imageClassName,
  priority = false,
  delay = 0,
}: {
  image?: StoryGalleryCarouselImage;
  reduceMotion: boolean;
  loadedUrls: Set<string>;
  setLoadedUrls: React.Dispatch<React.SetStateAction<Set<string>>>;
  className: string;
  imageClassName: string;
  priority?: boolean;
  delay?: number;
}) {
  if (!image) return null;

  return (
    <figure
      className={[
        "group relative overflow-hidden rounded-[1.35rem] border border-white/55 bg-white/35 shadow-sm",
        className,
      ].join(" ")}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={image.id}
          src={image.url}
          alt={image.altText || image.hoverText || "Rangbheeni work image"}
          className={["absolute inset-0 h-full w-full", imageClassName].join(" ")}
          loading={priority || loadedUrls.has(image.url) ? "eager" : "lazy"}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 1.025,
                  filter: "blur(5px)",
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
            filter: "blur(0px)",
          }}
          exit={
            reduceMotion
              ? undefined
              : {
                  opacity: 0,
                  scale: 0.995,
                  filter: "blur(3px)",
                }
          }
          transition={{
            duration: 1.15,
            delay,
            ease: [0.22, 1, 0.36, 1],
          }}
          onLoad={() => {
            setLoadedUrls((current) => {
              const next = new Set(current);
              next.add(image.url);
              return next;
            });
          }}
        />
      </AnimatePresence>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/18 via-transparent to-white/8" />

      {image.hoverText ? (
        <div className="absolute inset-x-3 bottom-3 translate-y-2 rounded-full border border-white/50 bg-white/70 px-3 py-1.5 font-body text-[10px] leading-4 text-[var(--color-brown)] opacity-0 shadow-sm backdrop-blur-md transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {image.hoverText}
        </div>
      ) : null}
    </figure>
  );
}
