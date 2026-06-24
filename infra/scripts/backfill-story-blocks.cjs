const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function sectionText(section) {
  if (!section || typeof section !== "object") return "";
  return typeof section.text === "string" ? section.text.trim() : "";
}

function sectionImageUrl(section) {
  if (!section || typeof section !== "object") return null;

  if (section.type === "image" && typeof section.url === "string") return section.url;
  if (typeof section.imageUrl === "string") return section.imageUrl;
  if (section.image && typeof section.image.url === "string") return section.image.url;

  return null;
}

function sectionCaption(section) {
  if (!section || typeof section !== "object") return null;

  if (typeof section.caption === "string") return section.caption;
  if (section.image && typeof section.image.caption === "string") return section.image.caption;

  return null;
}

function sectionAlt(section) {
  if (!section || typeof section !== "object") return null;

  if (typeof section.alt === "string") return section.alt;
  if (typeof section.altText === "string") return section.altText;
  if (section.image && typeof section.image.alt === "string") return section.image.alt;
  if (section.image && typeof section.image.altText === "string") return section.image.altText;

  return null;
}

async function main() {
  const stories = await prisma.story.findMany({
    include: {
      blocks: true,
    },
    orderBy: [
      { sortOrder: "asc" },
      { publishedDate: "desc" },
      { createdAt: "desc" },
    ],
  });

  let migratedStories = 0;
  let createdBlocks = 0;
  let skippedStories = 0;

  for (const story of stories) {
    if (story.blocks.length > 0) {
      skippedStories += 1;
      continue;
    }

    const sections = Array.isArray(story.sections) ? story.sections : [];

    if (!sections.length) {
      skippedStories += 1;
      continue;
    }

    const creates = [];

    for (const section of sections) {
      const imageUrl = sectionImageUrl(section);
      const text = sectionText(section);

      if (imageUrl) {
        const media = await prisma.mediaAsset.findFirst({
          where: { url: imageUrl },
          select: { id: true },
        });

        creates.push({
          type: "image",
          sortOrder: creates.length * 10,
          mediaId: media?.id || null,
          caption: sectionCaption(section),
          altText: sectionAlt(section),
          text: media ? null : imageUrl,
        });

        continue;
      }

      if (text) {
        creates.push({
          type: section?.type === "quote" ? "quote" : "paragraph",
          sortOrder: creates.length * 10,
          text,
          mediaId: null,
          caption: null,
          altText: null,
        });
      }
    }

    if (!creates.length) {
      skippedStories += 1;
      continue;
    }

    await prisma.$transaction(
      creates.map((block) =>
        prisma.storyBlock.create({
          data: {
            storyId: story.id,
            ...block,
          },
        })
      )
    );

    migratedStories += 1;
    createdBlocks += creates.length;
  }

  console.log({
    ok: true,
    storiesChecked: stories.length,
    migratedStories,
    skippedStories,
    createdBlocks,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
