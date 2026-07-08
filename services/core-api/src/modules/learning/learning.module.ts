import { Module } from "@nestjs/common";
import { LearningService } from "./learning.service.js";

/**
 * Learning module (Phase 2 doc 03). Enrollment, progress, assessments. Emits learning.* events via
 * the transactional outbox; PlatformModule (global) supplies PrismaService + OutboxService.
 */
@Module({
  providers: [LearningService],
  exports: [LearningService],
})
export class LearningModule {}
