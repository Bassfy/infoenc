import { describe, expect, it, vi } from "vitest";
import { LabQuotaService } from "./lab-quota.service.js";
import type { PlanFeatures } from "@infoenc/contracts/commerce";

/**
 * Lab-quota cost-control tests (FR-AC-096, R1). The free-tier caps are the single most important
 * margin guard; these lock the deny paths so a regression that lets free users provision machines
 * or exceed the daily cap fails CI.
 */
const FREE: PlanFeatures = {
  labConcurrency: 1,
  machineDeploy: false,
  machineConcurrency: 0,
  vpnLabs: false,
  dailyBrowserLabCap: 1,
  browserLabMinutesCap: 60,
  pathCertificates: false,
  careerPriority: false,
  privateCtf: false,
  teamManagement: false,
  sso: false,
};

function build(opts: { features: PlanFeatures; liveSessions: number; startedToday: string }) {
  const entitlements = { featuresFor: vi.fn().mockResolvedValue(opts.features) };
  const prisma = { labSession: { count: vi.fn().mockResolvedValue(opts.liveSessions) } };
  const redis = { client: { get: vi.fn().mockResolvedValue(opts.startedToday), incr: vi.fn(), expire: vi.fn() } };
  return new LabQuotaService(entitlements as never, prisma as never, redis as never);
}

describe("LabQuotaService.check", () => {
  it("forbids machine deploys on the free tier", async () => {
    const svc = build({ features: FREE, liveSessions: 0, startedToday: "0" });
    const d = await svc.check("org", "user", true);
    expect(d).toMatchObject({ allowed: false, reason: "machine_forbidden" });
  });

  it("blocks a second concurrent session on the free tier", async () => {
    const svc = build({ features: FREE, liveSessions: 1, startedToday: "0" });
    const d = await svc.check("org", "user", false);
    expect(d).toMatchObject({ allowed: false, reason: "concurrency" });
  });

  it("enforces the daily browser-lab cap", async () => {
    const svc = build({ features: FREE, liveSessions: 0, startedToday: "1" });
    const d = await svc.check("org", "user", false);
    expect(d).toMatchObject({ allowed: false, reason: "daily_cap" });
  });

  it("allows a first browser lab and time-boxes it to the tier cap", async () => {
    const svc = build({ features: FREE, liveSessions: 0, startedToday: "0" });
    const d = await svc.check("org", "user", false);
    expect(d.allowed).toBe(true);
    expect(d.sessionTtlSeconds).toBe(60 * 60); // 60-min free cap
  });

  it("gives paid tiers (unlimited daily) a longer session and no daily block", async () => {
    const pro: PlanFeatures = { ...FREE, machineDeploy: true, labConcurrency: 4, dailyBrowserLabCap: null, browserLabMinutesCap: null };
    const svc = build({ features: pro, liveSessions: 2, startedToday: "99" });
    const d = await svc.check("org", "user", true);
    expect(d.allowed).toBe(true);
    expect(d.sessionTtlSeconds).toBe(240 * 60); // default TTL when uncapped
  });
});
