import { Injectable } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";
import { EmbeddingService } from "./embedding.service.js";

export type RetrievedChunk = {
  id: string;
  chunkText: string;
  score: number;
  document: {
    title: string;
    sourceType: string;
  };
};

function chunkText(text: string, maxLength = 1200) {
  const normalized = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const paragraphs = normalized.split(/\n\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const paragraph of paragraphs) {
    if ((current + "\n\n" + paragraph).length > maxLength && current) {
      chunks.push(current.trim());
      current = paragraph;
    } else {
      current = current ? `${current}\n\n${paragraph}` : paragraph;
    }
  }

  if (current.trim()) chunks.push(current.trim());

  return chunks.flatMap((chunk) =>
    chunk.length <= maxLength * 1.5
      ? [chunk]
      : chunk.match(new RegExp(`.{1,${maxLength}}`, "gs")) ?? [chunk],
  );
}

function vectorLiteral(values: number[]) {
  return `[${values.map((value) => Number(value).toFixed(8)).join(",")}]`;
}

function questionTerms(question: string) {
  const stopWords = new Set([
    "what",
    "where",
    "when",
    "which",
    "who",
    "why",
    "how",
    "tell",
    "about",
    "give",
    "show",
    "does",
    "with",
    "from",
    "that",
    "this",
    "the",
    "and",
    "for",
    "are",
    "you",
    "your",
    "can",
    "please",
  ]);

  return question
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 2 && !stopWords.has(term));
}

function keywordScore(question: string, title: string, text: string) {
  const terms = questionTerms(question);
  if (!terms.length) return 0;

  const haystack = `${title}\n${text}`.toLowerCase();
  const titleHaystack = title.toLowerCase();

  let hits = 0;
  let titleHits = 0;

  for (const term of terms) {
    if (haystack.includes(term)) hits += 1;
    if (titleHaystack.includes(term)) titleHits += 1;
  }

  const baseScore = hits / terms.length;
  const titleBonus = Math.min(0.3, titleHits * 0.12);
  const exactPhraseBonus = haystack.includes(question.toLowerCase().trim())
    ? 0.25
    : 0;

  return Math.min(1, baseScore + titleBonus + exactPhraseBonus);
}

@Injectable()
export class KnowledgeService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddings: EmbeddingService,
  ) {}

  async reindex() {
    const documents = await this.prisma.chatbotDocument.findMany({
      where: { status: "published", approvedForChatbot: true },
    });

    let chunkCount = 0;

    for (const document of documents) {
      await this.prisma.chatbotChunk.deleteMany({
        where: { documentId: document.id },
      });

      const chunks = chunkText(document.content);

      for (const [index, chunk] of chunks.entries()) {
        if (this.embeddings.isConfigured()) {
          const embedding = await this.embeddings.embed(chunk);

          await this.prisma.$executeRawUnsafe(
            `INSERT INTO "ChatbotChunk" ("id", "documentId", "chunkText", "metadata", "embedding", "createdAt", "updatedAt") VALUES (gen_random_uuid()::text, $1, $2, $3::jsonb, $4::vector, now(), now())`,
            document.id,
            chunk,
            JSON.stringify({
              index,
              title: document.title,
              sourceType: document.sourceType,
            }),
            vectorLiteral(embedding),
          );
        } else {
          await this.prisma.chatbotChunk.create({
            data: {
              documentId: document.id,
              chunkText: chunk,
              metadata: {
                index,
                title: document.title,
                sourceType: document.sourceType,
              },
            },
          });
        }

        chunkCount += 1;
      }
    }

    return {
      documents: documents.length,
      chunks: chunkCount,
      embeddingsConfigured: this.embeddings.isConfigured(),
    };
  }

  private async keywordSearch(question: string, limit: number) {
    const chunks = await this.prisma.chatbotChunk.findMany({
      include: { document: true },
      where: {
        document: {
          approvedForChatbot: true,
          status: "published",
        },
      },
      take: 300,
    });

    return chunks
      .map((chunk) => ({
        id: chunk.id,
        chunkText: chunk.chunkText,
        score: keywordScore(question, chunk.document.title, chunk.chunkText),
        document: {
          title: chunk.document.title,
          sourceType: chunk.document.sourceType,
        },
      }))
      .filter((chunk) => chunk.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  private mergeResults(results: RetrievedChunk[], limit: number) {
    const byId = new Map<string, RetrievedChunk>();

    for (const result of results) {
      const existing = byId.get(result.id);

      if (!existing || result.score > existing.score) {
        byId.set(result.id, result);
      }
    }

    return Array.from(byId.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async search(question: string, limit = 6): Promise<RetrievedChunk[]> {
    const keywordResults = await this.keywordSearch(question, limit);

    if (!this.embeddings.isConfigured()) {
      return keywordResults;
    }

    try {
      const embedding = await this.embeddings.embed(question);

      const vectorResults = await this.prisma.$queryRawUnsafe<
        Array<{
          id: string;
          chunkText: string;
          score: number;
          title: string;
          sourceType: string;
        }>
      >(
        `SELECT c."id", c."chunkText", 1 - (c."embedding" <=> $1::vector) AS score, d."title", d."sourceType"
         FROM "ChatbotChunk" c
         JOIN "ChatbotDocument" d ON d."id" = c."documentId"
         WHERE c."embedding" IS NOT NULL AND d."approvedForChatbot" = true AND d."status" = 'published'
         ORDER BY c."embedding" <=> $1::vector
         LIMIT ${Number(limit)}`,
        vectorLiteral(embedding),
      );

      return this.mergeResults(
        [
          ...vectorResults.map((row) => ({
            id: row.id,
            chunkText: row.chunkText,
            score: Number(row.score),
            document: {
              title: row.title,
              sourceType: row.sourceType,
            },
          })),
          ...keywordResults,
        ],
        limit,
      );
    } catch (error) {
      console.error("Vector search failed. Using keyword search.", error);
      return keywordResults;
    }
  }
}
