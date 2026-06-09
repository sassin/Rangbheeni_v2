import { Injectable } from "@nestjs/common";

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

@Injectable()
export class EmbeddingService {
  private get baseUrl() {
    return (process.env.LLM_BASE_URL ?? "").replace(/\/$/, "");
  }

  private get apiKey() {
    return process.env.LLM_API_KEY ?? "";
  }

  private get model() {
    return process.env.LLM_EMBEDDING_MODEL ?? "";
  }

  isConfigured() {
    return Boolean(this.baseUrl && this.apiKey && this.model);
  }

  async embed(text: string): Promise<number[]> {
    if (!this.isConfigured()) {
      throw new Error("Embedding provider is not configured");
    }

    const response = await fetchWithTimeout(
      `${this.baseUrl}/embeddings`,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          input: text.slice(0, 8000),
        }),
      },
      15000,
    );

    if (!response.ok) {
      throw new Error(`Embedding provider failed: ${response.status} ${await response.text()}`);
    }

    const payload = (await response.json()) as {
      data?: Array<{ embedding: number[] }>;
    };

    const embedding = payload.data?.[0]?.embedding;

    if (!embedding?.length) {
      throw new Error("Embedding provider returned no embedding");
    }

    return embedding;
  }
}
