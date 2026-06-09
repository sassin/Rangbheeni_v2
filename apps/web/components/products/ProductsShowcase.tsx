"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PRODUCT_CATEGORIES } from "@/content/collections/product-categories";
import type { Product, ProductCategory } from "@/types/home";

type DisplayCategory = ProductCategory | "all";

function normalizeCategory(category: string): ProductCategory {
  const c = (category || "").trim().toLowerCase();
  if (c === "bags" || c === "bag") return "bags";
  if (c === "accessories" || c === "accessory") return "accessories";
  if (c === "home utility" || c === "home-utility" || c === "home") return "home-utility";
  if (c === "jewellery" || c === "jewelry") return "jewellery";
  if (c === "stationery") return "stationery";
  return "other";
}

const easeCurve: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function ProductsShowcase({ products }: { products: Product[] }) {
  const [activeCategory, setActiveCategory] = useState<DisplayCategory>("all");
  const [viewMode, setViewMode] = useState<"carousel" | "grid">("carousel");
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const normalized = useMemo(
    () => products.map((product) => ({ ...product, _cat: normalizeCategory(product.category) })),
    [products],
  );

  const visibleProducts = useMemo(() => {
    if (activeCategory === "all") return normalized.filter((product) => product._cat !== "other");
    return normalized.filter((product) => product._cat === activeCategory);
  }, [activeCategory, normalized]);

  const activeLabel =
    activeCategory === "all"
      ? "Rangbheeni Collections"
      : PRODUCT_CATEGORIES.find((category) => category.key === activeCategory)?.label ?? "Products";

  const updateScrollButtons = () => {
    const element = scrollerRef.current;
    if (!element) return;
    const eps = 2;
    setCanScrollLeft(element.scrollLeft > eps);
    setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - eps);
  };

  const scrollByCard = (direction: "left" | "right") => {
    const element = scrollerRef.current;
    if (!element) return;
    const amount = Math.max(260, Math.floor(element.clientWidth * 0.88));
    element.scrollBy({ left: direction === "left" ? -amount : amount, behavior: "smooth" });
  };

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element) return;
    if (viewMode === "carousel") {
      element.scrollTo({ left: 0, behavior: "auto" });
      updateScrollButtons();
    }
  }, [activeCategory, viewMode]);

  useEffect(() => {
    const element = scrollerRef.current;
    if (!element || viewMode !== "carousel") return;

    updateScrollButtons();
    const onScroll = () => updateScrollButtons();
    const onResize = () => updateScrollButtons();

    element.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      element.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [viewMode, visibleProducts.length]);

  return (
    <section className="relative py-6">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.35 }}
        transition={{ duration: 0.55, ease: easeCurve }}
        className="max-w-3xl"
      >
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[var(--color-accentblue)] md:text-3xl">
          {activeLabel}
        </h2>
        <p className="mt-1 font-body text-[15px] leading-7 text-neutral-700">
          Explore handcrafted pieces across our collections.
        </p>
      </motion.div>

      <div className="mt-5 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <motion.button
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setActiveCategory("all");
            setViewMode("carousel");
          }}
          className={`shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold transition ${
            activeCategory === "all"
              ? "bg-[var(--color-accentblue)] text-white"
              : "bg-white/55 text-neutral-800 hover:bg-white"
          }`}
        >
          All
        </motion.button>

        {PRODUCT_CATEGORIES.filter((category) => category.key !== "other").map((category) => (
          <motion.button
            key={category.key}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setActiveCategory(category.key);
              setViewMode("carousel");
            }}
            className={`shrink-0 rounded-full px-4 py-2 font-body text-sm font-semibold transition ${
              activeCategory === category.key
                ? "bg-[var(--color-accentblue)] text-white"
                : "bg-white/55 text-neutral-800 hover:bg-white"
            }`}
          >
            {category.label}
          </motion.button>
        ))}
      </div>

      <div className="mt-8">
        {visibleProducts.length === 0 ? (
          <div className="font-body text-neutral-700">No products yet in this category.</div>
        ) : viewMode === "carousel" ? (
          <>
            <div className="relative">
              <button
                type="button"
                aria-label="Scroll left"
                onClick={() => scrollByCard("left")}
                disabled={!canScrollLeft}
                className={`absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition md:flex ${
                  canScrollLeft ? "text-neutral-900 hover:scale-105" : "cursor-not-allowed opacity-35"
                }`}
              >
                ←
              </button>

              <button
                type="button"
                aria-label="Scroll right"
                onClick={() => scrollByCard("right")}
                disabled={!canScrollRight}
                className={`absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition md:flex ${
                  canScrollRight ? "text-neutral-900 hover:scale-105" : "cursor-not-allowed opacity-35"
                }`}
              >
                →
              </button>

              <div
                ref={scrollerRef}
                className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-12"
              >
                {visibleProducts.map((product, index) => (
                  <motion.article
                    key={product.id}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    whileHover={{ y: -4 }}
                    className="group w-[78%] shrink-0 snap-start sm:w-[48%] lg:w-[32%]"
                  >
                    <div className="flex h-full flex-col">
                      <div className="relative overflow-hidden rounded-[1.75rem]">
                        <div className="h-[18rem] w-full bg-cover bg-center transition duration-700 group-hover:scale-[1.035]" style={{ backgroundImage: `url(${product.images[0] || ""})` }} role="img" aria-label={product.name} />
                        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(86,43,0,0.18),transparent_42%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18),transparent_22%)]" />
                      </div>

                      <div className="flex min-h-[136px] flex-col pt-4">
                        <h3 className="font-heading text-lg font-bold tracking-tight text-[var(--color-brown)]">{product.name}</h3>
                        <p className="mt-2 line-clamp-2 font-body text-sm leading-6 text-neutral-700">{product.short}</p>
                        <div className="mt-auto pt-3">
                          {product.storyTitle ? (
                            <p className="font-body text-xs tracking-[0.03em] text-neutral-600">
                              <span className="font-semibold text-[var(--color-primary)]">Story:</span> {product.storyTitle}
                            </p>
                          ) : (
                            <div className="h-[18px]" />
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end">
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode("grid")}
                className="font-body text-sm font-semibold text-[var(--color-accentblue)] underline underline-offset-4 transition hover:text-[var(--color-primary)]"
              >
                See all →
              </motion.button>
            </div>
          </>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCategory}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
              >
                {visibleProducts.map((product) => (
                  <motion.article key={product.id} whileHover={{ y: -4 }} transition={{ duration: 0.2 }} className="group flex h-full flex-col">
                    <div className="relative overflow-hidden rounded-[1.75rem]">
                      <div className="h-[18rem] w-full bg-cover bg-center transition duration-700 group-hover:scale-[1.03]" style={{ backgroundImage: `url(${product.images[0] || ""})` }} role="img" aria-label={product.name} />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(86,43,0,0.18),transparent_42%),radial-gradient(circle_at_18%_18%,rgba(255,255,255,0.18),transparent_22%)]" />
                    </div>
                    <div className="flex flex-1 flex-col pt-4">
                      <h3 className="font-heading text-lg font-bold tracking-tight text-[var(--color-brown)]">{product.name}</h3>
                      <p className="mt-2 font-body text-sm leading-6 text-neutral-700">{product.short}</p>
                      {product.story ? <p className="mt-4 font-body text-sm leading-7 text-neutral-700">{product.story}</p> : null}
                      <div className="mt-auto pt-4">
                        {product.artisan?.name ? (
                          <p className="font-body text-sm text-neutral-700">
                            <span className="font-semibold text-[var(--color-warmbrown)]">Artisan:</span> {product.artisan.name}
                            {product.artisan.location ? ` • ${product.artisan.location}` : ""}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>

            <div className="mt-6">
              <motion.button
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setViewMode("carousel")}
                className="font-body text-sm font-semibold text-[var(--color-accentblue)] underline underline-offset-4 transition hover:text-[var(--color-primary)]"
              >
                ← Back to swipe view
              </motion.button>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
