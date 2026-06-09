import { Module } from "@nestjs/common";
import { PrismaService } from "./common/prisma.service.js";
import { ChatController } from "./chat/chat.controller.js";
import { ChatService } from "./chat/chat.service.js";
import { EmbeddingService } from "./knowledge/embedding.service.js";
import { LlmService } from "./knowledge/llm.service.js";
import { KnowledgeService } from "./knowledge/knowledge.service.js";

@Module({
  controllers: [ChatController],
  providers: [PrismaService, EmbeddingService, LlmService, KnowledgeService, ChatService],
})
export class AppModule {}
