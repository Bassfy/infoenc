import { describe, expect, it, vi, beforeEach } from "vitest";
import { XpService } from "./xp.service.js";

/**
 * XP idempotency + diminishing-returns tests (FR-AC-060 AC). The integration suite exercises the
 * real DB unique constraint; these unit tests lock the service's contract with a fake transaction.
 */
describe("XpService", () => {
  const diminishing = new XpService({} as never);

  it("returns the correct diminishing amount per prior count", () => {
    expect(diminishing.diminishedAmount("daily.challenge", 0)).toBe(100);
    expect(diminishing.diminishedAmount("daily.challenge", 1)).toBe(60);
    expect(diminishing.diminishedAmount("daily.challenge", 2)).toBe(30);
    expect(diminishing.diminishedAmount("daily.challenge", 5)).toBe(10); // clamps to last rung
    expect(diminishing.diminishedAmount("unknown.rule", 0)).toBe(0);
  });

  describe("award idempotency", () => {
    let tx: {
      xpEvent: { createMany: ReturnType<typeof vi.fn>; aggregate: ReturnType<typeof vi.fn> };
      userProgressSummary: { findUnique: ReturnType<typeof vi.fn>; upsert: ReturnType<typeof vi.fn> };
      rank: { findFirst: ReturnType<typeof vi.fn> };
    };
    let prisma: { $transaction: (fn: (t: typeof tx) => unknown) => unknown };
    let svc: XpService;

    beforeEach(() => {
      tx = {
        xpEvent: { createMany: vi.fn(), aggregate: vi.fn() },
        userProgressSummary: { findUnique: vi.fn(), upsert: vi.fn() },
        rank: { findFirst: vi.fn().mockResolvedValue({ id: "rank-1" }) },
      };
      prisma = { $transaction: (fn) => fn(tx) };
      svc = new XpService(prisma as never);
    });

    it("grants XP and recomputes the total from the event log on a fresh award", async () => {
      tx.xpEvent.createMany.mockResolvedValue({ count: 1 });
      tx.xpEvent.aggregate.mockResolvedValue({ _sum: { amount: 250 } });

      const res = await svc.award({
        userId: "u1",
        amount: 250,
        ruleKey: "lab.solved",
        sourceType: "labs.lab.solved",
        sourceId: "lab-1",
      });

      expect(res).toEqual({ granted: 250, totalXp: 250 });
      expect(tx.userProgressSummary.upsert).toHaveBeenCalledOnce();
    });

    it("is a no-op when the same source already awarded (idempotent replay)", async () => {
      tx.xpEvent.createMany.mockResolvedValue({ count: 0 }); // skipDuplicates hit
      tx.userProgressSummary.findUnique.mockResolvedValue({ totalXp: 250 });

      const res = await svc.award({
        userId: "u1",
        amount: 250,
        ruleKey: "lab.solved",
        sourceType: "labs.lab.solved",
        sourceId: "lab-1",
      });

      expect(res).toEqual({ granted: 0, totalXp: 250 });
      expect(tx.userProgressSummary.upsert).not.toHaveBeenCalled();
    });
  });
});
