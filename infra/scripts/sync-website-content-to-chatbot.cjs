const fs = require("node:fs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function loadEnv(file = ".env") {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    if (!process.env[match[1].trim()]) process.env[match[1].trim()] = match[2].trim();
  }
}

loadEnv(".env");
loadEnv("apps/chatbot-api/.env");
loadEnv("chatbot.local.env");

const baseUrl = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
const embeddingModel = process.env.LLM_EMBEDDING_MODEL || "text-embedding-3-small";
const vectorDimensions = Number(process.env.VECTOR_DIMENSIONS || 1536);

if (!apiKey) {
  throw new Error("LLM_API_KEY or OPENAI_API_KEY is required for embeddings.");
}

function cleanText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value.replace(/\s+/g, " ").trim();
  if (Array.isArray(value)) return value.map(cleanText).filter(Boolean).join("\n");
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([key, child]) => {
        const text = cleanText(child);
        return text ? `${key}: ${text}` : "";
      })
      .filter(Boolean)
      .join("\n");
  }
  return String(value);
}

function stripStorageDetails(text) {
  return text
    .replace(/https:\/\/pub-[a-z0-9]+\.r2\.dev\/[^\s)"']+/gi, "media available on the Rangbheeni website")
    .replace(/https:\/\/[^/\s)"']*r2\.cloudflarestorage\.com[^\s)"']*/gi, "media available on the Rangbheeni website")
    .replace(/\bS3\b|\bR2\b|bucket|cloudflarestorage/gi, "media storage")
    .replace(/\s+/g, " ")
    .trim();
}

function chunkText(text, maxChars = 1400) {
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  const chunks = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + " " + sentence).trim().length > maxChars && current) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = `${current} ${sentence}`.trim();
    }
  }

  if (current) chunks.push(current.trim());
  return chunks.length ? chunks : [text.slice(0, maxChars)];
}

async function embed(text) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/embeddings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: embeddingModel,
      input: text,
      dimensions: vectorDimensions,
    }),
  });

  if (!response.ok) {
    throw new Error(`Embedding failed: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const embedding = payload?.data?.[0]?.embedding;

  if (!Array.isArray(embedding)) throw new Error("Embedding response missing vector.");
  return embedding;
}

function vectorLiteral(values) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

async function upsertDocument({ sourceType, sourceId, title, content }) {
  const safeContent = stripStorageDetails(content);

  if (!safeContent || safeContent.length < 20) return { skipped: true, title };

  const doc = await prisma.chatbotDocument.upsert({
    where: { sourceType_sourceId: { sourceType, sourceId } },
    create: {
      sourceType,
      sourceId,
      title,
      content: safeContent,
      status: "published",
      approvedForChatbot: true,
    },
    update: {
      title,
      content: safeContent,
      status: "published",
      approvedForChatbot: true,
    },
  });

  await prisma.chatbotChunk.deleteMany({ where: { documentId: doc.id } });

  let count = 0;
  for (const [index, chunk] of chunkText(safeContent).entries()) {
    const created = await prisma.chatbotChunk.create({
      data: {
        documentId: doc.id,
        chunkText: chunk,
        metadata: { sourceType, sourceId, title, chunkIndex: index },
      },
    });

    const embedding = await embed(chunk);
    await prisma.$executeRawUnsafe(
      `UPDATE "ChatbotChunk" SET embedding = $1::vector WHERE id = $2`,
      vectorLiteral(embedding),
      created.id,
    );

    count += 1;
  }

  return { skipped: false, title, chunks: count };
}

function eventStatus(event, todayStart) {
  return event.startDate >= todayStart ? "upcoming" : "past";
}

async function main() {
  const today = new Date();
  const todayStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

  const docs = [];

  const pages = await prisma.pageContent.findMany({
    where: { status: "published" },
    orderBy: [{ key: "asc" }],
  });

  for (const page of pages) {
    docs.push({
      sourceType: "page",
      sourceId: page.key,
      title: `Page: ${page.title || page.key}`,
      content: [
        `Website page: ${page.title || page.key}`,
        cleanText(page.content),
      ].join("\n"),
    });
  }

  const products = await prisma.product.findMany({
    where: { status: "published" },
    include: { category: true, images: { include: { media: true } } },
    orderBy: [{ featuredRank: "asc" }, { publishedAt: "desc" }, { createdAt: "desc" }, { name: "asc" }],
  });

  for (const product of products) {
    docs.push({
      sourceType: "product",
      sourceId: product.id,
      title: `Product: ${product.name}`,
      content: [
        `Product name: ${product.name}`,
        `Category: ${product.category?.label || "Product"}`,
        `Featured rank: ${product.featuredRank ?? "not featured"}`,
        `Short description: ${product.shortDescription}`,
        product.longDescription ? `Long description: ${product.longDescription}` : "",
        product.storyTitle ? `Product story title: ${product.storyTitle}` : "",
        product.story ? `Product story and making context: ${product.story}` : "",
        `Ordering and bulk enquiries: contact enquiries.rangbheeni@gmail.com.`,
      ].filter(Boolean).join("\n"),
    });
  }

  docs.push({
    sourceType: "product-process",
    sourceId: "rangbheeni-product-process",
    title: "How Rangbheeni products are made",
    content: [
      "Rangbheeni products are made from pre-loved and surplus textiles.",
      "The usual process includes collecting textiles, sorting usable fabric, designing or prototyping products, training artisans, stitching or crafting the final pieces, and quality checking before they are shared through catalogues, exhibitions, or gifting conversations.",
      "For product-specific details, use the product descriptions and stories in the Rangbheeni catalogue and product pages.",
    ].join("\n"),
  });

  const stories = await prisma.story.findMany({
    where: { status: "published" },
    include: { coverImage: true },
    orderBy: [{ featuredRank: "asc" }, { publishedDate: "desc" }, { title: "asc" }],
  });

  for (const story of stories) {
    docs.push({
      sourceType: "story",
      sourceId: story.id,
      title: `Story: ${story.title}`,
      content: [
        `Story title: ${story.title}`,
        `Featured rank: ${story.featuredRank ?? "not featured"}`,
        story.publishedDate ? `Published date: ${story.publishedDate.toISOString().slice(0, 10)}` : "",
        `Excerpt: ${story.excerpt}`,
        `Story content: ${cleanText(story.sections)}`,
      ].filter(Boolean).join("\n"),
    });
  }

  const events = await prisma.event.findMany({
    where: { status: "published" },
    include: { image: true },
    orderBy: [{ startDate: "desc" }, { title: "asc" }],
  });

  const upcoming = events
    .filter((event) => eventStatus(event, todayStart) === "upcoming")
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const past = events
    .filter((event) => eventStatus(event, todayStart) === "past")
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());

  docs.push({
    sourceType: "events-upcoming",
    sourceId: "upcoming-events",
    title: "Upcoming Rangbheeni events",
    content: upcoming.length
      ? upcoming.map((event) => [
          `Upcoming event: ${event.title}`,
          `Date: ${event.startDate.toISOString().slice(0, 10)}`,
          event.timeText ? `Time: ${event.timeText}` : "",
          event.city ? `City: ${event.city}` : "",
          event.venue ? `Venue: ${event.venue}` : "",
          event.shortDescription || event.fullDescription || "",
          event.ctaUrl || event.ctaLabel ? `Event action: ${event.ctaLabel || "Inquire"} ${event.ctaUrl || ""}` : "",
        ].filter(Boolean).join("\n")).join("\n\n")
      : "No upcoming Rangbheeni event is currently listed. For upcoming exhibitions, workshops, or stalls, contact enquiries.rangbheeni@gmail.com.",
  });

  docs.push({
    sourceType: "events-past",
    sourceId: "past-events",
    title: "Past Rangbheeni events",
    content: past.length
      ? past.slice(0, 30).map((event) => [
          `Past event: ${event.title}`,
          `Date: ${event.startDate.toISOString().slice(0, 10)}`,
          event.city ? `City: ${event.city}` : "",
          event.venue ? `Venue: ${event.venue}` : "",
          event.shortDescription || event.fullDescription || "",
        ].filter(Boolean).join("\n")).join("\n\n")
      : "No past Rangbheeni events are currently listed.",
  });

  for (const event of events) {
    docs.push({
      sourceType: "event",
      sourceId: event.id,
      title: `Event: ${event.title}`,
      content: [
        `Event title: ${event.title}`,
        `Event status: ${eventStatus(event, todayStart)}`,
        `Date: ${event.startDate.toISOString().slice(0, 10)}`,
        event.endDate ? `End date: ${event.endDate.toISOString().slice(0, 10)}` : "",
        event.timeText ? `Time: ${event.timeText}` : "",
        event.city ? `City: ${event.city}` : "",
        event.venue ? `Venue: ${event.venue}` : "",
        event.address ? `Address: ${event.address}` : "",
        event.shortDescription || "",
        event.fullDescription || "",
      ].filter(Boolean).join("\n"),
    });
  }

  docs.push({
    sourceType: "contact",
    sourceId: "public-contact",
    title: "Rangbheeni enquiries and contact",
    content: "For product orders, corporate gifting, partnerships, workshops, donations, volunteering, media, or detailed enquiries, contact Rangbheeni at enquiries.rangbheeni@gmail.com.",
  });

  const results = [];

  for (const doc of docs) {
    results.push(await upsertDocument(doc));
  }

  const summary = {
    ok: true,
    documentsSynced: results.filter((item) => !item.skipped).length,
    documentsSkipped: results.filter((item) => item.skipped).length,
    chunksCreated: results.reduce((sum, item) => sum + (item.chunks || 0), 0),
    products: products.length,
    stories: stories.length,
    upcomingEvents: upcoming.length,
    pastEvents: past.length,
    pages: pages.length,
  };

  console.log(JSON.stringify(summary, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
