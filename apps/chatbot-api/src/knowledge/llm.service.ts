import { Injectable } from "@nestjs/common";

export type SupportedAnswer = {
  answer_supported: boolean;
  answer: string;
};

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
export class LlmService {
  private get baseUrl() {
    return (process.env.LLM_BASE_URL ?? "").replace(/\/$/, "");
  }

  private get apiKey() {
    return process.env.LLM_API_KEY ?? "";
  }

  private get model() {
    return process.env.LLM_CHAT_MODEL ?? "";
  }

  isConfigured() {
    return Boolean(this.baseUrl && this.apiKey && this.model);
  }

  async answerFromContext(
    question: string,
    context: string,
    fallback: string,
  ): Promise<SupportedAnswer> {
    if (!this.isConfigured()) {
      return { answer_supported: false, answer: fallback };
    }

    const system = [
      "You are the Rangbheeni website assistant.",
      "Use only the Rangbheeni context provided by the developer message.",
      "Do not use outside knowledge.",
      "Do not guess.",
      "Do not make commitments about price, stock, delivery, custom orders, return policy, discounts, or events unless the context explicitly says so.",
      "Return only strict JSON with keys answer_supported and answer.",
      `If the answer is not available in the context, set answer_supported to false and answer to exactly: ${fallback}`,
    ].join("\n");

    try {
      const response = await fetchWithTimeout(
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            temperature: 0.1,
            max_tokens: 450,
            response_format: { type: "json_object" },
            messages: [
              { role: "system", content: system },
              { role: "developer", content: `Rangbheeni context:\n${context}` },
              { role: "user", content: question },
            ],
          }),
        },
        25000,
      );

      if (!response.ok) {
        console.error(`LLM provider failed: ${response.status} ${await response.text()}`);
        return { answer_supported: false, answer: fallback };
      }

      const payload = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const text = payload.choices?.[0]?.message?.content?.trim() ?? "";

      try {
        const parsed = JSON.parse(text) as SupportedAnswer;

        if (
          typeof parsed.answer_supported === "boolean" &&
          typeof parsed.answer === "string"
        ) {
          return parsed;
        }
      } catch {
        console.error("LLM returned non-JSON answer.");
      }

      return { answer_supported: false, answer: fallback };
    } catch (error) {
      console.error("LLM request failed or timed out.", error);
      return { answer_supported: false, answer: fallback };
    }
  }
}
