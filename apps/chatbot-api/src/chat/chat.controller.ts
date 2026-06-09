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
};

const clientStates = new Map<string, ClientState>();

const MAX_WORDS = Number(process.env.CHATBOT_MAX_WORDS ?? 80);
const MAX_CHARS = Number(process.env.CHATBOT_MAX_CHARS ?? 700);
const MIN_INTERVAL_MS = Number(process.env.CHATBOT_MIN_INTERVAL_MS ?? 5000);
const MAX_PER_MINUTE = Number(process.env.CHATBOT_MAX_PER_MINUTE ?? 12);

function assertPrivate(value: string | undefined) {
  const expected = process.env.CHATBOT_PRIVATE_API_KEY;

  if (!expected || value !== expected) {
    throw new ForbiddenException("Invalid private API key");
  }
}

function getClientKey(req: any, sessionId?: string) {
  const forwardedFor = req?.headers?.["x-forwarded-for"];
  const forwardedIp =
    typeof forwardedFor === "string" ? forwardedFor.split(",")[0]?.trim() : "";

  const ip =
    forwardedIp ||
    req?.headers?.["cf-connecting-ip"] ||
    req?.headers?.["x-real-ip"] ||
    req?.ip ||
    req?.socket?.remoteAddress ||
    "unknown";

  const safeSession =
    typeof sessionId === "string" && sessionId.length <= 120
      ? sessionId.replace(/[^a-zA-Z0-9:_-]/g, "")
      : "";

  return `${ip}:${safeSession || "anonymous"}`;
}

function normalizeQuestion(value: unknown) {
  const raw = String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();

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

function enforceRateLimit(clientKey: string) {
  const now = Date.now();

  const current =
    clientStates.get(clientKey) ??
    ({
      lastRequestAt: 0,
      windowStartAt: now,
      requestCount: 0,
    } satisfies ClientState);

  if (now - current.windowStartAt >= 60_000) {
    current.windowStartAt = now;
    current.requestCount = 0;
  }

  const waitMs = MIN_INTERVAL_MS - (now - current.lastRequestAt);

  if (waitMs > 0) {
    throw new HttpException(
      {
        message: "Please wait a few seconds before asking another question.",
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  if (current.requestCount >= MAX_PER_MINUTE) {
    throw new HttpException(
      {
        message:
          "Too many chatbot questions in a short time. Please try again later.",
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }

  current.lastRequestAt = now;
  current.requestCount += 1;

  clientStates.set(clientKey, current);
}

@Controller()
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly queue: ChatQueueService,
    private readonly knowledge: KnowledgeService,
  ) {}

  @Get("health")
  health() {
    return {
      status: "ok",
    };
  }

  @Post("chat/message")
  async message(
    @Body() body: { message?: string; sessionId?: string },
    @Req() req: any,
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

    const clientKey = getClientKey(req, body?.sessionId);
    enforceRateLimit(clientKey);

    const result = await this.queue.enqueue(clientKey, () =>
      this.chat.message({
        message: question,
        sessionId: body?.sessionId,
      }),
    );

    return {
      ...(result as object),
      inputTruncated: truncated,
    };
  }

  @Post("chat/reindex")
  reindex(@Headers("x-api-key") apiKey: string | undefined) {
    assertPrivate(apiKey);
    return this.knowledge.reindex();
  }
}
