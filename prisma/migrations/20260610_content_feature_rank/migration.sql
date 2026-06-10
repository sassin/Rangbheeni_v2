ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "featuredRank" INTEGER;
ALTER TABLE "Story" ADD COLUMN IF NOT EXISTS "featuredRank" INTEGER;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "featuredRank" INTEGER;

WITH ranked_products AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY "sortOrder" ASC, COALESCE("publishedAt", "createdAt") DESC, "name" ASC
  ) AS rank
  FROM "Product"
  WHERE "featured" = true
)
UPDATE "Product"
SET "featuredRank" = ranked_products.rank
FROM ranked_products
WHERE "Product".id = ranked_products.id
  AND "Product"."featuredRank" IS NULL;

WITH ranked_stories AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY "sortOrder" ASC, COALESCE("publishedDate", "createdAt") DESC, "title" ASC
  ) AS rank
  FROM "Story"
  WHERE "featured" = true
)
UPDATE "Story"
SET "featuredRank" = ranked_stories.rank
FROM ranked_stories
WHERE "Story".id = ranked_stories.id
  AND "Story"."featuredRank" IS NULL;

WITH ranked_events AS (
  SELECT id, ROW_NUMBER() OVER (
    ORDER BY "sortOrder" ASC, "startDate" DESC, "title" ASC
  ) AS rank
  FROM "Event"
  WHERE "featured" = true
)
UPDATE "Event"
SET "featuredRank" = ranked_events.rank
FROM ranked_events
WHERE "Event".id = ranked_events.id
  AND "Event"."featuredRank" IS NULL;

CREATE INDEX IF NOT EXISTS "Product_status_featuredRank_publishedAt_name_idx"
ON "Product" ("status", "featuredRank", "publishedAt", "name");

CREATE INDEX IF NOT EXISTS "Story_status_featuredRank_publishedDate_title_idx"
ON "Story" ("status", "featuredRank", "publishedDate", "title");

CREATE INDEX IF NOT EXISTS "Event_status_featuredRank_startDate_title_idx"
ON "Event" ("status", "featuredRank", "startDate", "title");
