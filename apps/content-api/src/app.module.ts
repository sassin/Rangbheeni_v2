import { Module } from "@nestjs/common";
import { PrismaService } from "./common/prisma.service.js";
import { StorageService } from "./common/storage.service.js";
import { PublicController } from "./public/public.controller.js";
import { PublicService } from "./public/public.service.js";
import { PrivateController } from "./private/private.controller.js";

@Module({
  controllers: [PublicController, PrivateController],
  providers: [PrismaService, StorageService, PublicService],
})
export class AppModule {}
