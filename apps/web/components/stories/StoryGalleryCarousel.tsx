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

const SESSION_START_KEY = "rangbheeni-gallery-scatter-v1";
const ROTATE_MS = 7600;

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

  const [activeIndex, setActiveIndex] = useState(0);
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

  const scatterImages = useMemo(() => {
    if (!orderedImages.length) return [];

    return Array.from({ length: Math.min(6, orderedImages.length) }, (_, index) =>
      circularItem(orderedImages, activeIndex + index)
    );
  }, [activeIndex, orderedImages]);

  const preloadImages = useMemo(() => {
    if (!orderedImages.length) return [];

    return Array.from({ length: Math.min(4, orderedImages.length) }, (_, index) =>
      circularItem(orderedImages, activeIndex + scatterImages.length + index)
    );
  }, [activeIndex, orderedImages, scatterImages.length]);

  useEffect(() => {
    if (!orderedImages.length) return;
    setActiveIndex(randomStart(orderedImages.length));
  }, [orderedImages.length]);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.18, rootMargin: "140px 0px" }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    const urls = [...scatterImages, ...preloadImages]
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
  }, [loadedUrls, preloadImages, scatterImages, visible]);

  useEffect(() => {
    if (reduceMotion || paused || !visible || orderedImages.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % orderedImages.length);
    }, ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [orderedImages.length, paused, reduceMotion, visible]);

  if (!scatterImages.length) return null;

  return (
    <section
      ref={rootRef}
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="mb-4 flex items-center gap-4">
        <p className="font-body text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">
          Gallery wall
        </p>
        <div className="h-px flex-1 bg-gradient-to-r from-[var(--color-brown)]/20 to-transparent" />
      </div>

      <div className="relative min-h-[430px] overflow-hidden rounded-[1.8rem] md:min-h-[500px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-[8%] top-[8%] h-56 w-56 rounded-full bg-[var(--color-primary)]/8 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[10%] right-[4%] h-64 w-64 rounded-full bg-[var(--color-brown)]/8 blur-3xl"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-8 top-1/2 h-px bg-gradient-to-r from-transparent via-[var(--color-brown)]/14 to-transparent"
        />

        {scatterImages.map((image, index) => (
          <ScatteredPhoto
            key={`${index}-${image.id}`}
            image={image}
            index={index}
            reduceMotion={reduceMotion}
            loadedUrls={loadedUrls}
            setLoadedUrls={setLoadedUrls}
            priority={index === 0}
          />
        ))}

        {orderedImages.length > 1 ? (
          <div className="absolute bottom-2 left-1/2 z-50 flex -translate-x-1/2 gap-1.5 rounded-full border border-black/5 bg-white/40 px-3 py-2 shadow-sm backdrop-blur">
            {orderedImages.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={[
                  "h-1.5 rounded-full transition-all duration-500",
                  index === activeIndex
                    ? "w-9 bg-[var(--color-primary)]"
                    : "w-2 bg-[var(--color-brown)]/20 hover:bg-[var(--color-brown)]/45",
                ].join(" ")}
                aria-label={`Show gallery image ${image.sortOrder}`}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ScatteredPhoto({
  image,
  index,
  reduceMotion,
  loadedUrls,
  setLoadedUrls,
  priority = false,
}: {
  image: StoryGalleryCarouselImage;
  index: number;
  reduceMotion: boolean;
  loadedUrls: Set<string>;
  setLoadedUrls: React.Dispatch<React.SetStateAction<Set<string>>>;
  priority?: boolean;
}) {
  const frameClass = [
    "absolute overflow-hidden border border-white/70 bg-white/40 shadow-[0_18px_45px_rgba(72,49,29,0.16)] backdrop-blur-[1px]",
    index === 0
      ? "left-[4%] top-[5%] z-40 w-[56%] rotate-[-1.4deg] rounded-[1.55rem] md:w-[49%]"
      : "",
    index === 1
      ? "right-[6%] top-[10%] z-30 w-[33%] rotate-[2.1deg] rounded-[1.35rem] md:w-[29%]"
      : "",
    index === 2
      ? "bottom-[13%] right-[12%] z-35 w-[40%] rotate-[-2deg] rounded-[1.45rem] md:w-[34%]"
      : "",
    index === 3
      ? "bottom-[8%] left-[18%] z-20 w-[30%] rotate-[2.8deg] rounded-[1.25rem] opacity-90 md:w-[24%]"
      : "",
    index === 4
      ? "right-[35%] top-[0%] z-10 hidden w-[23%] rotate-[4deg] rounded-[1.15rem] opacity-75 md:block"
      : "",
    index === 5
      ? "bottom-[1%] right-[2%] z-10 hidden w-[22%] rotate-[-3.4deg] rounded-[1.15rem] opacity-70 md:block"
      : "",
  ].join(" ");

  const imageAspect =
    index === 0
      ? "aspect-[4/3]"
      : index === 1
        ? "aspect-[4/5]"
        : index === 2
          ? "aspect-[5/4]"
          : "aspect-[1/1]";

  return (
    <motion.figure
      layout
      className={frameClass}
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 22,
              scale: 0.96,
              filter: "blur(8px)",
            }
      }
      animate={{
        opacity: index >= 4 ? 0.72 : index === 3 ? 0.9 : 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
      }}
      transition={{
        duration: 0.95,
        delay: index * 0.04,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={`${index}-${image.id}`}
          src={image.url}
          alt={image.altText || image.hoverText || "Rangbheeni work image"}
          className={["h-full w-full object-cover", imageAspect].join(" ")}
          loading={priority || loadedUrls.has(image.url) ? "eager" : "lazy"}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 1.04,
                }
          }
          animate={{
            opacity: 1,
            scale: 1,
          }}
          exit={
            reduceMotion
              ? undefined
              : {
                  opacity: 0,
                  scale: 0.985,
                }
          }
          transition={{
            duration: 1.25,
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

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/14 via-transparent to-white/10" />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-[linear-gradient(100deg,transparent_0%,rgba(255,250,240,0.34)_48%,transparent_100%)]"
        initial={reduceMotion ? false : { x: "-140%" }}
        animate={reduceMotion ? undefined : { x: "230%" }}
        transition={{
          duration: 1.3,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </motion.figure>
  );
}
