"use client";

import { useEffect, useMemo, useState } from "react";

export type StoryGalleryCarouselImage = {
  id: string;
  url: string;
  altText?: string | null;
  hoverText?: string | null;
  sortOrder: number;
};

export default function StoryGalleryCarousel({
  images,
}: {
  images: StoryGalleryCarouselImage[];
}) {
  const [startSortOrder, setStartSortOrder] = useState<number | null>(null);

  const orderedImages = useMemo(
    () =>
      [...images]
        .filter((image) => image.url)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [images]
  );

  useEffect(() => {
    if (!orderedImages.length) return;

    const sortOrders = orderedImages.map((image) => image.sortOrder);
    const min = Math.min(...sortOrders);
    const max = Math.max(...sortOrders);
    const randomSortOrder = Math.floor(Math.random() * (max - min + 1)) + min;

    setStartSortOrder(randomSortOrder);
  }, [orderedImages]);

  const rotatedImages = useMemo(() => {
    if (!orderedImages.length) return [];

    const startIndex =
      startSortOrder === null
        ? 0
        : orderedImages.findIndex((image) => image.sortOrder >= startSortOrder);

    const safeStartIndex = startIndex >= 0 ? startIndex : 0;

    return [
      ...orderedImages.slice(safeStartIndex),
      ...orderedImages.slice(0, safeStartIndex),
    ];
  }, [orderedImages, startSortOrder]);

  if (!rotatedImages.length) return null;

  const marqueeImages = [...rotatedImages, ...rotatedImages];

  return (
    <div className="relative overflow-hidden py-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-body text-xs font-semibold uppercase tracking-[0.22em] text-[var(--color-primary)]">
            Rangbheeni in motion
          </p>
          <h2 className="mt-2 font-heading text-3xl font-bold text-[var(--color-brown)] md:text-4xl">
            Glimpses from our work
          </h2>
        </div>
      </div>

      <div className="group relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#f7efe1] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#f7efe1] to-transparent" />

        <div className="flex w-max gap-4 motion-safe:animate-[story-gallery-marquee_56s_linear_infinite] group-hover:[animation-play-state:paused]">
          {marqueeImages.map((image, index) => (
            <figure
              key={`${image.id}-${index}`}
              className="group/card relative h-56 w-72 shrink-0 overflow-hidden rounded-[1.35rem] border border-black/10 bg-white/60 shadow-sm md:h-64 md:w-96"
            >
              <img
                src={image.url}
                alt={image.altText || image.hoverText || "Rangbheeni gallery image"}
                className="h-full w-full object-cover transition duration-500 group-hover/card:scale-[1.04]"
                loading="lazy"
              />

              {image.hoverText ? (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-black/55 px-4 py-3 font-body text-sm leading-5 text-white transition duration-300 group-hover/card:translate-y-0">
                  {image.hoverText}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
