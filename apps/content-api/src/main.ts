import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";

type Bucket = {
  count: number;
  resetAt: number;
  updatedAt: number;
};

const buckets = new Map<string, Bucket>();

function readIntEnv(name: string, fallback: number, min: number, max: number) {
  const parsed = Number(process.env[name]);

  if (!Number.isFinite(parsed)) return fallback;

  return Math.min(Math.max(Math.floor(parsed), min), max);
}

function readBoolEnv(name: string, fallback: boolean) {
  const value = process.env[name];

  if (value === undefined) return fallback;
  return value === "true" || value === "1";
}

function parseCsvEnv(value: string | undefined, fallback: string[]) {
  const parsed = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed?.length ? parsed : fallback;
}

const PUBLIC_CONTENT_ENABLED = readBoolEnv("CONTENT_PUBLIC_ENABLED", true);

const BODY_LIMIT = process.env.CONTENT_BODY_LIMIT ?? "16kb";

const PUBLIC_READ_WINDOW_MS = readIntEnv(
  "CONTENT_PUBLIC_READ_WINDOW_MS",
  60_000,
  10_000,
  3_600_000
);

const PUBLIC_READ_MAX_PER_WINDOW = readIntEnv(
  "CONTENT_PUBLIC_READ_MAX_PER_WINDOW",
  120,
  10,
  5_000
);

const PUBLIC_WRITE_WINDOW_MS = readIntEnv(
  "CONTENT_PUBLIC_WRITE_WINDOW_MS",
  60_000,
  10_000,
  3_600_000
);

const PUBLIC_WRITE_MAX_PER_WINDOW = readIntEnv(
  "CONTENT_PUBLIC_WRITE_MAX_PER_WINDOW",
  4,
  1,
  300
);

const PRIVATE_WINDOW_MS = readIntEnv(
  "CONTENT_PRIVATE_WINDOW_MS",
  60_000,
  10_000,
  3_600_000
);

const PRIVATE_MAX_PER_WINDOW = readIntEnv(
  "CONTENT_PRIVATE_MAX_PER_WINDOW",
  30,
  1,
  1_000
);

const MAX_TRACKED_CLIENTS = readIntEnv(
  "CONTENT_MAX_TRACKED_CLIENTS",
  10_000,
  100,
  100_000
);

const PUBLIC_CACHE_SECONDS = readIntEnv(
  "CONTENT_PUBLIC_CACHE_SECONDS",
  300,
  0,
  86_400
);

const PUBLIC_STALE_SECONDS = readIntEnv(
  "CONTENT_PUBLIC_STALE_SECONDS",
  600,
  0,
  86_400
);

function getClientIp(req: any) {
  const forwardedFor = req?.headers?.["x-forwarded-for"];
  const forwardedIp =
    typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : "";

  return (
    forwardedIp ||
    req?.headers?.["cf-connecting-ip"] ||
    req?.headers?.["x-real-ip"] ||
    req?.ip ||
    req?.socket?.remoteAddress ||
    "unknown"
  );
}

function getPath(req: any) {
  return String(req?.path || req?.url || "/").split("?")[0] || "/";
}

function isPublicPath(path: string) {
  return path === "/health" || path.startsWith("/public/");
}

function isPublicRead(req: any) {
  const method = String(req?.method || "GET").toUpperCase();
  const path = getPath(req);

  return method === "GET" && isPublicPath(path);
}

function isPublicWrite(req: any) {
  const method = String(req?.method || "GET").toUpperCase();
  const path = getPath(req);

  return method !== "GET" && path.startsWith("/public/");
}

function isPrivateRequest(req: any) {
  const method = String(req?.method || "GET").toUpperCase();
  const path = getPath(req);

  return (
    path.startsWith("/private/") ||
    path.includes("/announcements/publish") ||
    (method !== "GET" && !path.startsWith("/public/"))
  );
}

function cleanupBuckets(now: number) {
  if (buckets.size < MAX_TRACKED_CLIENTS) return;

  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now || now - bucket.updatedAt > 24 * 60 * 60 * 1_000) {
      buckets.delete(key);
    }
  }
}

function isRateLimited(
  key: string,
  windowMs: number,
  maxPerWindow: number
) {
  const now = Date.now();
  cleanupBuckets(now);

  if (!buckets.has(key) && buckets.size >= MAX_TRACKED_CLIENTS) {
    return true;
  }

  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
      updatedAt: now,
    });

    return false;
  }

  existing.count += 1;
  existing.updatedAt = now;

  return existing.count > maxPerWindow;
}

function rateLimitMiddleware(req: any, res: any, next: () => void) {
  const method = String(req?.method || "GET").toUpperCase();

  if (method === "OPTIONS") {
    return next();
  }

  const path = getPath(req);
  const ip = getClientIp(req);

  if (!PUBLIC_CONTENT_ENABLED && path.startsWith("/public/")) {
    res.statusCode = 503;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        ok: false,
        message: "Public content API is temporarily unavailable.",
      })
    );
    return;
  }

  let limited = false;

  if (isPublicWrite(req)) {
    limited = isRateLimited(
      `public-write:${ip}`,
      PUBLIC_WRITE_WINDOW_MS,
      PUBLIC_WRITE_MAX_PER_WINDOW
    );
  } else if (isPrivateRequest(req)) {
    limited = isRateLimited(
      `private:${ip}`,
      PRIVATE_WINDOW_MS,
      PRIVATE_MAX_PER_WINDOW
    );
  } else if (isPublicRead(req)) {
    limited = isRateLimited(
      `public-read:${ip}`,
      PUBLIC_READ_WINDOW_MS,
      PUBLIC_READ_MAX_PER_WINDOW
    );
  }

  if (limited) {
    res.statusCode = 429;
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "no-store");
    res.end(
      JSON.stringify({
        ok: false,
        message: "Too many requests. Please try again later.",
      })
    );
    return;
  }

  next();
}

function responseHeadersMiddleware(req: any, res: any, next: () => void) {
  const method = String(req?.method || "GET").toUpperCase();
  const path = getPath(req);

  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Vary", "Origin");

  if (path === "/health") {
    res.setHeader("Cache-Control", "no-store");
  } else if (method === "GET" && path.startsWith("/public/")) {
    res.setHeader(
      "Cache-Control",
      `public, max-age=0, s-maxage=${PUBLIC_CACHE_SECONDS}, stale-while-revalidate=${PUBLIC_STALE_SECONDS}`
    );
  } else {
    res.setHeader("Cache-Control", "no-store");
  }

  next();
}

async function bootstrap() {
  const allowedOrigins = parseCsvEnv(process.env.CORS_ORIGIN, [
    "http://localhost:3000",
  ]);

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
    bodyParser: false,
  });

  app.useBodyParser("json", { limit: BODY_LIMIT });
  app.useBodyParser("urlencoded", { limit: BODY_LIMIT, extended: false });

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.disable?.("x-powered-by");

  app.use(responseHeadersMiddleware);
  app.use(rateLimitMiddleware);

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
    credentials: false,
    maxAge: 86_400,
  });

  const port = Number(process.env.CONTENT_API_PORT ?? process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
