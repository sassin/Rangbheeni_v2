import { Body, Controller, ForbiddenException, Headers, Post } from "@nestjs/common";
import { PrismaService } from "../common/prisma.service.js";

function requirePrivateKey(value?: string) {
  const expected = process.env.CONTENT_API_PRIVATE_KEY ?? process.env.PRIVATE_API_KEY;
  if (!expected || value !== expected) throw new ForbiddenException("Invalid private API key");
}

@Controller("private")
export class PrivateController {
  constructor(private readonly prisma: PrismaService) {}

  @Post("announcements/publish")
  async publishAnnouncement(
    @Headers("x-api-key") apiKey: string | undefined,
    @Body() body: { slug: string; status: "draft" | "published" | "archived" },
  ) {
    requirePrivateKey(apiKey);

    return this.prisma.announcement.update({
      where: { slug: body.slug },
      data: { status: body.status },
    });
  }
}
