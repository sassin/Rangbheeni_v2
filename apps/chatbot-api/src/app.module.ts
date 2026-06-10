import { Module } from "@nestjs/common";
import { ChatController } from "./chat/chat.controller.js";
import { ChatService } from "./chat/chat.service.js";
import { ChatQueueService } from "./chat/chat-queue.service.js";
import { PrismaService } from "./common/prisma.service.js";
import { KnowledgeService } from "./knowledge/knowledge.service.js";
import { EmbeddingService } from "./knowledge/embedding.service.js";
import { LlmService } from "./knowledge/llm.service.js";

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    ChatQueueService,
    PrismaService,
    KnowledgeService,
    EmbeddingService,
    LlmService,
  ],
})
export class AppModule {}


