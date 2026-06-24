import type { EventDto, ProductDto, StoryDto } from "@rangbheeni/shared-types";

export type LegacyProduct = {
  id: string;
  name: string;
  category?: string;
  short?: string;
  images?: string[];
  featured?: boolean;
  storyTitle?: string | null;
  story?: string | null;
  artisan?: { name: string; location?: string; quote?: string };
};

export function toLegacyProduct(product: ProductDto): LegacyProduct {
  return {
    id: product.slug,
    name: product.name,
    category: product.category?.key ?? product.category?.label ?? "other",
    short: product.shortDescription,
    images: product.images?.map((image) => image.url).filter(Boolean) ?? [],
    featured: product.featured,
    storyTitle: product.storyTitle,
    story: product.story ?? product.longDescription ?? undefined,
  };
}

export function toLegacyProductsCollection(products: ProductDto[]) {
  return {
    pageTitle: "Our Products",
    intro: "Made from pre-loved textiles and crafted by women building dignified, climate-resilient livelihoods.",
    items: products.map(toLegacyProduct),
  };
}

export function toLegacyEvent(event: EventDto) {
  return {
    id: event.slug,
    title: event.title,
    type: event.type ?? "Event",
    date: event.startDate.slice(0, 10),
    time: event.timeText ?? undefined,
    city: event.city ?? undefined,
    venue: event.venue ?? undefined,
    short: event.shortDescription ?? event.fullDescription ?? undefined,
    ctaLabel: event.ctaLabel ?? undefined,
    ctaHref: event.ctaUrl ?? undefined,
  };
}

export function toLegacyStory(story: StoryDto) {
  return {
    slug: story.slug,
    title: story.title,
    excerpt: story.excerpt,
    coverImage: story.coverImage?.url ?? "/images/placeholder.jpg",
    featured: story.featured,
    publishedDate: story.publishedDate ?? undefined,
    blocks: story.blocks,
  };
}
