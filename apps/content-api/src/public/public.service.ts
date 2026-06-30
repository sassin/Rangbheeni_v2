import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";

type RankedItem = {
  featured?: boolean | null;
  featuredRank?: number | null;
  sortOrder?: number | null;
};

@Injectable()
export class PublicService {
  constructor(private readonly prisma: PrismaService) {}

  private media(asset: any) {
    if (!asset) return null;
    return {
      id: asset.id,
      url: asset.url,
      altText: asset.altText,
      width: asset.width,
      height: asset.height,
    };
  }

  private rank(item: RankedItem) {
    if (typeof item.featuredRank === "number") return item.featuredRank;
    if (item.featured && typeof item.sortOrder === "number" && item.sortOrder > 0) {
      return item.sortOrder;
    }
    return null;
  }

  private compareRank(a: RankedItem, b: RankedItem) {
    const ar = this.rank(a);
    const br = this.rank(b);

    if (ar !== null || br !== null) {
      if (ar === null) return 1;
      if (br === null) return -1;
      if (ar !== br) return ar - br;
    }

    return 0;
  }

  private dateMs(value?: Date | string | null) {
    if (!value) return 0;
    const dt = value instanceof Date ? value : new Date(value);
    const ms = dt.getTime();
    return Number.isNaN(ms) ? 0 : ms;
  }

  private productDto(product: any) {
    const featuredRank = this.rank(product);

    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category
        ? {
            id: product.category.id,
            key: product.category.key,
            label: product.category.label,
            sortOrder: product.category.sortOrder,
          }
        : null,
      shortDescription: product.shortDescription,
      longDescription: product.longDescription,
      storyTitle: product.storyTitle,
      story: product.story,
      featured: featuredRank !== null,
      featuredRank,
      images: (product.images ?? [])
        .sort((a: any, b: any) => a.sortOrder - b.sortOrder)
        .map((image: any) => ({
          id: image.media?.id ?? image.id,
          url: image.media?.url ?? image.url,
          altText: image.altText ?? image.media?.altText ?? product.name,
          width: image.media?.width,
          height: image.media?.height,
        })),
    };
  }

  private compareProducts(a: any, b: any) {
    const ranked = this.compareRank(a, b);
    if (ranked !== 0) return ranked;

    const byPublished =
      this.dateMs(b.publishedAt ?? b.createdAt) - this.dateMs(a.publishedAt ?? a.createdAt);
    if (byPublished !== 0) return byPublished;

    return String(a.name).localeCompare(String(b.name));
  }

  private compareStories(a: any, b: any) {
    const ranked = this.compareRank(a, b);
    if (ranked !== 0) return ranked;

    const byPublished =
      this.dateMs(b.publishedDate ?? b.createdAt) - this.dateMs(a.publishedDate ?? a.createdAt);
    if (byPublished !== 0) return byPublished;

    return String(a.title).localeCompare(String(b.title));
  }

  private compareEvents(a: any, b: any) {
    const ranked = this.compareRank(a, b);
    if (ranked !== 0) return ranked;

    const byStart = this.dateMs(b.startDate) - this.dateMs(a.startDate);
    if (byStart !== 0) return byStart;

    return String(a.title).localeCompare(String(b.title));
  }

  private splitEventParagraphs(text?: string | null) {
    const fallback = "More event details will be announced soon.";

    return String(text || fallback)
      .split(/\n+/)
      .map((part) => part.trim())
      .filter(Boolean);
  }

  private formatEventDate(value?: Date | string | null) {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  }

  private eventDateBadge(value: Date | string) {
    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return { month: "", day: "" };
    }

    return {
      month: new Intl.DateTimeFormat("en-US", {
        month: "short",
        timeZone: "UTC",
      }).format(date),
      day: new Intl.DateTimeFormat("en-US", {
        day: "2-digit",
        timeZone: "UTC",
      }).format(date),
    };
  }

  private isSameEventDay(startValue?: Date | string | null, endValue?: Date | string | null) {
    if (!startValue || !endValue) return true;

    const start = startValue instanceof Date ? startValue : new Date(startValue);
    const end = endValue instanceof Date ? endValue : new Date(endValue);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return true;

    return (
      start.getUTCFullYear() === end.getUTCFullYear() &&
      start.getUTCMonth() === end.getUTCMonth() &&
      start.getUTCDate() === end.getUTCDate()
    );
  }

  private eventDto(event: any) {
    const featuredRank = this.rank(event);
    const description = event.fullDescription || event.shortDescription;
    const startLabel = this.formatEventDate(event.startDate);
    const endLabel = event.endDate ? this.formatEventDate(event.endDate) : null;

    return {
      id: event.id,
      eventCode: typeof event.eventCode === "number" ? event.eventCode : null,
      slug: event.slug,
      title: event.title,
      type: event.eventType,
      shortDescription: event.shortDescription,
      fullDescription: event.fullDescription,
      descriptionParagraphs: this.splitEventParagraphs(description),
      city: event.city,
      venue: event.venue,
      address: event.address,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() ?? null,
      timeText: event.timeText,
      dateBadge: this.eventDateBadge(event.startDate),
      startLabel,
      endLabel,
      showDateRange: event.endDate ? !this.isSameEventDay(event.startDate, event.endDate) : false,
      ctaLabel: event.ctaLabel,
      ctaUrl: event.ctaUrl,
      ctaText: event.ctaLabel || "Inquire about this event",
      ctaHref: event.ctaUrl || "mailto:enquiries.rangbheeni@gmail.com",
      featured: featuredRank !== null,
      featuredRank,
      image: this.media(event.image),
    };
  }

  async health() {
    return { ok: true, service: "rangbheeni-content-api" };
  }

  async page(key: string) {
    const page = await this.prisma.pageContent.findFirst({
      where: { key, status: "published" },
    });
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
    const where: any = { status: "published" };

    if (options?.featured) {
      where.OR = [{ featuredRank: { not: null } }, { featured: true }];
    }

    const products = await this.prisma.product.findMany({
      where,
      include: { category: true, images: { include: { media: true } } },
    });

    return products
      .sort((a, b) => this.compareProducts(a, b))
      .slice(0, options?.limit ?? products.length)
      .map((product) => this.productDto(product));
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
    const where: any = { status: "published" };

    if (options?.featured) {
      where.OR = [{ featuredRank: { not: null } }, { featured: true }];
    }

    const events = await this.prisma.event.findMany({
      where,
      include: { image: true },
    });

    return events
      .sort((a, b) => this.compareEvents(a, b))
      .slice(0, options?.limit ?? events.length)
      .map((event) => this.eventDto(event));
  }

  async event(slug: string) {
    const event = await this.prisma.event.findFirst({
      where: { slug, status: "published" },
      include: { image: true },
    });

    if (!event) throw new NotFoundException("Event not found");

    return this.eventDto(event);
  }

  async stories(options?: { featured?: boolean; limit?: number }) {
    const where: any = { status: "published" };

    if (options?.featured) {
      where.OR = [{ featuredRank: { not: null } }, { featured: true }];
    }

    const stories = await this.prisma.story.findMany({
      where,
      include: {
        coverImage: true,
        blocks: {
          include: { media: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    return stories
      .sort((a, b) => this.compareStories(a, b))
      .slice(0, options?.limit ?? stories.length)
      .map((story) => {
        const featuredRank = this.rank(story);

        return {
          id: story.id,
          slug: story.slug,
          title: story.title,
          excerpt: story.excerpt,
          featured: featuredRank !== null,
          featuredRank,
          publishedDate: story.publishedDate?.toISOString() ?? null,
          coverImage: this.media(story.coverImage),
          blocks: story.blocks.map((block) => ({
            id: block.id,
            type: block.type,
            sortOrder: block.sortOrder,
            text: block.text,
            caption: block.caption,
            altText: block.altText,
            image: this.media(block.media),
          })),
        };
      });
  }

  async story(slug: string) {
    const story = await this.prisma.story.findFirst({
      where: { slug, status: "published" },
      include: {
        coverImage: true,
        blocks: {
          include: { media: true },
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!story) throw new NotFoundException("Story not found");

    const featuredRank = this.rank(story);

    return {
      id: story.id,
      slug: story.slug,
      title: story.title,
      excerpt: story.excerpt,
      featured: featuredRank !== null,
      featuredRank,
      publishedDate: story.publishedDate?.toISOString() ?? null,
      coverImage: this.media(story.coverImage),
      blocks: story.blocks.map((block) => ({
            id: block.id,
            type: block.type,
            sortOrder: block.sortOrder,
            text: block.text,
            caption: block.caption,
            altText: block.altText,
            image: this.media(block.media),
          })),
    };
  }

  async galleryImages() {
    const galleryImages = await this.prisma.galleryImage.findMany({
      where: { visible: true },
      orderBy: { sortOrder: "asc" },
      include: { media: true },
    });

    return galleryImages.map((galleryImage) => ({
      id: galleryImage.id,
      hoverText: galleryImage.hoverText,
      visible: galleryImage.visible,
      sortOrder: galleryImage.sortOrder,
      image: this.media(galleryImage.media),
    }));
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
  async subscribeNewsletter(email: string) {
    const normalized = String(email ?? "").trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      throw new BadRequestException("Valid email is required");
    }

    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email: normalized },
      create: {
        email: normalized,
        source: "launch-announcement",
        status: "active",
      },
      update: {
        status: "active",
      },
    });

    return { ok: true, id: subscriber.id };
  }
}
