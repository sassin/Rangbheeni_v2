import { NextRequest, NextResponse } from "next/server";
import { subscribeNewsletter } from "@/lib/api";

export const runtime = "nodejs";

const MAX_EMAIL_CHARS = 254;
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 4;

const buckets = new Map<string, { count: number; resetAt: number }>();

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getClientKey(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();

  return (
    ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function isRateLimited(key: string) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return false;
  }

  existing.count += 1;

  return existing.count > MAX_REQUESTS_PER_WINDOW;
}

export async function POST(request: NextRequest) {
  const clientKey = getClientKey(request);

  if (isRateLimited(clientKey)) {
    return NextResponse.json(
      { ok: false, message: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "Invalid request body." },
      { status: 400 }
    );
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    "email" in body &&
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "";

  if (!email || email.length > MAX_EMAIL_CHARS || !isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, message: "Please enter a valid email address." },
      { status: 400 }
    );
  }

  try {
    await subscribeNewsletter(email);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Could not save the email right now." },
      { status: 502 }
    );
  }
}
