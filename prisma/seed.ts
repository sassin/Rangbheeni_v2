import { PrismaClient } from "@prisma/client";
import { seedContent } from "@rangbheeni/seed-data";

const prisma = new PrismaClient();

function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function toDate(value?: string | null) {
  if (!value) return null;
  return new Date(`${value}T00:00:00.000Z`);
}

async function upsertMedia(url: string, altText?: string | null) {
  const key = url.startsWith("/") ? url.slice(1) : url;
  return prisma.mediaAsset.upsert({
    where: { key },
    update: { url, altText: altText ?? null },
    create: { key, url, altText: altText ?? null },
  });
}

function flattenText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.map(flattenText).filter(Boolean).join("\n");
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).map(flattenText).filter(Boolean).join("\n");
  return "";
}

async function seedPages() {
  const pages = [
    { key: "site-settings", title: "Site settings", content: seedContent.siteSettings.siteSettings },
    { key: "navigation", title: "Navigation", content: { primaryNavigation: seedContent.navigation.primaryNavigation.map((item: any) => item.href === "/events" ? { ...item, hidden: false } : item), navigationCta: seedContent.navigation.navigationCta } },
    { key: "footer", title: "Footer", content: seedContent.footer.footerContent },
    { key: "impact", title: "Impact", content: seedContent.impact.impactCollection },
    { key: "about", title: "About", content: seedContent.about.aboutPageContent },
    { key: "journey", title: "Journey", content: seedContent.journey.journeyPageContent },
    { key: "catalogue", title: "Catalogue", content: seedContent.catalogue.catalogueContent },
  ];

  for (const page of pages) {
    await prisma.pageContent.upsert({
      where: { key: page.key },
      update: { title: page.title, content: page.content as any, status: "published", publishedAt: new Date() },
      create: { key: page.key, title: page.title, content: page.content as any, status: "published", publishedAt: new Date() },
    });
  }
}

async function seedProducts() {
  const categories = seedContent.categories.PRODUCT_CATEGORIES as Array<{ key: string; label: string }>;
  for (const [index, category] of categories.entries()) {
    await prisma.productCategory.upsert({
      where: { key: category.key },
      update: { label: category.label, sortOrder: index, status: "published" },
      create: { key: category.key, label: category.label, sortOrder: index, status: "published" },
    });
  }

  const categoryByKey = new Map((await prisma.productCategory.findMany()).map((category) => [category.key, category]));
  const products = seedContent.products.productsCollection.items as any[];
  for (const [index, product] of products.entries()) {
    const category = categoryByKey.get(product.category ?? "other");
    const slug = slugify(product.name || product.id);
    const saved = await prisma.product.upsert({
      where: { slug },
      update: {
        externalId: product.id,
        name: product.name,
        categoryId: category?.id,
        shortDescription: product.short ?? "",
        longDescription: product.longDescription ?? null,
        storyTitle: product.storyTitle ?? null,
        story: product.story ?? null,
        featured: Boolean(product.featured),
        sortOrder: index,
        status: "published",
        publishedAt: new Date(),
      },
      create: {
        slug,
        externalId: product.id,
        name: product.name,
        categoryId: category?.id,
        shortDescription: product.short ?? "",
        longDescription: product.longDescription ?? null,
        storyTitle: product.storyTitle ?? null,
        story: product.story ?? null,
        featured: Boolean(product.featured),
        sortOrder: index,
        status: "published",
        publishedAt: new Date(),
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    for (const [imageIndex, imageUrl] of (product.images ?? []).entries()) {
      const media = await upsertMedia(imageUrl, product.name);
      await prisma.productImage.create({
        data: {
          productId: saved.id,
          mediaId: media.id,
          url: imageUrl,
          altText: product.name,
          sortOrder: imageIndex,
        },
      });
    }
  }
}

async function seedEvents() {
  const events = seedContent.events.events as any[];
  for (const [index, event] of events.entries()) {
    const slug = slugify(`${event.title}-${event.date}`);
    await prisma.event.upsert({
      where: { slug },
      update: {
        externalId: event.id,
        title: event.title,
        eventType: event.type ?? null,
        shortDescription: event.short ?? null,
        fullDescription: event.description ?? null,
        city: event.city ?? null,
        venue: event.venue ?? null,
        startDate: toDate(event.date) ?? new Date(),
        endDate: toDate(event.endDate),
        timeText: event.time ?? null,
        ctaLabel: event.ctaLabel ?? null,
        ctaUrl: event.ctaHref ?? null,
        sortOrder: index,
        status: "published",
        publishedAt: new Date(),
      },
      create: {
        slug,
        externalId: event.id,
        title: event.title,
        eventType: event.type ?? null,
        shortDescription: event.short ?? null,
        fullDescription: event.description ?? null,
        city: event.city ?? null,
        venue: event.venue ?? null,
        startDate: toDate(event.date) ?? new Date(),
        endDate: toDate(event.endDate),
        timeText: event.time ?? null,
        ctaLabel: event.ctaLabel ?? null,
        ctaUrl: event.ctaHref ?? null,
        sortOrder: index,
        status: "published",
        publishedAt: new Date(),
      },
    });
  }
}

async function seedStories() {
  const stories = seedContent.stories as any[];
  for (const [index, story] of stories.entries()) {
    const slug = slugify(story.slug || story.title);
    const coverImage = story.coverImage ? await upsertMedia(story.coverImage, story.title) : null;
    await prisma.story.upsert({
      where: { slug },
      update: {
        title: story.title,
        excerpt: story.excerpt ?? "",
        featured: Boolean(story.featured),
        publishedDate: toDate(story.publishedDate),
        coverImageId: coverImage?.id,
        sections: story.sections ?? [],
        sortOrder: index,
        status: "published",
      },
      create: {
        slug,
        title: story.title,
        excerpt: story.excerpt ?? "",
        featured: Boolean(story.featured),
        publishedDate: toDate(story.publishedDate),
        coverImageId: coverImage?.id,
        sections: story.sections ?? [],
        sortOrder: index,
        status: "published",
      },
    });
  }
}

async function seedAnnouncement() {
  await prisma.announcement.upsert({
    where: { slug: "rangbheeni-updates" },
    update: {
      title: "Latest from Rangbheeni",
      message: "Visit our Events page for upcoming exhibitions, workshops, and community collection drives.",
      displayType: "modal",
      ctaLabel: "View events",
      ctaUrl: "/events",
      status: "draft",
    },
    create: {
      slug: "rangbheeni-updates",
      title: "Latest from Rangbheeni",
      message: "Visit our Events page for upcoming exhibitions, workshops, and community collection drives.",
      displayType: "modal",
      ctaLabel: "View events",
      ctaUrl: "/events",
      status: "draft",
    },
  });
}

async function seedChatbotDocuments() {
  const products = await prisma.product.findMany({ where: { status: "published" }, include: { category: true, images: true } });
  const events = await prisma.event.findMany({ where: { status: "published" } });
  const stories = await prisma.story.findMany({ where: { status: "published" } });
  const pages = await prisma.pageContent.findMany({ where: { status: "published" } });

  const docs: Array<{ title: string; sourceType: string; sourceId: string; content: string }> = [
    {
      title: "Contact Rangbheeni",
      sourceType: "manual",
      sourceId: "contact",
      content: "For questions not answered on the website, contact Rangbheeni at enquiries.rangbheeni@gmail.com. Rangbheeni can be reached for product enquiries, collaborations, exhibitions, workshops, collection drives, and corporate gifting discussions.",
    },
    {
      title: "Chatbot operating rule",
      sourceType: "manual",
      sourceId: "chatbot-rule",
      content: "The Rangbheeni assistant must answer only from approved Rangbheeni content. It must not guess prices, stock availability, delivery timelines, discounts, return policies, event schedules, or custom order commitments unless those facts are explicitly present in approved Rangbheeni content.",
    },
  ];

  for (const product of products) {
    docs.push({
      title: `Product: ${product.name}`,
      sourceType: "product",
      sourceId: product.id,
      content: [
        `Product name: ${product.name}`,
        product.category ? `Category: ${product.category.label}` : "",
        `Short description: ${product.shortDescription}`,
        product.longDescription ? `Description: ${product.longDescription}` : "",
        product.storyTitle ? `Story title: ${product.storyTitle}` : "",
        product.story ? `Product story: ${product.story}` : "",
      ].filter(Boolean).join("\n"),
    });
  }

  for (const event of events) {
    docs.push({
      title: `Event: ${event.title}`,
      sourceType: "event",
      sourceId: event.id,
      content: [
        `Event title: ${event.title}`,
        event.eventType ? `Type: ${event.eventType}` : "",
        `Date: ${event.startDate.toISOString().slice(0, 10)}`,
        event.timeText ? `Time: ${event.timeText}` : "",
        event.city ? `City: ${event.city}` : "",
        event.venue ? `Venue: ${event.venue}` : "",
        event.shortDescription ? `Description: ${event.shortDescription}` : "",
      ].filter(Boolean).join("\n"),
    });
  }

  for (const story of stories) {
    docs.push({
      title: `Story: ${story.title}`,
      sourceType: "story",
      sourceId: story.id,
      content: [`Story title: ${story.title}`, `Excerpt: ${story.excerpt}`, flattenText(story.sections)].join("\n"),
    });
  }

  for (const page of pages) {
    docs.push({
      title: `Page: ${page.title ?? page.key}`,
      sourceType: "page",
      sourceId: page.key,
      content: flattenText(page.content),
    });
  }

  for (const doc of docs) {
    await prisma.chatbotDocument.upsert({
      where: { sourceType_sourceId: { sourceType: doc.sourceType, sourceId: doc.sourceId } },
      update: { title: doc.title, content: doc.content, status: "published", approvedForChatbot: true },
      create: { title: doc.title, sourceType: doc.sourceType, sourceId: doc.sourceId, content: doc.content, status: "published", approvedForChatbot: true },
    });
  }
}

async function main() {
  await seedPages();
  await seedProducts();
  await seedEvents();
  await seedStories();
  await seedAnnouncement();
  await seedChatbotDocuments();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
