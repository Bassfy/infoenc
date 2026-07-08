import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";
import { RedisService } from "../../platform/redis/redis.service.js";
import { LabSessionService } from "./lab-session.service.js";
import { validateSubmission } from "./flag.js";

/**
 * Flag submission (Phase 2 doc 07, FR-AC-041). Validates a submitted flag against the session's
 * dynamic secret, rate-limits attempts (the MVP rate-limited this too — abuse surface), records
 * every attempt, and on a correct FIRST solve emits `labs.task.completed` / `labs.lab.solved` in
 * the same transaction (outbox → XP consumer awards XP idempotently).
 *
 * First-solve idempotency: LabCompletion has a unique (labId,userId), so a repeat correct
 * submission records the attempt but does not double-emit the solve event or re-award XP.
 */
@Injectable()
export class FlagSubmissionService {
  private static readonly RATE_LIMIT = 15; // per minute (matches the MVP flag limiter)

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly redis: RedisService,
    private readonly sessions: LabSessionService,
  ) {}

  async submit(params: {
    userId: string;
    sessionId: string;
    labId: string;
    taskId?: string;
    submitted: string;
  }): Promise<{ correct: boolean; firstSolve: boolean }> {
    await this.rateLimit(params.userId);

    const secret = await this.sessions.sessionSecret(params.sessionId);
    const target = `${params.labId}:${params.taskId ?? "root"}`;
    const correct = validateSubmission({ submitted: params.submitted, sessionSecret: secret, target });

    // Every attempt is recorded (correct or not) for abuse analysis.
    await this.prisma.flagSubmission.create({
      data: { labId: params.labId, userId: params.userId, taskId: params.taskId ?? null, isCorrect: correct },
    });
    if (!correct) return { correct: false, firstSolve: false };

    // Correct: record the first solve idempotently and emit the solve event on the first time only.
    const firstSolve = await this.prisma.$transaction(async (tx) => {
      const inserted = await tx.labCompletion.createMany({
        data: [{ labId: params.labId, userId: params.userId, pointsEarned: 0 }],
        skipDuplicates: true,
      });
      if (inserted.count === 0) return false; // already solved — no double XP

      const lab = await tx.lab.findUniqueOrThrow({ where: { id: params.labId } });
      // is this the very first solver of this lab? (first-blood bonus)
      const solvesBefore = await tx.labCompletion.count({ where: { labId: params.labId } });
      const firstBlood = solvesBefore === 1; // this row is the only one so far

      await tx.lab.update({ where: { id: params.labId }, data: { solveCount: { increment: 1 } } });
      await this.outbox.emit(tx, {
        name: "labs.lab.solved",
        aggregateId: params.labId,
        payload: { userId: params.userId, labId: params.labId, points: lab.basePoints, firstBlood },
      });
      return true;
    });

    return { correct: true, firstSolve };
  }

  private async rateLimit(userId: string): Promise<void> {
    const key = `flagrl:${userId}:${Math.floor(Date.now() / 60000)}`;
    const n = await this.redis.client.incr(key);
    if (n === 1) await this.redis.client.expire(key, 60);
    if (n > FlagSubmissionService.RATE_LIMIT) {
      throw new ForbiddenException("RATE_LIMITED: too many flag submissions");
    }
  }
}
