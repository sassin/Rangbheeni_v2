import { Injectable } from "@nestjs/common";

export type SupportedAnswer = {
  answer_supported: boolean;
  answer: string;
};

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

  async answerFromContext(question: string, context: string, fallback: string): Promise<SupportedAnswer> {
    if (!this.isConfigured()) return { answer_supported: false, answer: fallback };
    const system = [
      "You are the Rangbheeni website assistant.",
      "Use only the Rangbheeni context provided by the developer message.",
      "Do not use outside knowledge.",
      "Do not guess.",
      "Do not make commitments about price, stock, delivery, custom orders, return policy, discounts, or events unless the context explicitly says so.",
      "Return only strict JSON with keys answer_supported and answer.",
      `If the answer is not available in the context, set answer_supported to false and answer to exactly: ${fallback}`,
    ].join("\n");

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        temperature: 0.1,
        messages: [
          { role: "system", content: system },
          { role: "developer", content: `Rangbheeni context:\n${context}` },
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) throw new Error(`LLM provider failed: ${response.status} ${await response.text()}`);
    const payload = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    const text = payload.choices?.[0]?.message?.content?.trim() ?? "";
    try {
      const parsed = JSON.parse(text) as SupportedAnswer;
      if (typeof parsed.answer_supported === "boolean" && typeof parsed.answer === "string") return parsed;
    } catch {}
    return { answer_supported: false, answer: fallback };
  }
}
