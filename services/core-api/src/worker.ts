import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { loadEnv } from "./config/env.js";

/**
 * Worker entrypoint (Phase 2 doc 03). Boots the SAME modules as main.ts but as a standalone
 * application context — no HTTP server. BullMQ consumers (registered by domain modules as they
 * land in Phases 6–8) run here, scaled and failure-isolated separately from the HTTP tier.
 *
 * Consumers re-establish tenant context from each event's orgId before touching data (doc 06 §3)
 * and re-check authorization (events are not pre-authorized).
 */
async function bootstrap(): Promise<void> {
  loadEnv();
  const app = await NestFactory.createApplicationContext(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  // Queue processors self-register via module providers; keep the context alive.
}

void bootstrap();
