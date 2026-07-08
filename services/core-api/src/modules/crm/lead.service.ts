import { Injectable } from "@nestjs/common";
import type { EngagementType } from "@prisma/client";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";
import { scoreLead, type LeadSignals } from "./lead-scoring.js";

/**
 * Lead intake (Phase 2 doc 05, FR-CO-020/021/022). A scoping-form submission becomes a CRM lead
 * with source attribution, is scored + routed (hot → consultant, warm → nurture, cold → newsletter),
 * and emits `crm.lead.created` so the automation layer (FR-AU-010) can enrich, schedule, and follow
 * up. Leads are captured at the platform level (no org yet) — a raw lead has no orgId until it
 * converts, so this uses the base client, not the RLS-scoped one.
 */
@Injectable()
export class LeadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  async intake(input: {
    contactEmail: string;
    contactName?: string;
    companyName?: string;
    interest?: EngagementType;
    scopingData: Record<string, unknown>;
    source: Record<string, unknown>; // UTM / referrer / campaign
    signals: LeadSignals;
  }): Promise<{ leadId: string; temperature: string; route: string; score: number }> {
    const scored = scoreLead(input.signals);

    const lead = await this.prisma.$transaction(async (tx) => {
      const created = await tx.lead.create({
        data: {
          contactEmail: input.contactEmail,
          contactName: input.contactName ?? null,
          companyName: input.companyName ?? null,
          interest: input.interest ?? null,
          scopingData: input.scopingData as never,
          source: input.source as never,
          score: scored.score,
          temperature: scored.temperature,
          stage: "new",
        },
      });
      await this.outbox.emit(tx, {
        name: "crm.lead.created",
        aggregateId: created.id,
        payload: { leadId: created.id, temperature: scored.temperature, route: scored.route, interest: input.interest ?? null },
      });
      return created;
    });

    return { leadId: lead.id, temperature: scored.temperature, route: scored.route, score: scored.score };
  }
}
