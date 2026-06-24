-- CreateEnum
CREATE TYPE "StoryBlockType" AS ENUM ('paragraph', 'quote', 'image', 'subheading');

-- CreateTable
CREATE TABLE "StoryBlock" (
    "id" TEXT NOT NULL,
    "storyId" TEXT NOT NULL,
    "type" "StoryBlockType" NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "text" TEXT,
    "mediaId" TEXT,
    "caption" TEXT,
    "altText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoryBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StoryBlock_storyId_idx" ON "StoryBlock"("storyId");

-- CreateIndex
CREATE INDEX "StoryBlock_mediaId_idx" ON "StoryBlock"("mediaId");

-- CreateIndex
CREATE UNIQUE INDEX "StoryBlock_storyId_sortOrder_key" ON "StoryBlock"("storyId", "sortOrder");

-- AddForeignKey
ALTER TABLE "StoryBlock"
ADD CONSTRAINT "StoryBlock_storyId_fkey"
FOREIGN KEY ("storyId") REFERENCES "Story"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoryBlock"
ADD CONSTRAINT "StoryBlock_mediaId_fkey"
FOREIGN KEY ("mediaId") REFERENCES "MediaAsset"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
