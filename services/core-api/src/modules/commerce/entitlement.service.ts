import { Injectable } from "@nestjs/common";
import type { PlanFeatures } from "@infoenc/contracts/commerce";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { RedisService } from "../../platform/redis/redis.service.js";

/**
 * Entitlements (Phase 2 doc 03 §4). A single computed, cached, event-refreshed read model of what
 * an org's active subscription grants. API guards and the lab-quota checker consult it; a
 * subscription webhook emits `entitlements.refresh` which invalidates the cache.
 *
 * The free-tier defaults here encode the cost-control caps (Phase 1 doc 03, R1): the free tier can
 * never cost more than the margin model allows, because the caps are enforced platform-side before
 * any lab is provisioned — not left to plan-config drift.
 */
const FREE_TIER: PlanFeatures = {
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

@Injectable()
export class EntitlementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Resolved feature set for an org — cached in Redis, rebuilt from the active subscription. */
  async featuresFor(orgId: string): Promise<PlanFeatures> {
    const cacheKey = `ent:${orgId}`;
    const cached = await this.redis.client.get(cacheKey);
    if (cached) return JSON.parse(cached) as PlanFeatures;

    const sub = await this.prisma.subscription.findFirst({
      where: { orgId, status: { in: ["trialing", "active"] } },
      include: { plan: true },
      orderBy: { currentPeriodEnd: "desc" },
    });

    const features: PlanFeatures = sub ? (sub.plan.features as unknown as PlanFeatures) : FREE_TIER;
    await this.redis.client.set(cacheKey, JSON.stringify(features), "EX", 300);
    return features;
  }

  /** Called on subscription lifecycle events to drop the cached read model. */
  async invalidate(orgId: string): Promise<void> {
    await this.redis.client.del(`ent:${orgId}`);
  }
}
