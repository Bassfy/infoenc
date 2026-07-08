import { Injectable } from "@nestjs/common";
import type { EventEnvelope, LabSolvedPayload } from "@infoenc/contracts/events";
import { runWithTenant } from "../../platform/tenant/tenant-context.js";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { XpService } from "./xp.service.js";

/**
 * XP consumer (Phase 2 doc 03 §3, worker runtime). Subscribes to solve/completion events and
 * awards XP. Two properties matter:
 *   1. It re-establishes tenant context from the event's orgId before touching data (doc 06 §3) —
 *      a consumer processing org A's event physically cannot read org B's rows.
 *   2. It records (consumer, eventId) in the idempotency ledger so a redelivered event is skipped;
 *      the XP award itself is ALSO idempotent (unique source), so this is belt-and-braces.
 *
 * Mapping event → XP rule keeps reward policy in one place; the award is idempotent per source.
 */
@Injectable()
export class XpConsumer {
  private static readonly CONSUMER = "gamification.xp";

  constructor(
    private readonly prisma: PrismaService,
    private readonly xp: XpService,
  ) {}

  async handle(event: EventEnvelope): Promise<void> {
    // Idempotency ledger: claim the event; if already processed, no-op.
    const claimed = await this.prisma.processedEvent.createMany({
      data: [{ consumer: XpConsumer.CONSUMER, eventId: event.id }],
      skipDuplicates: true,
    });
    if (claimed.count === 0) return;

    const ctx = event.orgId
      ? { userId: "", orgId: event.orgId, roles: [], isStaff: false }
      : undefined;

    const run = () => this.dispatch(event);
    await (ctx ? runWithTenant({ ...ctx }, run) : run());
  }

  private async dispatch(event: EventEnvelope): Promise<void> {
    switch (event.name) {
      case "labs.lab.solved": {
        const p = event.payload as unknown as LabSolvedPayload;
        await this.xp.award({
          userId: p.userId,
          amount: p.points + (p.firstBlood ? 50 : 0),
          ruleKey: p.firstBlood ? "lab.solved.first_blood" : "lab.solved",
          sourceType: event.name,
          sourceId: p.labId,
        });
        break;
      }
      case "learning.lesson.completed": {
        const p = event.payload as { userId: string; lessonId: string };
        await this.xp.award({
          userId: p.userId,
          amount: 20,
          ruleKey: "lesson.completed",
          sourceType: event.name,
          sourceId: p.lessonId,
        });
        break;
      }
      case "ctf.challenge.solved": {
        const p = event.payload as { userId: string; challengeId: string; points: number };
        await this.xp.award({
          userId: p.userId,
          amount: p.points,
          ruleKey: "ctf.solved",
          sourceType: event.name,
          sourceId: p.challengeId,
        });
        break;
      }
      default:
        // Not an XP-relevant event; ignore. (Other consumers handle it.)
        break;
    }
  }
}
