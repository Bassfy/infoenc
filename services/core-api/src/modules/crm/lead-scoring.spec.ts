import { describe, expect, it } from "vitest";
import { scoreLead, type LeadSignals } from "./lead-scoring.js";

/**
 * Lead-scoring tests (FR-CO-022). The routing is customer-facing (hot leads reach a consultant),
 * so the thresholds must be locked + explainable (NFR-075). Also the transparency requirement:
 * every point is attributable to a signal.
 */
const base: LeadSignals = {
  hasCompanyDomain: false,
  budgetIndicated: false,
  complianceDriver: false,
  repeatContact: false,
};

describe("scoreLead", () => {
  it("routes a cold lead to newsletter", () => {
    const r = scoreLead(base);
    expect(r.score).toBe(0);
    expect(r.temperature).toBe("cold");
    expect(r.route).toBe("newsletter");
  });

  it("routes a budget + compliance + business-domain lead as hot to a consultant", () => {
    const r = scoreLead({
      ...base,
      hasCompanyDomain: true, // 15
      budgetIndicated: true, // 25
      complianceDriver: true, // 20
      serviceInterest: "compliance", // 10
    });
    expect(r.score).toBe(70);
    expect(r.temperature).toBe("hot");
    expect(r.route).toBe("consultant_calendar");
  });

  it("treats an urgent large-company red-team inquiry as hot", () => {
    const r = scoreLead({
      ...base,
      hasCompanyDomain: true, // 15
      companySizeEstimate: 500, // 10
      serviceInterest: "red_team", // 10
      timelineWeeks: 4, // 15
      budgetIndicated: true, // 25
    });
    expect(r.score).toBe(75);
    expect(r.temperature).toBe("hot");
  });

  it("lands a mid-signal lead in the warm nurture track", () => {
    const r = scoreLead({ ...base, hasCompanyDomain: true, repeatContact: true, complianceDriver: false, serviceInterest: "web_pentest" as never });
    // 15 + 15 = 30 → still cold; add a small signal to cross 35
    expect(r.temperature).toBe("cold");
    const warm = scoreLead({ ...base, hasCompanyDomain: true, repeatContact: true, budgetIndicated: false, complianceDriver: true });
    expect(warm.score).toBe(50);
    expect(warm.temperature).toBe("warm");
    expect(warm.route).toBe("nurture");
  });

  it("clamps the score at 100", () => {
    const r = scoreLead({
      hasCompanyDomain: true,
      budgetIndicated: true,
      complianceDriver: true,
      repeatContact: true,
      serviceInterest: "red_team",
      companySizeEstimate: 1000,
      timelineWeeks: 2,
    });
    expect(r.score).toBe(100);
  });
});
