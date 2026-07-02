import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Post,
  Req,
} from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { ChatQueueService } from "./chat-queue.service.js";
import { KnowledgeService } from "../knowledge/knowledge.service.js";

type ClientState = {
  lastRequestAt: number;
  windowStartAt: number;
  requestCount: number;
  dayStartAt: number;
  dayCount: number;
  activeCount: number;
  lastQuestion: string;
  repeatedCount: number;
  updatedAt: number;
};

const clientStates = new Map<string, ClientState>();
let activeRequests = 0;

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

const PUBLIC_CHAT_ENABLED = readBoolEnv("CHATBOT_PUBLIC_ENABLED", true);

const MAX_WORDS = readIntEnv("CHATBOT_MAX_WORDS", 80, 5, 200);
const MAX_CHARS = readIntEnv("CHATBOT_MAX_CHARS", 700, 100, 2_000);
const ABSOLUTE_MAX_CHARS = readIntEnv(
  "CHATBOT_ABSOLUTE_MAX_CHARS",
  2_000,
  200,
  5_000
);

const MIN_INTERVAL_MS = readIntEnv(
  "CHATBOT_MIN_INTERVAL_MS",
  5_000,
  0,
  60_000
);

const WINDOW_MS = readIntEnv(
  "CHATBOT_RATE_WINDOW_MS",
  60_000,
  10_000,
  3_600_000
);

const MAX_PER_WINDOW = readIntEnv(
  "CHATBOT_MAX_PER_WINDOW",
  readIntEnv("CHATBOT_MAX_PER_MINUTE", 10, 1, 120),
  1,
  120
);

const DAY_WINDOW_MS = 24 * 60 * 60 * 1_000;

const MAX_PER_DAY = readIntEnv("CHATBOT_MAX_PER_DAY", 40, 1, 1_000);
const MAX_CONCURRENT_TOTAL = readIntEnv(
  "CHATBOT_MAX_CONCURRENT_TOTAL",
  3,
  1,
  50
);
const MAX_CONCURRENT_PER_CLIENT = readIntEnv(
  "CHATBOT_MAX_CONCURRENT_PER_CLIENT",
  1,
  1,
  10
);
const MAX_TRACKED_CLIENTS = readIntEnv(
  "CHATBOT_MAX_TRACKED_CLIENTS",
  5_000,
  100,
  100_000
);
const MAX_REPEAT_COUNT = readIntEnv("CHATBOT_MAX_REPEAT_COUNT", 3, 1, 20);
const SESSION_MAX_CHARS = readIntEnv("CHATBOT_SESSION_MAX_CHARS", 120, 20, 300);

function assertPrivate(value: string | undefined) {
  const expected = process.env.CHATBOT_PRIVATE_API_KEY;

  if (!expected || value !== expected) {
    throw new ForbiddenException("Invalid private API key");
  }
}

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

function normalizeSessionId(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .slice(0, SESSION_MAX_CHARS)
    .replace(/[^a-zA-Z0-9:_-]/g, "")
    .trim();
}

function getClientKey(req: any, sessionId?: string) {
  const ip = getClientIp(req);
  const safeSession = normalizeSessionId(sessionId);

  return `${ip}:${safeSession || "anonymous"}`;
}

function normalizeQuestion(value: unknown) {
  const raw =
    typeof value === "string"
      ? value.replace(/\s+/g, " ").trim()
      : "";

  if (raw.length > ABSOLUTE_MAX_CHARS) {
    throw new HttpException(
      {
        message:
          "Your message is too long. Please ask a shorter Rangbheeni-related question.",
      },
      HttpStatus.PAYLOAD_TOO_LARGE
    );
  }

  const charLimited =
    raw.length > MAX_CHARS ? raw.slice(0, MAX_CHARS).trim() : raw;

  const words = charLimited.split(/\s+/).filter(Boolean);
  const wordLimited =
    words.length > MAX_WORDS ? words.slice(0, MAX_WORDS).join(" ") : charLimited;

  return {
    question: wordLimited.trim(),
    truncated: raw !== wordLimited.trim(),
  };
}

function getInitialState(now: number): ClientState {
  return {
    lastRequestAt: 0,
    windowStartAt: now,
    requestCount: 0,
    dayStartAt: now,
    dayCount: 0,
    activeCount: 0,
    lastQuestion: "",
    repeatedCount: 0,
    updatedAt: now,
  };
}

function cleanupClientStates(now: number) {
  if (clientStates.size < MAX_TRACKED_CLIENTS) return;

  const staleAfterMs = Math.max(DAY_WINDOW_MS * 2, WINDOW_MS * 4);

  for (const [key, state] of clientStates.entries()) {
    if (state.activeCount > 0) continue;

    if (now - state.updatedAt > staleAfterMs) {
      clientStates.delete(key);
    }
  }
}

function beginProtectedRequest(clientKey: string, question: string) {
  if (!PUBLIC_CHAT_ENABLED) {
    throw new HttpException(
      {
        message: "The Rangbheeni assistant is temporarily unavailable.",
      },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  const now = Date.now();
  cleanupClientStates(now);

  if (!clientStates.has(clientKey) && clientStates.size >= MAX_TRACKED_CLIENTS) {
    throw new HttpException(
      {
        message: "The assistant is busy right now. Please try again later.",
      },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  const current = clientStates.get(clientKey) ?? getInitialState(now);

  if (now - current.windowStartAt >= WINDOW_MS) {
    current.windowStartAt = now;
    current.requestCount = 0;
  }

  if (now - current.dayStartAt >= DAY_WINDOW_MS) {
    current.dayStartAt = now;
    current.dayCount = 0;
  }

  const waitMs = MIN_INTERVAL_MS - (now - current.lastRequestAt);

  if (waitMs > 0) {
    throw new HttpException(
      {
        message: "Please wait a few seconds before asking another question.",
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  if (current.requestCount >= MAX_PER_WINDOW) {
    throw new HttpException(
      {
        message:
          "Too many chatbot questions in a short time. Please try again later.",
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  if (current.dayCount >= MAX_PER_DAY) {
    throw new HttpException(
      {
        message:
          "The daily chatbot limit has been reached for this session. Please try again tomorrow.",
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  const normalizedRepeatKey = question.toLowerCase();

  if (current.lastQuestion === normalizedRepeatKey) {
    current.repeatedCount += 1;
  } else {
    current.lastQuestion = normalizedRepeatKey;
    current.repeatedCount = 1;
  }

  if (current.repeatedCount > MAX_REPEAT_COUNT) {
    throw new HttpException(
      {
        message:
          "Please avoid sending the same question repeatedly. Try a different Rangbheeni-related question.",
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  if (activeRequests >= MAX_CONCURRENT_TOTAL) {
    throw new HttpException(
      {
        message: "The assistant is handling other questions. Please try again shortly.",
      },
      HttpStatus.SERVICE_UNAVAILABLE
    );
  }

  if (current.activeCount >= MAX_CONCURRENT_PER_CLIENT) {
    throw new HttpException(
      {
        message: "Please wait for the current response before asking again.",
      },
      HttpStatus.TOO_MANY_REQUESTS
    );
  }

  current.lastRequestAt = now;
  current.requestCount += 1;
  current.dayCount += 1;
  current.activeCount += 1;
  current.updatedAt = now;

  activeRequests += 1;
  clientStates.set(clientKey, current);

  return () => {
    activeRequests = Math.max(0, activeRequests - 1);

    const latest = clientStates.get(clientKey);
    if (!latest) return;

    latest.activeCount = Math.max(0, latest.activeCount - 1);
    latest.updatedAt = Date.now();
    clientStates.set(clientKey, latest);
  };
}

@Controller()
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly queue: ChatQueueService,
    private readonly knowledge: KnowledgeService
  ) {}

  @Get("health")
  health() {
    return {
      status: "ok",
      publicChatEnabled: PUBLIC_CHAT_ENABLED,
      activeRequests,
      trackedClients: clientStates.size,
    };
  }

  @Post("chat/message")
  async message(
    @Body() body: { message?: string; sessionId?: string },
    @Req() req: any
  ) {
    const { question, truncated } = normalizeQuestion(body?.message);

    if (!question) {
      return {
        answer:
          "Please enter a short Rangbheeni-related question so I can help.",
        fallbackUsed: true,
        sources: [],
        inputTruncated: false,
      };
    }

    const sessionId = normalizeSessionId(body?.sessionId);
    const clientKey = getClientKey(req, sessionId);
    const release = beginProtectedRequest(clientKey, question);

    try {
      const result = await this.queue.enqueue(clientKey, () =>
        this.chat.message({
          message: question,
          sessionId,
        })
      );

      return {
        ...(result as object),
        inputTruncated: truncated,
      };
    } finally {
      release();
    }
  }

  @Post("chat/reindex")
  reindex(@Headers("x-api-key") apiKey: string | undefined) {
    assertPrivate(apiKey);
    return this.knowledge.reindex();
  }
}
