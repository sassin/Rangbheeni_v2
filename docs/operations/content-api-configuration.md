# Content API Configuration

This document lists the environment variables used by the Rangbheeni content API.

The content API serves public website content and some public write endpoints, so it needs server-side request protection. Frontend controls are not enough because bots can call the API directly.

## Where to configure variables

Production:

- Configure these in Railway for the `content-api` service.
- Do not commit secrets to Git.

Local development:

- Use a local `.env` file only if ignored by Git.
- Never commit real database URLs or private API keys.

## Recommended production baseline

~~~env
CORS_ORIGIN=https://rangbheeni-v2-web.vercel.app,http://localhost:3000

CONTENT_PUBLIC_ENABLED=true
CONTENT_BODY_LIMIT=16kb

CONTENT_PUBLIC_READ_WINDOW_MS=60000
CONTENT_PUBLIC_READ_MAX_PER_WINDOW=120

CONTENT_PUBLIC_WRITE_WINDOW_MS=60000
CONTENT_PUBLIC_WRITE_MAX_PER_WINDOW=4

CONTENT_PRIVATE_WINDOW_MS=60000
CONTENT_PRIVATE_MAX_PER_WINDOW=30

CONTENT_MAX_TRACKED_CLIENTS=10000

CONTENT_PUBLIC_CACHE_SECONDS=300
CONTENT_PUBLIC_STALE_SECONDS=600
~~~

Secrets should exist only in Railway or ignored local env files:

~~~env
DATABASE_URL=...
CONTENT_API_PRIVATE_KEY=...
PRIVATE_API_KEY=...
~~~

---

## 1. Server and network configuration

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `PORT` | Railway-managed | Generic platform port. Railway usually injects this. | Leave managed by Railway |
| `CONTENT_API_PORT` | `4000` | Explicit content API port, mainly for local development. | Usually not needed in Railway |
| `CORS_ORIGIN` | `http://localhost:3000` | Comma-separated list of frontend origins allowed to call the content API. | `https://rangbheeni-v2-web.vercel.app,http://localhost:3000` |
| `CONTENT_BODY_LIMIT` | `16kb` | Maximum JSON/urlencoded request body size accepted by the content API. | `16kb` |

Do not use `CORS_ORIGIN=*` in production.

---

## 2. Public availability controls

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `CONTENT_PUBLIC_ENABLED` | `true` | Main server-side kill switch for `/public/*` routes. | `true` normally; `false` during abuse or maintenance |

To disable public content API access immediately:

~~~env
CONTENT_PUBLIC_ENABLED=false
~~~

This should be used only during severe incidents, because it can affect website content loading.

---

## 3. Public read rate limits

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `CONTENT_PUBLIC_READ_WINDOW_MS` | `60000` | Rate-limit window for public GET requests. | `60000` |
| `CONTENT_PUBLIC_READ_MAX_PER_WINDOW` | `120` | Maximum public read requests per client/IP during the read window. | `120` |

Applies mainly to routes such as:

- `GET /public/home`
- `GET /public/pages/:key`
- `GET /public/products`
- `GET /public/events`
- `GET /public/stories`
- `GET /public/gallery-images`
- `GET /public/announcement/active`

These endpoints are public and cacheable, but still need protection against direct API scraping or repeated bot calls.

---

## 4. Public write rate limits

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `CONTENT_PUBLIC_WRITE_WINDOW_MS` | `60000` | Rate-limit window for public write requests. | `60000` |
| `CONTENT_PUBLIC_WRITE_MAX_PER_WINDOW` | `4` | Maximum public write requests per client/IP during the write window. | `4` |

Applies mainly to:

- `POST /public/newsletter/subscribe`

Public write limits should be stricter than public read limits because writes touch the database and are more likely to be abused.

---

## 5. Private/admin route rate limits

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `CONTENT_PRIVATE_WINDOW_MS` | `60000` | Rate-limit window for private/admin operations. | `60000` |
| `CONTENT_PRIVATE_MAX_PER_WINDOW` | `30` | Maximum private/admin requests per client/IP during the window. | `30` |
| `CONTENT_API_PRIVATE_KEY` | none | Private API key used by content API protected endpoints. | Strong random secret |
| `PRIVATE_API_KEY` | none | Legacy fallback private key name. | Prefer `CONTENT_API_PRIVATE_KEY` |

Private routes should require `x-api-key`.

Do not expose private keys in:

- frontend code
- Vercel public env vars
- browser requests
- documentation with real values

---

## 6. Rate-limit state controls

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `CONTENT_MAX_TRACKED_CLIENTS` | `10000` | Maximum number of in-memory client/IP buckets retained for rate limiting. | `10000` |

The current implementation uses in-memory rate-limit buckets. This is acceptable for a small single-instance Railway deployment.

If the content API later scales to multiple instances, move these counters to Redis or Upstash so limits apply across instances.

---

## 7. Public cache headers

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `CONTENT_PUBLIC_CACHE_SECONDS` | `300` | Shared-cache lifetime for public GET responses. | `300` |
| `CONTENT_PUBLIC_STALE_SECONDS` | `600` | Stale-while-revalidate window for public GET responses. | `600` |

The API sends cache headers like:

~~~txt
Cache-Control: public, max-age=0, s-maxage=300, stale-while-revalidate=600
~~~

This helps hosting/CDN layers reuse public API responses instead of hitting Railway and the database for every request.

Use shorter cache values when content is changing frequently.

Use longer cache values when content is stable and you want lower backend load.

---

## 8. Database and secrets

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `DATABASE_URL` | none | PostgreSQL database connection URL used by Prisma. | Secret in Railway |
| `CONTENT_API_PRIVATE_KEY` | none | Preferred private key for protected content operations. | Strong random secret |
| `PRIVATE_API_KEY` | none | Backward-compatible fallback private key. | Avoid if `CONTENT_API_PRIVATE_KEY` is set |

Never commit these values.

---

## 9. Emergency playbooks

### Disable public content API

~~~env
CONTENT_PUBLIC_ENABLED=false
~~~

Use only during serious incidents because public site sections may lose dynamic content.

### Reduce database pressure

~~~env
CONTENT_PUBLIC_READ_MAX_PER_WINDOW=60
CONTENT_PUBLIC_WRITE_MAX_PER_WINDOW=2
CONTENT_PUBLIC_CACHE_SECONDS=600
CONTENT_PUBLIC_STALE_SECONDS=1800
~~~

### Strict production-only browser origin

~~~env
CORS_ORIGIN=https://rangbheeni-v2-web.vercel.app
~~~

Use this when you do not want localhost or preview deployments to call production content API.

### Allow preview deployments temporarily

~~~env
CORS_ORIGIN=https://rangbheeni-v2-web.vercel.app,https://your-preview-domain.vercel.app,http://localhost:3000
~~~

Do not leave unnecessary preview domains in production long-term.

---

## 10. Maintenance checklist

Before changing limits, check:

- Is the site under bot traffic?
- Are Railway CPU or memory limits being hit?
- Are database connections increasing?
- Are valid users getting blocked?
- Is content stale for too long?
- Are public write endpoints being spammed?

After changing limits, test:

~~~powershell
Invoke-RestMethod "https://content-api-production-20d9.up.railway.app/health"
~~~

Then test one public read route:

~~~powershell
Invoke-RestMethod "https://content-api-production-20d9.up.railway.app/public/gallery-images"
~~~

And one protected/private operation only if needed.

---

## 11. Variable ownership

| Category | Prefer env var or DB? | Reason |
|---|---|---|
| Secrets | Env | Must not depend on DB and must not be visible in frontend |
| Rate limits | Env | Must work even if DB is down |
| Kill switches | Env | Reliable during incidents |
| Cache timings | Env | Operational control without schema changes |
| Public content and copy | DB | Editable content, not security-critical |
| Gallery/story/event metadata | DB | Content-managed data |
| Uploaded media files | R2 or static web assets | Do not store binary files in DB |

---

## 12. Media URL rewrite configuration

| Variable | Default | Description | Recommended production value |
|---|---:|---|---|
| `MEDIA_SOURCE_BASE_URL` | unset | Existing media URL base to replace in API responses. Usually the old R2 public base. | Set only after custom media domain is ready |
| `MEDIA_PUBLIC_BASE_URL` | unset | New public media URL base returned to the frontend. Usually the custom media domain. | Set only after custom media domain is ready |
| `R2_PUBLIC_BASE_URL` | unset | Legacy/fallback source base used by scripts and media utilities. | Prefer `MEDIA_PUBLIC_BASE_URL` for new usage |

Leave these unset until the custom media domain works.

Do not set this early:

~~~env
MEDIA_SOURCE_BASE_URL=https://pub-cf212b8e52d44f7a99d8dac828687929.r2.dev
MEDIA_PUBLIC_BASE_URL=https://media.rangbheeni.org
~~~

Set it only after this test works in the browser:

~~~txt
https://media.rangbheeni.org/images/gallery/gallery-01.jpeg
~~~

If these variables are unset, the content API returns existing database media URLs unchanged.
