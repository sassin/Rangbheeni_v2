# Rangbheeni Platform

Final production architecture for the Rangbheeni public website, content backend, S3 media storage, and Rangbheeni-only AI chatbot.

## Architecture

```txt
apps/web             Next.js public website, deployed on Vercel
apps/content-api     NestJS public content API, deployed on Railway
apps/chatbot-api     NestJS Rangbheeni-only chatbot API, deployed on Railway
prisma/              PostgreSQL schema, migration, and seed data
packages/shared-types Shared DTOs used by services
packages/seed-data   Imported seed copy of the current Rangbheeni content
```

Public visitors do not log in. The website is one-way information only.

Admin screens are intentionally not part of the initial UI. Content can be changed through database updates, seed scripts, or private API scripts. The schema is designed so that an admin UI can later be added without changing the public architecture.

## Services

### Web

- Host: Vercel
- Source: `apps/web`
- Required env:

```bash
NEXT_PUBLIC_CONTENT_API_URL=https://your-content-api.up.railway.app
NEXT_PUBLIC_CHATBOT_API_URL=https://your-chatbot-api.up.railway.app
```

### Content API

- Host: Railway
- Source: `apps/content-api`
- Database: Railway PostgreSQL with pgvector support
- Required env:

```bash
DATABASE_URL=postgresql://...
CONTENT_API_PORT=4000
CORS_ORIGIN=https://your-vercel-domain.vercel.app
PRIVATE_API_KEY=replace-with-long-random-string
S3_REGION=us-east-1
S3_BUCKET=rangbheeni-media
S3_ENDPOINT=
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_BASE_URL=https://your-s3-public-domain
```

### Chatbot API

- Host: Railway
- Source: `apps/chatbot-api`
- Required env:

```bash
DATABASE_URL=postgresql://...
CHATBOT_API_PORT=4100
CORS_ORIGIN=https://your-vercel-domain.vercel.app
CHATBOT_PRIVATE_API_KEY=replace-with-long-random-string
LLM_BASE_URL=https://your-llm-provider.example/v1
LLM_API_KEY=...
LLM_CHAT_MODEL=...
LLM_EMBEDDING_MODEL=...
CHATBOT_MIN_SCORE=0.72
RANGBHEENI_CONTACT_EMAIL=enquiries.rangbheeni@gmail.com
```

The chatbot is provider-compatible with `/chat/completions` and `/embeddings` APIs. Model names are provided entirely through environment variables.

## Local development

```bash
cp .env.example .env
npm install
docker compose up -d
npm run prisma:generate
npx prisma migrate deploy
npm run seed
npm run dev:content-api
npm run dev:chatbot-api
npm run dev:web
```

Run chatbot indexing after the database has been seeded and LLM embedding variables are configured:

```bash
CHATBOT_API_URL=http://localhost:4100 \
CHATBOT_PRIVATE_API_KEY=replace-with-long-random-string \
npm run chatbot:reindex
```

If no embedding provider is configured, the chatbot service stores chunks without vectors and uses keyword retrieval. For production, configure embeddings and run reindex.

## Database

Main tables:

- `ProductCategory`
- `Product`
- `ProductImage`
- `Event`
- `Story`
- `PageContent`
- `Announcement`
- `MediaAsset`
- `ChatbotDocument`
- `ChatbotChunk`
- `ChatbotMessage`

`PageContent` stores flexible page content for About, Journey, Impact, navigation, footer, catalogue, and site settings.

## S3 media flow

1. Call `POST /private/media/presigned-upload` on content API with `x-api-key`.
2. Upload the file directly to the returned `uploadUrl`.
3. Call `POST /private/media/complete` to save the asset metadata.
4. Attach the resulting media asset to products, stories, events, or announcements by database update or future admin UI.

The uploaded code-only ZIP did not include image assets. Existing content is seeded with the current image paths. When the real image folder is available, upload those images to S3 and update `MediaAsset.url` / `ProductImage.url` values.

## Public API endpoints

```txt
GET /health
GET /public/home
GET /public/site-settings
GET /public/navigation
GET /public/pages/:key
GET /public/product-categories
GET /public/products
GET /public/products/:slug
GET /public/events
GET /public/events/:slug
GET /public/stories
GET /public/stories/:slug
GET /public/announcement/active
```

## Private API endpoints

All private endpoints require `x-api-key`.

```txt
POST /private/media/presigned-upload
POST /private/media/complete
POST /private/announcements/publish
POST /chat/reindex
```

## Chatbot behavior

The chatbot answers only from approved Rangbheeni content in `ChatbotDocument` / `ChatbotChunk`.

If the answer is not found in the approved content, it returns:

```txt
I do not have that information in Rangbheeni’s published content. Please contact Rangbheeni at enquiries.rangbheeni@gmail.com.
```

It must not guess prices, stock availability, delivery timelines, discounts, return policy, event dates, or custom order commitments.

## Deployment order

1. Create Railway PostgreSQL.
2. Enable the `vector` extension. The migration already includes `CREATE EXTENSION IF NOT EXISTS vector;`.
3. Deploy content API to Railway.
4. Run migrations and seed:

```bash
npx prisma migrate deploy
npm run seed
```

5. Deploy chatbot API to Railway.
6. Configure LLM env variables.
7. Run chatbot reindex.
8. Deploy web app to Vercel.
9. Set Vercel env values to Railway service URLs.
10. Publish announcement when needed using private endpoint or direct DB update.

## Content update without admin screen

For now, content changes can be made by:

- Updating DB rows directly.
- Running targeted scripts.
- Updating seed data and re-running seed for controlled content updates.
- Using private endpoints for media and announcement operations.

The public website remains read-only.
