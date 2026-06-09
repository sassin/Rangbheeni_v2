import { Body, Controller, ForbiddenException, Headers, Post } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";
import { StorageService } from "../common/storage.service.js";

function requirePrivateKey(value?: string) {
  const expected = process.env.PRIVATE_API_KEY;
  if (!expected || value !== expected) throw new ForbiddenException("Invalid private API key");
}

@Controller("private")
export class PrivateController {
  constructor(private readonly storage: StorageService, private readonly prisma: PrismaService) {}

  @Post("media/presigned-upload")
  async presignedUpload(@Headers("x-api-key") apiKey: string | undefined, @Body() body: { filename: string; contentType: string }) {
    requirePrivateKey(apiKey);
    return this.storage.createPresignedUpload({ filename: body.filename, contentType: body.contentType });
  }

  @Post("media/complete")
  async completeUpload(@Headers("x-api-key") apiKey: string | undefined, @Body() body: { key: string; url: string; altText?: string; mimeType?: string; sizeBytes?: number }) {
    requirePrivateKey(apiKey);
    return this.prisma.mediaAsset.upsert({
      where: { key: body.key },
      update: { url: body.url, altText: body.altText ?? null, mimeType: body.mimeType ?? null, sizeBytes: body.sizeBytes ?? null },
      create: { key: body.key, url: body.url, altText: body.altText ?? null, mimeType: body.mimeType ?? null, sizeBytes: body.sizeBytes ?? null },
    });
  }

  @Post("announcements/publish")
  async publishAnnouncement(@Headers("x-api-key") apiKey: string | undefined, @Body() body: { slug: string; status: "draft" | "published" | "archived" }) {
    requirePrivateKey(apiKey);
    return this.prisma.announcement.update({ where: { slug: body.slug }, data: { status: body.status } });
  }
}
