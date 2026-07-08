import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service.js";
import { AuthzService } from "./authz/authz.service.js";
import { RedisService } from "./redis/redis.service.js";
import { OutboxService } from "./outbox/outbox.service.js";

/**
 * Platform module — cross-cutting infrastructure every domain module depends on
 * (Phase 2 doc 03 §1: platform ← everything). Global so it needn't be re-imported.
 */
@Global()
@Module({
  providers: [PrismaService, AuthzService, RedisService, OutboxService],
  exports: [PrismaService, AuthzService, RedisService, OutboxService],
})
export class PlatformModule {}
