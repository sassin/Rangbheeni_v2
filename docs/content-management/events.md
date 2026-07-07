# Rangbheeni Events Content Management Guide

This document explains how the Rangbheeni team should prepare, add, edit, publish, and manage events for the Events page.

The Events page is powered by the Content API and database. Event content should not be hard-coded in the frontend. The frontend should render the event data prepared by the service.

---

## 1. Event content ownership

Events are managed as database content.

Use the database/content scripts for:

- adding a new event
- adding multiple events
- editing an existing event
- attaching or replacing an event image
- featuring or unfeaturing an event
- publishing, drafting, or archiving an event

Do not add event content directly inside React components.

---

## 2. Required event fields

Every event must provide these fields.

| Field | Required | Description | Example |
|---|---:|---|---|
| `title` | Yes | Public event title. Keep clear and readable. | `Swachhta Pakhwada 2026: Textile Circularity & Sustainability Initiative` |
| `slug` | Yes | Public URL-safe identifier. Lowercase, kebab-case, stable after publishing. | `swachhta-pakhwada-2026-textile-circularity-sustainability-initiative` |
| `eventType` | Yes | Short category label shown on the card. | `Sustainability Initiative` |
| `shortDescription` | Yes | Short summary for the collapsed event card. | `A textile circularity and sustainability initiative with MCL.` |
| `fullDescription` | Yes | Expanded event body. Use paragraphs. | See formatting rules below. |
| `startDate` | Yes | Event start date/time stored as UTC ISO date. | `2026-06-29T09:00:00.000Z` |
| `status` | Yes | Publication status. Usually `published`. | `published` |

---

## 3. Optional event fields

| Field | Use when | Example |
|---|---|---|
| `eventCode` | Human-readable internal/admin event number. Auto-generated or manually managed if needed. | `1002` |
| `city` | Use for internal/search context if needed. Do not repeat city at the end of the description. | `Sambalpur` |
| `venue` | Specific venue name. Leave empty/null if not needed. | `Mahanadi Coalfields Limited` |
| `address` | Display location. The frontend shows this as `Address:`. | `Sambalpur, Odisha` |
| `endDate` | Only for multi-day events. Leave null for one-day events. | `2026-06-27T09:00:00.000Z` |
| `timeText` | Human-readable time if needed. | `10:00 AM – 4:00 PM` |
| `ctaLabel` | Button text. If empty, default inquiry text is used. | `Register interest` |
| `ctaUrl` | Button destination. If empty, inquiry email fallback is used. | `mailto:enquiries.rangbheeni@gmail.com` |
| `featured` | Legacy/simple featured flag. Prefer `featuredRank` for ordering. | `true` |
| `featuredRank` | Controls featured ordering. Lower number appears first. | `1` |
| `sortOrder` | Optional manual ordering support. | `10` |
| `imageId` | Links the event to one primary image in `MediaAsset`. | `cm...` |
| `publishedAt` | Publication timestamp if needed. | `2026-06-29T09:00:00.000Z` |

---

## 4. Field rules for the team

### Title

Recommended length:

- ideal: 45 to 90 characters
- maximum: around 120 characters

Use descriptive titles, not generic titles.

Good:

```text
Swachhta Pakhwada 2026: Textile Circularity & Sustainability Initiative
Avoid:

Workshop
Slug

The slug is used in public URLs.

Rules:

lowercase only
use hyphens between words
no spaces
no special punctuation
do not change after publishing unless redirects are handled

Example:

swachhta-pakhwada-2026-textile-circularity-sustainability-initiative
Event type

Keep it short.

Recommended:

Workshop
Internship
Sustainability Initiative
Training Program
Community Event
Exhibition
Awareness Session

Avoid long category text.

Short description

Used on collapsed cards.

Recommended length:

ideal: 120 to 180 characters
maximum: 220 characters

It should summarize the event without repeating the title.

Example:

A textile circularity and sustainability initiative promoting responsible consumption, reuse, and community-led environmental action.
Full description

Used in the expanded card.

Recommended length:

ideal: 2 to 5 paragraphs
ideal paragraph length: 40 to 90 words
maximum recommended total: 450 to 600 words
avoid one very long block of text

Use blank lines between paragraphs.

Correct format:

Rangbheeni is pleased to collaborate with Mahanadi Coalfields Limited (MCL) as part of Swachhta Pakhwada 2026 to promote sustainable living, responsible consumption, and textile waste reduction.

The initiative will feature an awareness session on textile waste and circular economy practices, a hands-on DIY Appliqué Tote Bag Workshop, a sustainable product exhibition, and a clothes collection drive aimed at encouraging the responsible reuse and upcycling of pre-loved textiles.

Through this engagement, participants will gain practical insights into textile sustainability while contributing to waste reduction and circular economy practices. The programme also highlights the role of women-led social enterprises in creating sustainable livelihood opportunities and environmental impact.

Together, we aim to transform awareness into action and demonstrate how small everyday choices can contribute to a more sustainable future.

Do not add city/location at the end of the description. Use address for location.

Avoid this:

Together, we aim to transform awareness into action. Sambalpur, Odisha.

Use this instead:

address: Sambalpur, Odisha
5. Date rules
One-day event

For a one-day event, use:

startDate: 2026-06-29T09:00:00.000Z
endDate: null

The frontend should not show separate Start: and End: fields for a one-day event.

Multi-day event

For a multi-day event, use both startDate and endDate.

Example:

startDate: 2026-05-27T09:00:00.000Z
endDate: 2026-06-27T09:00:00.000Z

The frontend will show:

Start: Mon, May 27, 2026
End: Sat, Jun 27, 2026
Time handling

Use UTC ISO format in the database.

Recommended default when exact time is not important:

T09:00:00.000Z

If the public needs to see a specific time, use timeText.

Example:

timeText: 10:00 AM – 4:00 PM
6. Location rules

Use location fields instead of adding location into the description.

Field    Use
city    Internal/search/location context
venue    Specific organization/building/place
address    Public display location

Example:

city: Sambalpur
venue: Mahanadi Coalfields Limited
address: Sambalpur, Odisha

If the venue should not appear, set:

venue: null

The frontend will skip empty venue values.

7. Images

The current event model supports one primary image per event.

Use the event image for:

event poster
event cover image
workshop photo
collaboration graphic
invitation image

Do not place event images in the frontend public folder.

Use R2/media storage.

Recommended R2 path format:

images/events/YYYY-MM-DD/cover.png

Example:

images/events/2026-06-29/cover.png

Public URL example:

https://<public-r2-domain>/images/events/2026-06-29/cover.png
Recommended image size

For event cards and expanded display:

Use    Recommended size
Standard cover/poster    1600 x 1000 px
Poster-style vertical image    1200 x 1600 px
Minimum acceptable width    1200 px
Format    .jpg, .png, or .webp

The frontend uses contained image display, so poster-style images will not be aggressively cropped.

Image requirements from team

When submitting an event image, provide:

image file
alt text
image date folder
event slug or eventCode

Example alt text:

Participants attending Rangbheeni's textile circularity workshop during Swachhta Pakhwada 2026.
8. How many events can we have?

There is no practical hard database limit for normal usage.

Recommended content limits for the current Events page:

Scope    Recommendation
Featured events on homepage    3
Events page visible list    6 to 20 is comfortable
Total published events    Fine up to 100+
If events exceed 100    Add pagination, year filters, or archive filtering

Current page design is best when the event list is curated. Do not feature too many events at once.

9. Publishing rules

Use status.

Status    Meaning
published    Visible publicly
draft    Not visible publicly
archived    Historical/internal, depending on API filters

Only published events should appear on the public Events page.

10. Featured event rules

Featured events are used for priority ordering and homepage display.

Recommended:

featuredRank: 1
featuredRank: 2
featuredRank: 3

Lower number appears first.

Use featuredRank: null for normal events.

Avoid featuring more than 3 to 5 events at a time.

11. Sorting rules

Events should be sorted service-side.

Recommended sorting:

featured/ranked events first
newest start date first
title alphabetically as final tie-breaker

The frontend should not own event sorting logic.

12. Service-side display shaping

The Content API should prepare display-ready fields for the frontend.

The service should compute:

descriptionParagraphs
dateBadge
startLabel
endLabel
showDateRange
ctaText
ctaHref

The frontend should render these fields and handle only UI behavior such as:

expand/collapse
animation
layout
conditional display

Avoid putting non-trivial date formatting, paragraph splitting, or event business rules in the frontend.

13. Add one new event

Use a controlled script, not a manual frontend change.

Example script structure:

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.event.create({
    data: {
      slug: "example-event-2026",
      title: "Example Event 2026",
      eventType: "Workshop",
      shortDescription: "Short public summary for the collapsed event card.",
      fullDescription: `First paragraph.

Second paragraph.

Third paragraph.`,
      city: "Betul",
      venue: null,
      address: "Betul, Madhya Pradesh",
      startDate: new Date("2026-07-15T09:00:00.000Z"),
      endDate: null,
      timeText: null,
      ctaLabel: null,
      ctaUrl: null,
      featured: false,
      featuredRank: null,
      status: "published",
      publishedAt: new Date(),
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
14. Add multiple events

Use createMany only when no image relation is needed.

For events with images, use individual create calls so each event can be linked to its MediaAsset.

Example:

await prisma.event.createMany({
  data: [
    {
      slug: "event-one-2026",
      title: "Event One 2026",
      eventType: "Workshop",
      shortDescription: "Short summary.",
      fullDescription: "Full event description.",
      city: "Betul",
      venue: null,
      address: "Betul, Madhya Pradesh",
      startDate: new Date("2026-07-15T09:00:00.000Z"),
      status: "published",
    },
    {
      slug: "event-two-2026",
      title: "Event Two 2026",
      eventType: "Training Program",
      shortDescription: "Short summary.",
      fullDescription: "Full event description.",
      city: "Sambalpur",
      venue: null,
      address: "Sambalpur, Odisha",
      startDate: new Date("2026-08-01T09:00:00.000Z"),
      status: "published",
    },
  ],
});
15. Add event with image

Step 1: upload image to R2.

Example key:

images/events/2026-06-29/cover.png

Step 2: create or find the MediaAsset.

Step 3: attach the media asset to the event using imageId.

Example:

const media = await prisma.mediaAsset.upsert({
  where: {
    key: "images/events/2026-06-29/cover.png",
  },
  update: {
    url: "https://<public-r2-domain>/images/events/2026-06-29/cover.png",
    altText: "Participants attending Rangbheeni's textile circularity workshop.",
  },
  create: {
    key: "images/events/2026-06-29/cover.png",
    url: "https://<public-r2-domain>/images/events/2026-06-29/cover.png",
    mimeType: "image/png",
    altText: "Participants attending Rangbheeni's textile circularity workshop.",
  },
});

await prisma.event.update({
  where: { slug: "swachhta-pakhwada-2026-textile-circularity-sustainability-initiative" },
  data: {
    imageId: media.id,
  },
});

16. Edit an existing event

Use slug, id, or eventCode to identify the event.

Preferred for team operations:

eventCode

Example update:

await prisma.event.update({
  where: { id: "evt_1002" },
  data: {
    venue: null,
    address: "Sambalpur, Odisha",
    fullDescription: `Updated first paragraph.

Updated second paragraph.`,
  },
});

If using SQL, remember the table and camel-case columns are quoted:

UPDATE "Event"
SET "venue" = NULL,
    "address" = 'Sambalpur, Odisha'
WHERE "id" = 'evt_1002';
17. Unpublish or archive an event

To hide an event from the public page:

await prisma.event.update({
  where: { id: "evt_1002" },
  data: {
    status: "draft",
  },
});

To archive it:

await prisma.event.update({
  where: { id: "evt_1002" },
  data: {
    status: "archived",
  },
});
18. Team submission checklist

Before adding an event, the team should provide:

Title
Event type
Short description
Full description with paragraph breaks
Start date
End date, only if multi-day
Time text, if public time matters
City
Venue, if any
Address
CTA label, if any
CTA URL, if any
Featured yes/no
Featured rank, if featured
Image, if any
Image alt text, if image is provided
Publication status
19. Quality checklist before publishing

Check:

Title is clear
Slug is lowercase kebab-case
Short description is not too long
Full description has paragraph breaks
City is not repeated at the end of description
Address field is filled if location should show publicly
One-day event does not have unnecessary endDate
Multi-day event has both startDate and endDate
Image has alt text
CTA link works
Status is published
Featured rank is intentional
Events page loads without console errors
Content API returns display-ready event fields
20. Current limitations

Current limitations:

One primary image per event
No event gallery yet
No admin UI yet
No pagination yet
No year/month filter yet
No automatic redirect if slug changes

If the event archive grows significantly, add:

pagination
year filter
event type filter
separate upcoming/past sections
admin event editor
multi-image event gallery
21. Recommended operating practice

For production stability:

Prepare event content in this document format.
Add/update events through a controlled script.
Test locally against the target database.
Confirm Content API response.
Confirm /events page.
Commit scripts/docs/schema changes if needed.
Deploy Content API first when DTO fields change.
Deploy frontend after API compatibility is confirmed.

Do not deploy frontend changes that require new API fields before the Content API is ready, unless the frontend has defensive fallbacks.

