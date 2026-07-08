import { ForbiddenException, Injectable } from "@nestjs/common";
import { EntitlementService } from "../commerce/entitlement.service.js";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { RedisService } from "../../platform/redis/redis.service.js";

/**
 * Lab quota enforcement (Phase 2 doc 07 §4, FR-AC-096, R1). Checked BEFORE the orchestrator is
 * asked to provision anything — the cheapest possible place to say no. This is the single most
 * important cost-control gate in the platform: lab compute is the marginal cost that can sink
 * margins, so the free-tier caps (1 lab/day, 60-min, no machines) are enforced here, platform-side,
 * against the entitlement read model — never trusted to the client or to plan-config drift.
 */
export interface QuotaDecision {
  allowed: boolean;
  reason?: "concurrency" | "daily_cap" | "machine_forbidden";
  sessionTtlSeconds: number;
}

@Injectable()
export class LabQuotaService {
  constructor(
    private readonly entitlements: EntitlementService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(orgId: string, userId: string, requiresMachine: boolean): Promise<QuotaDecision> {
    const f = await this.entitlements.featuresFor(orgId);

    if (requiresMachine && !f.machineDeploy) {
      return { allowed: false, reason: "machine_forbidden", sessionTtlSeconds: 0 };
    }

    // Concurrency: count live sessions for this user (Redis counter, source-of-truth backstopped
    // by the DB session table with a reaper — Phase 2 doc 07 §4).
    const live = await this.prisma.labSession.count({
      where: { userId, state: { in: ["provisioning", "ready", "active", "idle_warning"] } },
    });
    if (live >= f.labConcurrency) {
      return { allowed: false, reason: "concurrency", sessionTtlSeconds: 0 };
    }

    // Daily cap (free tier): count today's starts from a per-day Redis counter.
    if (f.dailyBrowserLabCap !== null) {
      const dayKey = `labquota:${userId}:${new Date().toISOString().slice(0, 10)}`;
      const started = Number((await this.redis.client.get(dayKey)) ?? "0");
      if (started >= f.dailyBrowserLabCap) {
        return { allowed: false, reason: "daily_cap", sessionTtlSeconds: 0 };
      }
    }

    // TTL: free tier is time-boxed (browserLabMinutesCap); paid tiers get the plan default.
    const ttl = (f.browserLabMinutesCap ?? 240) * 60;
    return { allowed: true, sessionTtlSeconds: ttl };
  }

  /** Records a started session against the daily cap (called after successful provisioning). */
  async recordStart(userId: string): Promise<void> {
    const dayKey = `labquota:${userId}:${new Date().toISOString().slice(0, 10)}`;
    const n = await this.redis.client.incr(dayKey);
    if (n === 1) await this.redis.client.expire(dayKey, 86_400);
  }

  /** Guard helper: throws the canonical quota error for the API layer to translate. */
  async enforce(orgId: string, userId: string, requiresMachine: boolean): Promise<QuotaDecision> {
    const decision = await this.check(orgId, userId, requiresMachine);
    if (!decision.allowed) throw new ForbiddenException(`LAB_QUOTA_EXCEEDED:${decision.reason}`);
    return decision;
  }
}
