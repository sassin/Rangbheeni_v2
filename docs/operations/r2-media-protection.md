# R2 Media Protection and Configuration

This document explains how Rangbheeni production media should be served and protected.

The website currently uses Cloudflare R2 for content-managed media such as gallery, event, and story images. Landing-critical assets should live in the web app `public/` folder so the landing page can load even if R2 or the content API is unavailable.

## Production target

Do not use the public `r2.dev` URL as the long-term production media URL.

Target pattern:

~~~txt
https://media.rangbheeni.org/images/gallery/gallery-01.jpeg
https://media.rangbheeni.org/images/stories/story-name/cover-v1.jpg
https://media.rangbheeni.org/images/events/event-name/cover-v1.jpg
~~~

The exact domain can change, but production should use a custom media domain in front of R2.

## Why a custom domain is required

Cloudflare notes that the public `r2.dev` endpoint is intended for non-production traffic. To use access management, cache, and bot-management features, a custom domain should be configured for the R2 bucket.

A custom domain also gives us a clean operational separation:

- website app: `rangbheeni-v2-web.vercel.app`
- content API: Railway service or future API domain
- chatbot API: Railway service or future API domain
- media: `media.rangbheeni.org`

---

## 1. What belongs in R2

Use R2 for content-managed media:

- gallery images
- story cover images
- story block images
- event images
- workshop photos
- artisan/community field images
- product photos if they are content-managed

R2 should hold files. The database should hold metadata:

- media URL
- alt text
- captions or hover text
- visibility/published flags
- sort order
- content relationships

Do not store binary image files in the database.

---

## 2. What belongs in the web app public folder

Use `apps/web/public/` for landing-critical and brand-critical assets:

- logo
- favicon
- landing hero images
- decorative textures
- static brand marks
- assets required for first impression
- assets needed when R2/content API/chatbot are unavailable

Recommended folders:

~~~txt
apps/web/public/images/brand/
apps/web/public/images/landing/
apps/web/public/images/textures/
~~~

These should be referenced with local paths such as:

~~~txt
/images/brand/rangbheeni.svg
/images/landing/hero-v1.jpg
/images/textures/paper-v1.png
~~~

---

## 3. R2 filename policy

Use versioned filenames for production media.

Good:

~~~txt
images/gallery/gallery-01-v1.jpeg
images/gallery/gallery-01-v2.jpeg
images/stories/adirang-cover-v1.jpg
images/events/summer-internship-2026-cover-v1.jpg
~~~

Avoid overwriting the same filename with different content:

~~~txt
images/gallery/gallery-01.jpeg
~~~

Overwriting is risky when using long cache lifetimes, because browsers and edge caches may continue serving the old file.

---

## 4. Recommended cache policy

For versioned filenames:

~~~txt
Cache-Control: public, max-age=31536000, immutable
~~~

Use this only when filenames change when content changes.

For non-versioned or frequently replaced filenames:

~~~txt
Cache-Control: public, max-age=300, stale-while-revalidate=600
~~~

The safest long-term strategy is versioned filenames plus long cache.

---

## 5. Cloudflare custom domain setup

In Cloudflare:

1. Open R2.
2. Select the `rangbheeni-media` bucket.
3. Go to Settings.
4. Under Public access, connect a custom domain.
5. Use a domain such as:

~~~txt
media.rangbheeni.org
~~~

6. Let Cloudflare create the DNS record.
7. Test a known file:

~~~txt
https://media.rangbheeni.org/images/gallery/gallery-01.jpeg
~~~

Once verified, move application configuration from the `r2.dev` URL to the custom domain.

---

## 6. Cloudflare cache rule recommendation

Create a cache rule for media paths.

Example matching logic:

~~~txt
Hostname equals media.rangbheeni.org
AND
URI path starts with /images/
~~~

Recommended behavior for versioned media:

~~~txt
Eligible for cache: true
Browser TTL: respect origin or 1 year
Edge TTL: 1 month to 1 year
Cache key: default
~~~

Avoid custom cache keys unless there is a clear reason. Default cache keys are simpler and less error-prone.

---

## 7. Cloudflare rate-limit rule recommendation

Create a rate-limiting rule for media requests.

Example matching logic:

~~~txt
Hostname equals media.rangbheeni.org
AND
URI path starts with /images/
AND
HTTP method equals GET
~~~

Conservative starting point:

~~~txt
Threshold: 300 requests per 1 minute per IP
Action: Managed Challenge or Block
Mitigation timeout: 10 minutes
~~~

If legitimate users get challenged, loosen it.

If bots abuse image requests, tighten it.

Suggested stricter incident setting:

~~~txt
Threshold: 120 requests per 1 minute per IP
Action: Managed Challenge or Block
Mitigation timeout: 30 minutes
~~~

---

## 8. Hotlinking protection

Optional later improvement:

Allow image requests primarily from:

- Rangbheeni website domain
- known preview domains
- direct browser navigation if desired

Be careful with strict hotlink protection because it can block:

- social previews
- image sharing
- search indexing
- admin testing
- direct QA links

Start with caching and rate limiting before strict hotlink blocking.

---

## 9. Application configuration

Preferred env var names:

~~~env
MEDIA_PUBLIC_BASE_URL=https://media.rangbheeni.org
R2_PUBLIC_BASE_URL=https://media.rangbheeni.org
~~~

Use one canonical name in the backend if possible.

The database should store either:

1. full public URLs, or
2. object keys plus a configured media base URL

Preferred long-term model:

~~~txt
MediaAsset.storageKey = images/gallery/gallery-01-v1.jpeg
MEDIA_PUBLIC_BASE_URL = https://media.rangbheeni.org
public URL = MEDIA_PUBLIC_BASE_URL + "/" + storageKey
~~~

This makes domain changes easy.

If the database currently stores full `r2.dev` URLs, update them after the custom domain is ready.

---

## 10. Emergency playbook

### If R2/media requests spike

1. Tighten Cloudflare media rate limit.
2. Increase cache TTL if filenames are versioned.
3. Temporarily block suspicious countries/ASNs only if clearly abusive.
4. Check Cloudflare analytics for top paths and IPs.
5. Avoid changing database content unless URLs need to be rotated.

### If media domain breaks

1. Test a known file directly.
2. Check R2 custom domain connection.
3. Check DNS record.
4. Temporarily switch `MEDIA_PUBLIC_BASE_URL` back to the known working R2 URL only if necessary.
5. Keep landing-critical assets local so the homepage still loads.

---

## 11. Future improvement

Move from storing full media URLs to storing R2 object keys.

Recommended future fields:

~~~txt
MediaAsset.storageProvider = "r2"
MediaAsset.bucket = "rangbheeni-media"
MediaAsset.storageKey = "images/gallery/gallery-01-v1.jpeg"
MediaAsset.publicBaseUrl = optional override, usually null
~~~

For now, do not change schema unless there is a strong migration reason. First stabilize custom domain and caching.
