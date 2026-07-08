import { describe, expect, it } from "vitest";
import { detectCrossSell } from "./cross-sell.js";

/**
 * Cross-sell flywheel tests (doc 03 §4, FR-CO-054). The flags drive sales action, so the conditions
 * must be precise — no spamming a client with a training pitch they don't warrant.
 */
describe("detectCrossSell", () => {
  it("flags assess→train for a services client with open findings and no training", () => {
    const ops = detectCrossSell({
      isClient: true,
      isBusiness: false,
      hasSubscription: false,
      hasCompletedEngagement: true,
      openFindingCount: 6,
    });
    expect(ops).toHaveLength(1);
    expect(ops[0]!.direction).toBe("assess_to_train");
  });

  it("does NOT flag assess→train if the client already trains with us", () => {
    const ops = detectCrossSell({
      isClient: true,
      isBusiness: true,
      hasSubscription: true,
      hasCompletedEngagement: true,
      openFindingCount: 6,
    });
    expect(ops.some((o) => o.direction === "assess_to_train")).toBe(false);
  });

  it("does NOT flag assess→train with no findings (nothing to upskill against)", () => {
    const ops = detectCrossSell({
      isClient: true,
      isBusiness: false,
      hasSubscription: false,
      hasCompletedEngagement: true,
      openFindingCount: 0,
    });
    expect(ops).toHaveLength(0);
  });

  it("flags train→assess for a corporate training customer with no engagement", () => {
    const ops = detectCrossSell({
      isClient: false,
      isBusiness: true,
      hasSubscription: true,
      hasCompletedEngagement: false,
      openFindingCount: 0,
    });
    expect(ops).toHaveLength(1);
    expect(ops[0]!.direction).toBe("train_to_assess");
  });

  it("returns nothing for a plain personal learner", () => {
    const ops = detectCrossSell({
      isClient: false,
      isBusiness: false,
      hasSubscription: true,
      hasCompletedEngagement: false,
      openFindingCount: 0,
    });
    expect(ops).toHaveLength(0);
  });
});
