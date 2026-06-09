CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE "ContentStatus" AS ENUM ('draft', 'published', 'archived');
CREATE TYPE "AnnouncementDisplayType" AS ENUM ('modal', 'banner');

CREATE TABLE "MediaAsset" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT UNIQUE,
  "url" TEXT NOT NULL,
  "altText" TEXT,
  "mimeType" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "sizeBytes" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ProductCategory" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "label" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'published',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Product" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "externalId" TEXT UNIQUE,
  "name" TEXT NOT NULL,
  "categoryId" TEXT REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "shortDescription" TEXT NOT NULL,
  "longDescription" TEXT,
  "storyTitle" TEXT,
  "story" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "status" "ContentStatus" NOT NULL DEFAULT 'published',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ProductImage" (
  "id" TEXT PRIMARY KEY,
  "productId" TEXT NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "mediaId" TEXT REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "url" TEXT NOT NULL,
  "altText" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("productId", "sortOrder")
);

CREATE TABLE "Event" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "externalId" TEXT UNIQUE,
  "title" TEXT NOT NULL,
  "eventType" TEXT,
  "shortDescription" TEXT,
  "fullDescription" TEXT,
  "city" TEXT,
  "venue" TEXT,
  "address" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "timeText" TEXT,
  "ctaLabel" TEXT,
  "ctaUrl" TEXT,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "status" "ContentStatus" NOT NULL DEFAULT 'published',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "imageId" TEXT REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Story" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "featured" BOOLEAN NOT NULL DEFAULT false,
  "publishedDate" TIMESTAMP(3),
  "status" "ContentStatus" NOT NULL DEFAULT 'published',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "coverImageId" TEXT REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "sections" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "PageContent" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "title" TEXT,
  "content" JSONB NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'published',
  "publishedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Announcement" (
  "id" TEXT PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "displayType" "AnnouncementDisplayType" NOT NULL DEFAULT 'modal',
  "ctaLabel" TEXT,
  "ctaUrl" TEXT,
  "imageId" TEXT REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  "status" "ContentStatus" NOT NULL DEFAULT 'draft',
  "startsAt" TIMESTAMP(3),
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ChatbotDocument" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT,
  "content" TEXT NOT NULL,
  "status" "ContentStatus" NOT NULL DEFAULT 'published',
  "approvedForChatbot" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("sourceType", "sourceId")
);

CREATE TABLE "ChatbotChunk" (
  "id" TEXT PRIMARY KEY,
  "documentId" TEXT NOT NULL REFERENCES "ChatbotDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "chunkText" TEXT NOT NULL,
  "metadata" JSONB,
  "embedding" vector,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ChatbotMessage" (
  "id" TEXT PRIMARY KEY,
  "sessionId" TEXT,
  "userMessage" TEXT NOT NULL,
  "assistantResponse" TEXT NOT NULL,
  "fallbackUsed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "Product_status_featured_idx" ON "Product"("status", "featured");
CREATE INDEX "Event_status_startDate_idx" ON "Event"("status", "startDate");
CREATE INDEX "Story_status_featured_idx" ON "Story"("status", "featured");
CREATE INDEX "Announcement_status_dates_idx" ON "Announcement"("status", "startsAt", "endsAt");
CREATE INDEX "ChatbotDocument_approved_idx" ON "ChatbotDocument"("approvedForChatbot", "status");
