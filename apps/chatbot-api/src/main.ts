import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module.js";

function parseCsvEnv(value: string | undefined, fallback: string[]) {
  const parsed = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed?.length ? parsed : fallback;
}

async function bootstrap() {
  const allowedOrigins = parseCsvEnv(process.env.CORS_ORIGIN, [
    "http://localhost:3000",
  ]);

  const bodyLimit = process.env.CHATBOT_BODY_LIMIT ?? "8kb";

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    cors: false,
    bodyParser: false,
  });

  app.useBodyParser("json", { limit: bodyLimit });
  app.useBodyParser("urlencoded", { limit: bodyLimit, extended: false });

  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.disable?.("x-powered-by");

  app.use((_: unknown, res: any, next: () => void) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
    next();
  });

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void
    ) => {
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked for origin ${origin}`));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-api-key"],
    credentials: false,
    maxAge: 86_400,
  });

  const port = Number(process.env.CHATBOT_API_PORT ?? process.env.PORT ?? 4100);
  await app.listen(port, "0.0.0.0");
}

bootstrap();
