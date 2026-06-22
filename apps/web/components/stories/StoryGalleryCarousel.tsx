"use client";

import { useEffect, useMemo, useState } from "react";

type StoryGalleryCarouselProps = {
  images: readonly string[];
};

const SESSION_KEY = "rangbheeni-story-gallery-start";

export default function StoryGalleryCarousel({ images }: StoryGalleryCarouselProps) {
  const safeImages = images.slice(0, 50);
  const [start, setStart] = useState(0);

  useEffect(() => {
    if (!safeImages.length) return;

    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing !== null) {
      const parsed = Number(existing);
      if (Number.isFinite(parsed)) {
        setStart(parsed % safeImages.length);
        return;
      }
    }

    const next = Math.floor(Math.random() * safeImages.length);
    window.sessionStorage.setItem(SESSION_KEY, String(next));
    setStart(next);
  }, [safeImages.length]);

  const ordered = useMemo(() => {
    if (!safeImages.length) return [];
    return [...safeImages.slice(start), ...safeImages.slice(0, start)];
  }, [safeImages, start]);

  const looped = [...ordered, ...ordered];

  function move(direction: -1 | 1) {
    if (!safeImages.length) return;

    const next = (start + direction + safeImages.length) % safeImages.length;
    window.sessionStorage.setItem(SESSION_KEY, String(next));
    setStart(next);
  }

  if (!safeImages.length) return null;

  return (
    <section className="mt-14 max-w-6xl border-y border-black/10 py-10">
      <div className="mb-6 flex items-end justify-between gap-6">
        <div>
          <p className="font-body text-xs uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Gallery
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
            Fragments of fabric, process, and place.
          </h2>
        </div>
      </div>

      <div className="group relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#efeeea] via-[#efeeea]/90 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#efeeea] via-[#efeeea]/90 to-transparent" />

        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Previous gallery photos"
          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/35 text-[var(--color-brown)] backdrop-blur-md transition hover:bg-white/70 hover:text-[var(--color-primary)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Next gallery photos"
          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-black/10 bg-white/35 text-[var(--color-brown)] backdrop-blur-md transition hover:bg-white/70 hover:text-[var(--color-primary)]"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
            <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="story-gallery-track flex w-max gap-4 py-2">
          {looped.map((src, index) => (
            <div
              key={`${src}-${index}`}
              className="h-44 w-64 shrink-0 overflow-hidden rounded-[1.35rem] border border-black/10 bg-[#e8dfcf] shadow-sm md:h-52 md:w-80"
            >
              <img
                src={src}
                alt=""
                className="h-full w-full object-cover grayscale-[0.08] transition duration-700 group-hover:grayscale-0"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .story-gallery-track {
          animation: storyGalleryMarquee 80s linear infinite;
        }

        .group:hover .story-gallery-track {
          animation-play-state: paused;
        }

        @keyframes storyGalleryMarquee {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </section>
  );
}
