CREATE TABLE IF NOT EXISTS "GalleryImage" (
  "id" TEXT NOT NULL,
  "mediaId" TEXT NOT NULL,
  "hoverText" TEXT,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "sortOrder" INTEGER NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "GalleryImage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "GalleryImage_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "GalleryImage_mediaId_key" ON "GalleryImage"("mediaId");
CREATE UNIQUE INDEX IF NOT EXISTS "GalleryImage_sortOrder_key" ON "GalleryImage"("sortOrder");
CREATE INDEX IF NOT EXISTS "GalleryImage_visible_sortOrder_idx" ON "GalleryImage"("visible", "sortOrder");
