import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../platform/prisma/prisma.service.js";

/**
 * XP engine (Phase 3 doc 01 §5, FR-AC-060). XP is an APPEND-ONLY event log — never a mutable
 * counter as the source of truth. The user's total is a maintained read model rebuilt from events.
 *
 * The core guarantee is IDEMPOTENCY: the same source action can never award XP twice. The unique
 * constraint (userId, ruleKey, sourceType, sourceId) makes a duplicate award a no-op at the
 * database level, so retried events, replayed queue messages, and double-clicks are all safe.
 */
export interface XpGrant {
  userId: string;
  amount: number;
  ruleKey: string;
  sourceType: string;
  sourceId: string;
}

/** Anti-farming: repeated grants of the same rule yield diminishing XP (Phase 1 FR-AC-060). */
const DIMINISHING_RULES: Record<string, number[]> = {
  "daily.challenge": [100, 60, 30, 10], // 1st, 2nd, 3rd, 4th+ same-day
};

@Injectable()
export class XpService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Awards XP idempotently and refreshes the user's summary + rank. Returns the amount actually
   * granted (0 if this exact source already awarded — the idempotent no-op case).
   */
  async award(grant: XpGrant): Promise<{ granted: number; totalXp: number }> {
    return this.prisma.$transaction(async (tx) => {
      // Idempotent insert: skipDuplicates makes a repeat a no-op instead of an error.
      const inserted = await tx.xpEvent.createMany({
        data: [
          {
            userId: grant.userId,
            amount: grant.amount,
            ruleKey: grant.ruleKey,
            sourceType: grant.sourceType,
            sourceId: grant.sourceId,
          },
        ],
        skipDuplicates: true,
      });

      if (inserted.count === 0) {
        // Already awarded for this exact source — return current total, grant nothing.
        const summary = await tx.userProgressSummary.findUnique({ where: { userId: grant.userId } });
        return { granted: 0, totalXp: summary?.totalXp ?? 0 };
      }

      // Recompute the total from the authoritative event log (never trust a drifting counter).
      const agg = await tx.xpEvent.aggregate({
        where: { userId: grant.userId },
        _sum: { amount: true },
      });
      const totalXp = agg._sum.amount ?? 0;

      const rank = await this.rankForXp(tx, totalXp);
      await tx.userProgressSummary.upsert({
        where: { userId: grant.userId },
        create: { userId: grant.userId, totalXp, rankId: rank?.id ?? null },
        update: { totalXp, rankId: rank?.id ?? null },
      });

      return { granted: grant.amount, totalXp };
    });
  }

  /** Resolves the current amount for a diminishing rule given prior same-scope grants. */
  diminishedAmount(ruleKey: string, priorCount: number): number {
    const ladder = DIMINISHING_RULES[ruleKey];
    if (!ladder) return 0;
    return ladder[Math.min(priorCount, ladder.length - 1)] ?? 0;
  }

  private async rankForXp(
    tx: Parameters<Parameters<PrismaService["$transaction"]>[0]>[0],
    totalXp: number,
  ) {
    return tx.rank.findFirst({
      where: { minXp: { lte: totalXp } },
      orderBy: { minXp: "desc" },
    });
  }
}
