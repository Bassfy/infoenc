import { Injectable, Logger } from "@nestjs/common";
import type { SubscriptionStatus } from "@prisma/client";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";
import { EntitlementService } from "./entitlement.service.js";
import type { NormalizedWebhook } from "./payment/payment-provider.js";

/**
 * Subscription lifecycle state machine (Phase 2 doc 03 §4). Driven by provider webhooks. Two
 * invariants:
 *   1. IDEMPOTENT — each provider event is recorded in WebhookEvent by providerEventId; a replay is
 *      a no-op. Providers deliver at-least-once; this makes double-delivery harmless.
 *   2. Entitlements are refreshed on every state change so access reflects billing within one event.
 *
 * Valid transitions: trialing→active→past_due→{active|suspended}→canceled. Illegal transitions are
 * ignored (logged), never applied — a late/out-of-order webhook can't move a canceled sub back to
 * active.
 */
const ALLOWED: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  trialing: ["active", "past_due", "canceled"],
  active: ["active", "past_due", "canceled"],
  past_due: ["active", "suspended", "canceled"],
  suspended: ["active", "canceled"],
  canceled: [], // terminal
};

@Injectable()
export class SubscriptionService {
  private readonly log = new Logger(SubscriptionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly entitlements: EntitlementService,
  ) {}

  /** Handles a normalized webhook idempotently. Returns true if applied, false if a duplicate. */
  async handleWebhook(provider: string, event: NormalizedWebhook): Promise<boolean> {
    // Idempotency: claim the provider event id. A duplicate delivery inserts nothing → no-op.
    try {
      await this.prisma.webhookEvent.create({
        data: { provider, providerEventId: event.providerEventId, type: event.type, payload: event as never },
      });
    } catch {
      // Unique violation on providerEventId → already processed.
      return false;
    }

    switch (event.type) {
      case "subscription.created":
        await this.transitionByProviderSub(event, "active", event.currentPeriodEnd);
        break;
      case "subscription.renewed":
        await this.transitionByProviderSub(event, "active", event.currentPeriodEnd);
        break;
      case "subscription.past_due":
        await this.transitionByProviderSub(event, "past_due");
        break;
      case "subscription.canceled":
        await this.transitionByProviderSub(event, "canceled");
        break;
      default:
        this.log.debug(`ignoring webhook type ${event.type}`);
    }

    await this.prisma.webhookEvent.update({
      where: { providerEventId: event.providerEventId },
      data: { processedAt: new Date() },
    });
    return true;
  }

  private async transitionByProviderSub(
    event: NormalizedWebhook,
    target: SubscriptionStatus,
    periodEnd?: Date,
  ): Promise<void> {
    if (!event.providerSubscriptionId) return;
    const sub = await this.prisma.subscription.findFirst({
      where: { providerSubId: event.providerSubscriptionId },
    });
    if (!sub) {
      this.log.warn(`no local subscription for provider sub ${event.providerSubscriptionId}`);
      return;
    }
    if (!ALLOWED[sub.status].includes(target)) {
      this.log.warn(`illegal transition ${sub.status} → ${target} for ${sub.id}; ignoring`);
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.subscription.update({
        where: { id: sub.id },
        data: {
          status: target,
          ...(periodEnd ? { currentPeriodEnd: periodEnd } : {}),
          ...(target === "canceled" ? { canceledAt: new Date() } : {}),
        },
      });
      const eventName =
        target === "canceled"
          ? "commerce.subscription.canceled"
          : target === "past_due"
            ? "commerce.subscription.past_due"
            : "commerce.subscription.renewed";
      await this.outbox.emit(tx, { name: eventName, aggregateId: sub.id, orgId: sub.orgId, payload: { subscriptionId: sub.id } });
    });

    // Access reflects billing immediately (drop the cached entitlement read model).
    await this.entitlements.invalidate(sub.orgId);
  }
}
