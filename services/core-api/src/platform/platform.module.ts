import { Global, Module } from "@nestjs/common";
import { PrismaService } from "./prisma/prisma.service.js";
import { AuthzService } from "./authz/authz.service.js";

/**
 * Platform module — cross-cutting infrastructure every domain module depends on
 * (Phase 2 doc 03 §1: platform ← everything). Global so it needn't be re-imported.
 */
@Global()
@Module({
  providers: [PrismaService, AuthzService],
  exports: [PrismaService, AuthzService],
})
export class PlatformModule {}
