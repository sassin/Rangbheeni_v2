const fs = require("node:fs/promises");
const path = require("node:path");
const { PrismaClient } = require("@prisma/client");
const { PutObjectCommand, S3Client } = require("@aws-sdk/client-s3");

const prisma = new PrismaClient();

const SOURCE_DIR = process.env.SOURCE_IMAGES_DIR || path.resolve("apps/web/public/images");
const S3_KEY_PREFIX = (process.env.S3_KEY_PREFIX || "images").replace(/^\/+|\/+$/g, "");
const DRY_RUN = process.env.DRY_RUN === "1";

const bucket = process.env.S3_BUCKET;
const publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;
const endpoint = process.env.S3_ENDPOINT || undefined;

if (!bucket) throw new Error("S3_BUCKET is required.");
if (!publicBaseUrl) throw new Error("S3_PUBLIC_BASE_URL is required.");

const client = new S3Client({
  region: process.env.S3_REGION || "auto",
  endpoint,
  forcePathStyle: true,
  credentials:
    process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.S3_ACCESS_KEY_ID,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
        }
      : undefined,
});

const contentTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
};

function toPosix(value) {
  return value.split(path.sep).join("/");
}

function publicUrlForKey(key) {
  return `${publicBaseUrl.replace(/\/$/, "")}/${key}`;
}

function contentTypeFor(filePath) {
  return contentTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream";
}

async function listFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }

  return files;
}

async function uploadFile(filePath) {
  const relative = toPosix(path.relative(SOURCE_DIR, filePath));
  const key = `${S3_KEY_PREFIX}/${relative}`;
  const body = await fs.readFile(filePath);
  const contentType = contentTypeFor(filePath);
  const publicUrl = publicUrlForKey(key);

  if (DRY_RUN) {
    console.log(`[dry-run] upload ${relative} -> s3://${bucket}/${key}`);
    return { relative, key, publicUrl, contentType };
  }

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  console.log(`uploaded ${relative} -> ${publicUrl}`);

  return { relative, key, publicUrl, contentType };
}

async function main() {
  const files = await listFiles(SOURCE_DIR);
  const imageFiles = files.filter((file) =>
    [".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".gif"].includes(
      path.extname(file).toLowerCase(),
    ),
  );

  console.log(`Found ${imageFiles.length} image files in ${SOURCE_DIR}`);

  const uploaded = [];

  for (const file of imageFiles) {
    uploaded.push(await uploadFile(file));
  }

  const byOldUrl = new Map();

  for (const item of uploaded) {
    byOldUrl.set(`/${S3_KEY_PREFIX}/${item.relative}`, item);
  }

  const mediaAssets = await prisma.mediaAsset.findMany({
    where: {
      url: {
        startsWith: `/${S3_KEY_PREFIX}/`,
      },
    },
    select: {
      id: true,
      url: true,
    },
  });

  let updated = 0;
  let missingLocalFile = 0;

  for (const asset of mediaAssets) {
    const match = byOldUrl.get(asset.url);

    if (!match) {
      missingLocalFile += 1;
      console.log(`[skip] no local file for DB asset: ${asset.url}`);
      continue;
    }

    if (DRY_RUN) {
      console.log(`[dry-run] update MediaAsset ${asset.id}: ${asset.url} -> ${match.publicUrl}`);
    } else {
      await prisma.mediaAsset.update({
        where: { id: asset.id },
        data: {
          key: match.key,
          url: match.publicUrl,
          mimeType: match.contentType,
        },
      });
    }

    updated += 1;
  }

  console.log(
    JSON.stringify(
      {
        dryRun: DRY_RUN,
        localImageFiles: uploaded.length,
        mediaAssetsMatched: updated,
        mediaAssetsMissingLocalFile: missingLocalFile,
        bucket,
        s3Prefix: S3_KEY_PREFIX,
        publicBaseUrl,
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
