import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: false });
  const allowed = process.env.CORS_ORIGIN?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? ["http://localhost:3000"];
  app.enableCors({
    origin: (
        origin: string | undefined,
        callback: (err: Error | null, allow?: boolean) => void
      ) => {
      if (!origin || allowed.includes(origin) || allowed.includes("*")) return callback(null, true);
      callback(new Error(`CORS blocked for origin ${origin}`));
    },
  });
  const port = Number(process.env.CONTENT_API_PORT ?? process.env.PORT ?? 4000);
  await app.listen(port, "0.0.0.0");
}
bootstrap();
