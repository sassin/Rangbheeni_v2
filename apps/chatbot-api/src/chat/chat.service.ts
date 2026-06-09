import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";
import { KnowledgeService } from "../knowledge/knowledge.service.js";
import { LlmService } from "../knowledge/llm.service.js";

@Injectable()
export class ChatService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly knowledge: KnowledgeService,
    private readonly llm: LlmService,
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
    try {
      await this.prisma.chatbotMessage.create({
        data: input,
      });
    } catch (error) {
      console.error("Failed to save chatbot message.", error);
    }
  }

  async message(input: { message: string; sessionId?: string }) {
    const question = input.message.trim();

    if (!question || question.length > 1200) {
      return { answer: this.fallback(), fallbackUsed: true, sources: [] };
    }

    let chunks = [];

    try {
      chunks = await this.knowledge.search(question, 6);
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

    const minScore = Number(
      process.env.CHATBOT_MIN_SCORE ??
        (process.env.LLM_EMBEDDING_MODEL ? 0.72 : 0.35),
    );

    const goodChunks = chunks.filter((chunk: any) => chunk.score >= minScore);

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

    const context = goodChunks
      .map(
        (chunk: any, index: number) =>
          `[Source ${index + 1}: ${chunk.document.title}]\n${chunk.chunkText}`,
      )
      .join("\n\n---\n\n");

    const result = await this.llm.answerFromContext(
      question,
      context,
      this.fallback(),
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
        : goodChunks.map((chunk: any) => ({
            title: chunk.document.title,
            sourceType: chunk.document.sourceType,
          })),
    };
  }
}
