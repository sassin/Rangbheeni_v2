import { Body, Controller, Get, Post } from "@nestjs/common";

@Controller("chat-debug")
export class ChatDebugController {
  @Get("ping")
  ping() {
    return {
      ok: true,
      service: "chatbot-api",
      route: "chat-debug/ping",
      time: new Date().toISOString(),
    };
  }

  @Post("echo")
  echo(@Body() body: any) {
    return {
      ok: true,
      route: "chat-debug/echo",
      received: body ?? null,
      messageLength:
        typeof body?.message === "string" ? body.message.length : 0,
      sessionId:
        typeof body?.sessionId === "string" ? body.sessionId : null,
      time: new Date().toISOString(),
    };
  }
}
