import { Module } from "@nestjs/common";
import { XpService } from "./xp.service.js";
import { XpConsumer } from "./xp.consumer.js";

/**
 * Gamification module (Phase 2 doc 03 §1). XpService (award logic) + XpConsumer (worker-runtime
 * event handler that awards XP on solve/completion events, re-establishing tenant context per
 * event). Rank/badge/streak/leaderboard services extend this module.
 */
@Module({
  providers: [XpService, XpConsumer],
  exports: [XpService, XpConsumer],
})
export class GamificationModule {}
