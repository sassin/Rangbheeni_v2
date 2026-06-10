const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function loadEnvFile(filePath) {
  const text = await fs.readFile(filePath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([^#][^=]+)=(.*)$/);
    if (!match) continue;
    process.env[match[1].trim()] = match[2].trim();
  }
}

function mimeTypeFor(key) {
  const ext = path.extname(key).toLowerCase();
  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".svg") return "image/svg+xml";
  return "application/octet-stream";
}

function replaceJson(value, replacements) {
  if (typeof value === "string") return replacements[value] || value;

  if (Array.isArray(value)) {
    return value.map((item) => replaceJson(item, replacements));
  }

  if (value && typeof value === "object") {
    const next = {};
    for (const [key, child] of Object.entries(value)) {
      next[key] = replaceJson(child, replacements);
    }
    return next;
  }

  return value;
}

async function main() {
  await loadEnvFile("s3.local.env");

  const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (!publicBaseUrl) throw new Error("S3_PUBLIC_BASE_URL missing from s3.local.env");

  const mappings = [
    {
      oldUrl: "/images/stories/sarees-to-products/cover.jpg",
      newKey: "images/products/sari-tote-2.JPG",
    },
    {
      oldUrl: "/images/stories/exhibitions/cover.jpg",
      newKey: "images/stories/institution-workshop/cover.jpg",
    },
    {
      oldUrl: "/images/stories/corporate-gifting/cover.jpg",
      newKey: "images/products/denim-pouch-1.jpg",
    },
    {
      oldUrl: "/images/stories/education-support/cover.jpg",
      newKey: "images/stories/training-day/cover.jpg",
    },
  ];

  const replacements = {};
  const updatedMediaAssets = [];

  for (const mapping of mappings) {
    const newUrl = `${publicBaseUrl}/${mapping.newKey}`;
    replacements[mapping.oldUrl] = newUrl;

    const result = await prisma.mediaAsset.updateMany({
      where: { url: mapping.oldUrl },
      data: {
        url: newUrl,
        mimeType: mimeTypeFor(mapping.newKey),
      },
    });

    updatedMediaAssets.push({
      from: mapping.oldUrl,
      to: newUrl,
      matchedRows: result.count,
    });
  }

  const seedPath = path.resolve("packages/seed-data/src/content.json");
  let seedDataUpdated = false;

  try {
    const raw = await fs.readFile(seedPath, "utf8");
    const json = JSON.parse(raw);
    const nextJson = replaceJson(json, replacements);

    if (JSON.stringify(json) !== JSON.stringify(nextJson)) {
      await fs.writeFile(seedPath, `${JSON.stringify(nextJson, null, 2)}\n`, "utf8");
      seedDataUpdated = true;
    }
  } catch (error) {
    console.warn(`Seed data update skipped: ${error.message}`);
  }

  console.log(JSON.stringify({
    ok: true,
    updatedMediaAssets,
    seedDataUpdated,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({
      ok: false,
      error: error.message,
      code: error.code || null,
      meta: error.meta || null,
    }, null, 2));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
