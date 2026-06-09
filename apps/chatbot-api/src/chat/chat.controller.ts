import { Body, Controller, ForbiddenException, Get, Headers, Post } from "@nestjs/common";
import { ChatService } from "./chat.service.js";
import { KnowledgeService } from "../knowledge/knowledge.service.js";

function requirePrivateKey(value?: string) {
  const expected = process.env.CHATBOT_PRIVATE_API_KEY;
  if (!expected || value !== expected) throw new ForbiddenException("Invalid private API key");
}

@Controller()
export class ChatController {
  constructor(private readonly chat: ChatService, private readonly knowledge: KnowledgeService) {}

  @Get("health")
  health() {
    return { ok: true, service: "rangbheeni-chatbot-api" };
  }

  @Post("chat/message")
  message(@Body() body: { message: string; sessionId?: string }) {
    return this.chat.message(body);
  }

  @Post("chat/reindex")
  reindex(@Headers("x-api-key") apiKey: string | undefined) {
    requirePrivateKey(apiKey);
    return this.knowledge.reindex();
  }
}
