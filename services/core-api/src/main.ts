import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import helmet from "helmet";
import { AppModule } from "./app.module.js";
import { loadEnv } from "./config/env.js";

/**
 * HTTP/WS entrypoint (Phase 2 doc 03). The worker entrypoint (worker.ts) boots the same modules
 * with BullMQ consumers instead of the HTTP server — one codebase, two runtimes.
 */
async function bootstrap(): Promise<void> {
  const env = loadEnv();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Security headers (NFR-011). Strict CSP is set per-app at the edge/Next layer; helmet covers
  // the API responses (no inline, frameguard, HSTS in production).
  app.use(
    helmet({
      contentSecurityPolicy: env.NODE_ENV === "production" ? undefined : false,
      hsts: env.NODE_ENV === "production",
    }),
  );

  app.enableCors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  });

  // Trust the edge proxy (Cloudflare/ALB) for correct client IPs behind it.
  app.getHttpAdapter().getInstance().set("trust proxy", 1);

  app.enableShutdownHooks();
  await app.listen(env.PORT);
}

void bootstrap();
