const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function loadEnvFile(filePath) {
  return fs.readFile(filePath, "utf8")
    .then((text) => {
      for (const line of text.split(/\r?\n/)) {
        const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
        if (!match) continue;
        const key = match[1].trim();
        const value = match[2].trim();
        process.env[key] = value;
      }
    })
    .catch(() => {});
}

function toPosix(value) {
  return value.split(path.sep).join("/");
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(fullPath)));
    if (entry.isFile()) files.push(fullPath);
  }

  return files;
}

function isImageFile(filePath) {
  return [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif"].includes(
    path.extname(filePath).toLowerCase(),
  );
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

async function main() {
  await loadEnvFile("s3.local.env");

  const DRY_RUN = process.env.DRY_RUN === "1";
  const sourceDir = process.env.SOURCE_IMAGES_DIR || path.resolve("apps/web/public/images");
  const prefix = (process.env.S3_KEY_PREFIX || "images").replace(/^\/+|\/+$/g, "");
  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

  if (!publicBaseUrl) throw new Error("S3_PUBLIC_BASE_URL is required in s3.local.env");

  const cleanBaseUrl = publicBaseUrl.replace(/\/$/, "");
  const files = (await listFiles(sourceDir)).filter(isImageFile);

  const imageMap = new Map();

  for (const file of files) {
    const relative = toPosix(path.relative(sourceDir, file));
    const localRef = `/${prefix}/${relative}`;
    const publicUrl = `${cleanBaseUrl}/${prefix}/${relative}`;
    imageMap.set(localRef.toLowerCase(), {
      localRef,
      publicUrl,
      key: `${prefix}/${relative}`,
    });
  }

  const summary = {
    dryRun: DRY_RUN,
    localImagesIndexed: imageMap.size,
    dbUpdates: {
      mediaAsset: 0,
      productImage: 0,
      pageContent: 0,
      storySections: 0,
    },
    seedDataUpdated: false,
    replacementExamples: [],
    missingLocalImageRefs: [],
  };

  const missing = new Set();

  function replaceString(value, context) {
    if (typeof value !== "string") return value;
    if (!value.startsWith("/images/")) return value;

    const hit = imageMap.get(value.toLowerCase());

    if (!hit) {
      missing.add(value);
      return value;
    }

    if (summary.replacementExamples.length < 20) {
      summary.replacementExamples.push({
        context,
        from: value,
        to: hit.publicUrl,
      });
    }

    return hit.publicUrl;
  }

  function replaceJson(value, context) {
    if (typeof value === "string") return replaceString(value, context);

    if (Array.isArray(value)) {
      return value.map((item, index) => replaceJson(item, `${context}[${index}]`));
    }

    if (value && typeof value === "object") {
      const next = {};
      for (const [key, child] of Object.entries(value)) {
        next[key] = replaceJson(child, `${context}.${key}`);
      }
      return next;
    }

    return value;
  }

  const mediaAssets = await prisma.mediaAsset.findMany({
    select: { id: true, url: true },
  });

  for (const asset of mediaAssets) {
    if (!asset.url.startsWith("/images/")) continue;

    const hit = imageMap.get(asset.url.toLowerCase());

    if (!hit) {
      missing.add(asset.url);
      continue;
    }

    summary.dbUpdates.mediaAsset += 1;

    if (!DRY_RUN) {
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: {
          url: hit.publicUrl,
          key: hit.key,
        },
      });
    }
  }

  const productImages = await prisma.productImage.findMany({
    select: { id: true, url: true },
  });

  for (const image of productImages) {
    if (!image.url.startsWith("/images/")) continue;

    const nextUrl = replaceString(image.url, `ProductImage:${image.id}`);

    if (nextUrl !== image.url) {
      summary.dbUpdates.productImage += 1;

      if (!DRY_RUN) {
        await prisma.productImage.update({
          where: { id: image.id },
          data: { url: nextUrl },
        });
      }
    }
  }

  const pages = await prisma.pageContent.findMany({
    select: { id: true, key: true, content: true },
  });

  for (const page of pages) {
    const before = JSON.stringify(page.content);
    const nextContent = replaceJson(clone(page.content), `PageContent:${page.key}`);
    const after = JSON.stringify(nextContent);

    if (before !== after) {
      summary.dbUpdates.pageContent += 1;

      if (!DRY_RUN) {
        await prisma.pageContent.update({
          where: { id: page.id },
          data: { content: nextContent },
        });
      }
    }
  }

  const stories = await prisma.story.findMany({
    select: { id: true, slug: true, sections: true },
  });

  for (const story of stories) {
    const before = JSON.stringify(story.sections);
    const nextSections = replaceJson(clone(story.sections), `Story:${story.slug}.sections`);
    const after = JSON.stringify(nextSections);

    if (before !== after) {
      summary.dbUpdates.storySections += 1;

      if (!DRY_RUN) {
        await prisma.story.update({
          where: { id: story.id },
          data: { sections: nextSections },
        });
      }
    }
  }

  const seedPath = path.resolve("packages/seed-data/src/content.json");

  try {
    const seedRaw = await fs.readFile(seedPath, "utf8");
    const seedJson = JSON.parse(seedRaw);
    const nextSeedJson = replaceJson(clone(seedJson), "seed-data:content.json");

    if (JSON.stringify(seedJson) !== JSON.stringify(nextSeedJson)) {
      summary.seedDataUpdated = true;

      if (!DRY_RUN) {
        await fs.writeFile(seedPath, `${JSON.stringify(nextSeedJson, null, 2)}\n`, "utf8");
      }
    }
  } catch (error) {
    summary.seedDataError = error.message;
  }

  summary.missingLocalImageRefs = Array.from(missing).sort();

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

