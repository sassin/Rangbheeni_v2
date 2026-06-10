"use client";

import { useEffect } from "react";

type ProductDto = {
  category?: { key?: string | null; label?: string | null } | null;
  images?: Array<{ url?: string | null }>;
};

const CONTENT_API = process.env.NEXT_PUBLIC_CONTENT_API_URL;

function categoryKey(product: ProductDto) {
  return (product.category?.key || product.category?.label || "other").toLowerCase();
}

function preloadImage(url: string) {
  const img = new Image();
  img.decoding = "async";
  img.src = url;
}

export default function ProductCategoryImagePreloader() {
  useEffect(() => {
    if (!CONTENT_API) return;

    const run = async () => {
      try {
        const response = await fetch(`${CONTENT_API}/public/products`, {
          cache: "force-cache",
        });

        if (!response.ok) return;

        const products = (await response.json()) as ProductDto[];
        const byCategory = new Map<string, string[]>();

        for (const product of products) {
          const key = categoryKey(product);
          const urls = byCategory.get(key) ?? [];

          for (const image of product.images ?? []) {
            if (!image.url || urls.includes(image.url) || urls.length >= 3) continue;
            urls.push(image.url);
          }

          byCategory.set(key, urls);
        }

        for (const urls of byCategory.values()) {
          for (const url of urls.slice(0, 3)) preloadImage(url);
        }
      } catch {
        // Non-critical background optimization.
      }
    };

    const scheduler = globalThis as typeof globalThis & {
      requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };

    if (scheduler.requestIdleCallback) {
      const id = scheduler.requestIdleCallback(run, { timeout: 2500 });
      return () => scheduler.cancelIdleCallback?.(id);
    }

    const id = globalThis.setTimeout(run, 1200);
    return () => globalThis.clearTimeout(id);
  }, []);

  return null;
}
