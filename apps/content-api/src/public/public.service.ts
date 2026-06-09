import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  private media(asset: any) {
    if (!asset) return null;
    return { id: asset.id, url: asset.url, altText: asset.altText, width: asset.width, height: asset.height };
  }

  private productDto(product: any) {
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category ? { id: product.category.id, key: product.category.key, label: product.category.label, sortOrder: product.category.sortOrder } : null,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      storyTitle: product.storyTitle,
      story: product.story,
      featured: product.featured,
      images: (product.images ?? []).sort((a: any, b: any) => a.sortOrder - b.sortOrder).map((image: any) => ({
        id: image.media?.id ?? image.id,
        url: image.media?.url ?? image.url,
        altText: image.altText ?? image.media?.altText ?? product.name,
        width: image.media?.width,
        height: image.media?.height,
      })),
    };
  }

  async health() {
    return { ok: true, service: "rangbheeni-content-api" };
  }

  async page(key: string) {
    const page = await this.prisma.pageContent.findFirst({ where: { key, status: "published" } });
    if (!page) throw new NotFoundException(`Page '${key}' not found`);
    return { key: page.key, title: page.title, content: page.content, updatedAt: page.updatedAt };
  }

  async navigation() {
    return this.page("navigation");
  }

  async siteSettings() {
    return this.page("site-settings");
  }

  async home() {
    const [siteSettings, navigation, impact, catalogue] = await Promise.all([
      this.page("site-settings").catch(() => null),
      this.page("navigation").catch(() => null),
      this.page("impact").catch(() => null),
      this.page("catalogue").catch(() => null),
    ]);
    const featuredProducts = await this.products({ featured: true, limit: 6 });
    const featuredStories = await this.stories({ featured: true, limit: 4 });
    const featuredEvents = await this.events({ featured: true, limit: 3 });
    return { siteSettings, navigation, impact, catalogue, featuredProducts, featuredStories, featuredEvents };
  }

  async categories() {
    return this.prisma.productCategory.findMany({
      where: { status: "published" },
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
      select: { id: true, key: true, label: true, sortOrder: true },
    });
  }

  async products(options?: { featured?: boolean; limit?: number }) {
    const products = await this.prisma.product.findMany({
      where: { status: "published", ...(options?.featured ? { featured: true } : {}) },
      include: { category: true, images: { include: { media: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: options?.limit,
    });
    return products.map((product) => this.productDto(product));
  }

  async product(slug: string) {
    const product = await this.prisma.product.findFirst({
      where: { slug, status: "published" },
      include: { category: true, images: { include: { media: true } } },
    });
    if (!product) throw new NotFoundException("Product not found");
    return this.productDto(product);
  }

  async events(options?: { featured?: boolean; limit?: number }) {
    const events = await this.prisma.event.findMany({
      where: { status: "published", ...(options?.featured ? { featured: true } : {}) },
      include: { image: true },
      orderBy: [{ startDate: "asc" }, { sortOrder: "asc" }],
      take: options?.limit,
    });
    return events.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      type: event.eventType,
      shortDescription: event.shortDescription,
      fullDescription: event.fullDescription,
      city: event.city,
      venue: event.venue,
      address: event.address,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
      timeText: event.timeText,
      ctaLabel: event.ctaLabel,
      ctaUrl: event.ctaUrl,
      featured: event.featured,
      image: this.media(event.image),
    }));
  }

  async event(slug: string) {
    const event = await this.prisma.event.findFirst({ where: { slug, status: "published" }, include: { image: true } });
    if (!event) throw new NotFoundException("Event not found");
    return {
      id: event.id,
      slug: event.slug,
      title: event.title,
      type: event.eventType,
      shortDescription: event.shortDescription,
      fullDescription: event.fullDescription,
      city: event.city,
      venue: event.venue,
      address: event.address,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
      timeText: event.timeText,
      ctaLabel: event.ctaLabel,
      ctaUrl: event.ctaUrl,
      featured: event.featured,
      image: this.media(event.image),
    };
  }

  async stories(options?: { featured?: boolean; limit?: number }) {
    const stories = await this.prisma.story.findMany({
      where: { status: "published", ...(options?.featured ? { featured: true } : {}) },
      include: { coverImage: true },
      orderBy: [{ publishedDate: "desc" }, { sortOrder: "asc" }],
      take: options?.limit,
    });
    return stories.map((story) => ({
      id: story.id,
      slug: story.slug,
      title: story.title,
      excerpt: story.excerpt,
      featured: story.featured,
      publishedDate: story.publishedDate?.toISOString() ?? null,
      coverImage: this.media(story.coverImage),
      sections: story.sections,
    }));
  }

  async story(slug: string) {
    const story = await this.prisma.story.findFirst({ where: { slug, status: "published" }, include: { coverImage: true } });
    if (!story) throw new NotFoundException("Story not found");
    return {
      id: story.id,
      slug: story.slug,
      title: story.title,
      excerpt: story.excerpt,
      featured: story.featured,
      publishedDate: story.publishedDate?.toISOString() ?? null,
      coverImage: this.media(story.coverImage),
      sections: story.sections,
    };
  }

  async activeAnnouncement() {
    const now = new Date();
    const announcement = await this.prisma.announcement.findFirst({
      where: {
        status: "published",
        AND: [
          { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
          { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
        ],
      },
      include: { image: true },
      orderBy: [{ startsAt: "desc" }, { updatedAt: "desc" }],
    });
    if (!announcement) return null;
    return {
      id: announcement.id,
      title: announcement.title,
      message: announcement.message,
      displayType: announcement.displayType,
      ctaLabel: announcement.ctaLabel,
      ctaUrl: announcement.ctaUrl,
      image: this.media(announcement.image),
      startsAt: announcement.startsAt?.toISOString() ?? null,
      endsAt: announcement.endsAt?.toISOString() ?? null,
    };
  }
}
