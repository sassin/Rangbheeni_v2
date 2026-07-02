const fs = require("node:fs");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const manifestPath = process.argv[2] || "content/gallery/gallery.json";
const PUBLIC_BASE_URL =
  process.env.MEDIA_PUBLIC_BASE_URL ||
  process.env.R2_PUBLIC_BASE_URL;

if (!PUBLIC_BASE_URL) {
  console.error(
    "Missing MEDIA_PUBLIC_BASE_URL or R2_PUBLIC_BASE_URL. Refusing to register gallery images with an implicit media domain."
  );
  process.exit(1);
}

function cleanBaseUrl(value) {
  return String(value).replace(/\/+$/, "");
}

function mimeTypeFor(file) {
  const ext = path.extname(file).toLowerCase();

  if (ext === ".jpg" || ext === ".jpeg") return "image/jpeg";
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  if (ext === ".gif") return "image/gif";

  return "application/octet-stream";
}

function safeObjectName(file) {
  const parsed = path.parse(file);
  const base = parsed.name
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();

  const ext = parsed.ext.toLowerCase();

  return `${base}${ext}`;
}

async function publicUrlExists(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    if (response.ok) return true;

    const getResponse = await fetch(url, { method: "GET" });
    return getResponse.ok;
  } catch {
    return false;
  }
}

async function upsertMediaAsset({ key, url, file, altText }) {
  const existing = await prisma.mediaAsset.findFirst({
    where: { key },
  });

  const data = {
    key,
    url,
    altText: altText || "Rangbheeni gallery image",
    mimeType: mimeTypeFor(file),
  };

  if (existing) {
    return prisma.mediaAsset.update({
      where: { id: existing.id },
      data,
    });
  }

  return prisma.mediaAsset.create({
    data,
  });
}

async function main() {
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`Missing gallery manifest: ${manifestPath}`);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

  if (!Array.isArray(manifest.images)) {
    throw new Error("gallery.json must contain an images array.");
  }

  const registered = [];
  const skipped = [];

  for (const item of manifest.images) {
    if (!item.id) throw new Error(`Missing id for ${item.file}`);
    if (!item.file) throw new Error(`Missing file for ${item.id}`);
    if (!Number.isInteger(item.sortOrder) || item.sortOrder < 1) {
      throw new Error(`Invalid sortOrder for ${item.id}. Use 1, 2, 3...`);
    }

    const objectName = safeObjectName(item.file);
    const key = item.key || `images/gallery/${objectName}`;
    const url = `${cleanBaseUrl(publicBaseUrl)}/${key}`;

    const exists = await publicUrlExists(url);

    if (!exists) {
      skipped.push({
        id: item.id,
        file: item.file,
        expectedUrl: url,
        reason: "R2 public URL returned 404/not reachable",
      });
      continue;
    }

    const media = await upsertMediaAsset({
      key,
      url,
      file: item.file,
      altText: item.hoverText || item.altText || "Rangbheeni gallery image",
    });

    const galleryImage = await prisma.galleryImage.upsert({
      where: { id: item.id },
      update: {
        mediaId: media.id,
        hoverText: item.hoverText || null,
        visible: item.visible !== false,
        sortOrder: item.sortOrder,
      },
      create: {
        id: item.id,
        mediaId: media.id,
        hoverText: item.hoverText || null,
        visible: item.visible !== false,
        sortOrder: item.sortOrder,
      },
    });

    registered.push({
      id: galleryImage.id,
      sortOrder: galleryImage.sortOrder,
      visible: galleryImage.visible,
      hoverText: galleryImage.hoverText,
      key,
      url,
    });
  }

  console.log(JSON.stringify(
    {
      ok: true,
      registeredCount: registered.length,
      skippedCount: skipped.length,
      registered,
      skipped,
    },
    null,
    2
  ));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
