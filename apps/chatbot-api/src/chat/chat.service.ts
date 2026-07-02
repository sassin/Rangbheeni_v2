import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";
import {
  KnowledgeService,
  type RetrievedChunk,
} from "../knowledge/knowledge.service.js";
import { LlmService } from "../knowledge/llm.service.js";

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

const SERVICE_MAX_CHARS = readIntEnv(
  "CHATBOT_SERVICE_MAX_CHARS",
  900,
  100,
  2_000
);
const KNOWLEDGE_SEARCH_LIMIT = readIntEnv(
  "CHATBOT_KNOWLEDGE_SEARCH_LIMIT",
  8,
  1,
  12
);
const CONTEXT_CHUNK_LIMIT = readIntEnv(
  "CHATBOT_CONTEXT_CHUNK_LIMIT",
  6,
  1,
  10
);
const CHUNK_MAX_CHARS = readIntEnv("CHATBOT_CHUNK_MAX_CHARS", 1_100, 300, 3_000);
const MAX_CONTEXT_CHARS = readIntEnv(
  "CHATBOT_MAX_CONTEXT_CHARS",
  6_000,
  1_000,
  12_000
);
const SAVE_MESSAGES = readBoolEnv("CHATBOT_SAVE_MESSAGES", true);

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledge: KnowledgeService,
    private readonly llm: LlmService
  ) {}

  fallback() {
    const email =
      process.env.RANGBHEENI_CONTACT_EMAIL ?? "enquiries.rangbheeni@gmail.com";

    return `I do not have that information in Rangbheeni’s published content. Please contact Rangbheeni at ${email}.`;
  }

  private async saveMessage(input: {
    sessionId?: string;
    userMessage: string;
    assistantResponse: string;
    fallbackUsed: boolean;
  }) {
    if (!SAVE_MESSAGES) return;

    try {
      await this.prisma.chatbotMessage.create({
        data: {
          ...input,
          sessionId: input.sessionId?.slice(0, 160),
          userMessage: input.userMessage.slice(0, 2_000),
          assistantResponse: input.assistantResponse.slice(0, 2_000),
        },
      });
    } catch (error) {
      console.error("Failed to save chatbot message.", error);
    }
  }

  private buildContext(chunks: RetrievedChunk[]) {
    return chunks
      .slice(0, CONTEXT_CHUNK_LIMIT)
      .map((chunk, index) => {
        const title = chunk.document.title || "Rangbheeni content";
        const text = chunk.chunkText.replace(/\s+/g, " ").trim();

        return `[Source ${index + 1}: ${title}]\n${text.slice(0, CHUNK_MAX_CHARS)}`;
      })
      .join("\n\n---\n\n")
      .slice(0, MAX_CONTEXT_CHARS);
  }

  async message(input: { message: string; sessionId?: string }) {
    const question = input.message.replace(/\s+/g, " ").trim();

    if (!question || question.length > SERVICE_MAX_CHARS) {
      return { answer: this.fallback(), fallbackUsed: true, sources: [] };
    }

    let chunks: RetrievedChunk[] = [];

    try {
      chunks = await this.knowledge.search(question, KNOWLEDGE_SEARCH_LIMIT);
    } catch (error) {
      console.error("Knowledge search failed.", error);

      const fallback = this.fallback();

      await this.saveMessage({
        sessionId: input.sessionId,
        userMessage: question,
        assistantResponse: fallback,
        fallbackUsed: true,
      });

      return { answer: fallback, fallbackUsed: true, sources: [] };
    }

    const minScore = Number(process.env.CHATBOT_MIN_SCORE ?? 0.2);
    const goodChunks = chunks.filter((chunk) => chunk.score >= minScore);

    if (!goodChunks.length) {
      const fallback = this.fallback();

      await this.saveMessage({
        sessionId: input.sessionId,
        userMessage: question,
        assistantResponse: fallback,
        fallbackUsed: true,
      });

      return { answer: fallback, fallbackUsed: true, sources: [] };
    }

    const context = this.buildContext(goodChunks);

    const result = await this.llm.answerFromContext(
      question,
      context,
      this.fallback()
    );

    const fallbackUsed = !result.answer_supported;
    const answer = fallbackUsed ? this.fallback() : result.answer;

    await this.saveMessage({
      sessionId: input.sessionId,
      userMessage: question,
      assistantResponse: answer,
      fallbackUsed,
    });

    return {
      answer,
      fallbackUsed,
      sources: fallbackUsed
        ? []
        : goodChunks.slice(0, CONTEXT_CHUNK_LIMIT).map((chunk) => ({
            title: chunk.document.title,
            sourceType: chunk.document.sourceType,
          })),
    };
  }
}
