import { Module } from "@nestjs/common";
import { XpService } from "./xp.service.js";

/**
 * Gamification module (Phase 2 doc 03 §1). XP/rank/badge/streak/leaderboard logic. Consumers of
 * domain events (labs.lab.solved, learning.lesson.completed, ctf.challenge.solved) award XP via
 * XpService inside the worker runtime; leaderboards are served from Redis with periodic snapshots.
 */
@Module({
  providers: [XpService],
  exports: [XpService],
})
export class GamificationModule {}
