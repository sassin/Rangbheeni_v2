-- Add human-readable event code and remove unused external ID

CREATE SEQUENCE IF NOT EXISTS "Event_eventCode_seq"
START WITH 1001
INCREMENT BY 1;

ALTER TABLE "Event"
ADD COLUMN IF NOT EXISTS "eventCode" INTEGER;

UPDATE "Event"
SET "eventCode" = nextval('"Event_eventCode_seq"')
WHERE "eventCode" IS NULL;

ALTER TABLE "Event"
ALTER COLUMN "eventCode" SET DEFAULT nextval('"Event_eventCode_seq"');

ALTER TABLE "Event"
ALTER COLUMN "eventCode" SET NOT NULL;

ALTER SEQUENCE "Event_eventCode_seq"
OWNED BY "Event"."eventCode";

CREATE UNIQUE INDEX IF NOT EXISTS "Event_eventCode_key"
ON "Event"("eventCode");

ALTER TABLE "Event" DROP CONSTRAINT IF EXISTS "Event_externalId_key";

ALTER TABLE "Event"
DROP COLUMN IF EXISTS "externalId";
