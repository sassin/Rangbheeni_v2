import { Injectable } from "@nestjs/common";

type LlmResult = {
  answer_supported: boolean;
  answer: string;
};

function cleanBaseUrl(value?: string) {
  return (value ?? "https://api.openai.com/v1").replace(/\/$/, "");
}

async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeoutMs: number,
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

@Injectable()
export class LlmService {
  private get apiKey() {
    return process.env.LLM_API_KEY ?? "";
  }

  private get baseUrl() {
    return cleanBaseUrl(process.env.LLM_BASE_URL);
  }

  private get model() {
    return process.env.LLM_CHAT_MODEL ?? "gpt-4o-mini";
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async answerFromContext(
    question: string,
    context: string,
    fallback: string,
  ): Promise<LlmResult> {
    if (!this.isConfigured()) {
      return {
        answer_supported: false,
        answer: fallback,
      };
    }

    try {
      const response = await fetchWithTimeout(
        `${this.baseUrl}/chat/completions`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: this.model,
            temperature: 0.2,
            max_tokens: 220,
            response_format: { type: "json_object" },
            messages: [
              {
                role: "system",
                content:
                  "You are the Rangbheeni website assistant. Return valid JSON only. Answer only from the provided Rangbheeni context. Be professional, respectful, and user-friendly for both general visitors and corporate visitors. Give enough useful information without over-explaining. Keep answers to 2 to 4 concise sentences, maximum 90 words. Do not invent facts, prices, dates, availability, certifications, or partnerships. Do not list sources. If the user asks an unrelated or off-topic question, politely decline to answer and invite them to ask about Rangbheeni, its products, events, stories, impact, collaborations, or enquiries. Do not provide the email for fully unrelated questions. If the user asks something related to Rangbheeni, partnerships, corporate gifting, collaboration, bulk orders, donations, volunteering, workshops, media, or any enquiry that could be useful for Rangbheeni, answer from context when possible and direct them to enquiries.rangbheeni@gmail.com for human follow-up. If the user is abusive, profane, or inappropriate, politely decline and ask them to keep the conversation focused on Rangbheeni-related topics. If the context does not support the answer, return answer_supported=false.",
              },
              {
                role: "user",
                content: JSON.stringify({
                  question,
                  context,
                  output_format: {
                    answer_supported: "boolean",
                    answer:
                      "professional answer only; 2-4 concise sentences; max 90 words",
                  },
                }),
              },
            ],
          }),
        },
        25_000,
      );

      if (!response.ok) {
        console.error(
          `LLM request failed: ${response.status} ${await response.text()}`,
        );
        return {
          answer_supported: false,
          answer: fallback,
        };
      }

      const payload = (await response.json()) as {
        choices?: Array<{
          message?: {
            content?: string;
          };
        }>;
      };

      const raw = payload.choices?.[0]?.message?.content;

      if (!raw) {
        return {
          answer_supported: false,
          answer: fallback,
        };
      }

      const parsed = JSON.parse(raw) as Partial<LlmResult>;

      const answer =
        typeof parsed.answer === "string" ? parsed.answer.trim() : "";

      if (!parsed.answer_supported || !answer) {
        return {
          answer_supported: false,
          answer: fallback,
        };
      }

      const conciseAnswer = answer
        .replace(/\s+/g, " ")
        .split(/(?<=[.!?])\s+/)
        .slice(0, 4)
        .join(" ")
        .split(/\s+/)
        .slice(0, 90)
        .join(" ")
        .trim();

      return {
        answer_supported: true,
        answer: conciseAnswer,
      };
    } catch (error) {
      console.error("LLM request failed or timed out.", error);

      return {
        answer_supported: false,
        answer: fallback,
      };
    }
  }
}



