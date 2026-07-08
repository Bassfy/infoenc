import { Injectable } from "@nestjs/common";
import type { EngagementType } from "@prisma/client";
import type { Principal } from "@infoenc/contracts/auth";
import { PrismaService } from "../../platform/prisma/prisma.service.js";

/**
 * Engagement management (Phase 2 doc 05). Engagements are the container for crown-jewel data; all
 * reads go through the RLS-scoped client so a client contact only ever sees their own org's
 * engagements, and staff see across orgs only via the staff-scope RLS variant (audited).
 *
 * The client portal's findings feed reads published findings for an engagement; the severity
 * summary here powers the portal's at-a-glance view (FR-CO-032).
 */
@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  async list(_actor: Principal): Promise<Array<{ id: string; reference: string; title: string; state: string }>> {
    // RLS scopes this to the actor's org automatically (Phase 2 doc 06 §3).
    const rows = await this.prisma.tenant.engagement.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, reference: true, title: true, state: true },
    });
    return rows;
  }

  /** Portal findings feed: published findings + a severity rollup (FR-CO-032). */
  async findingsFeed(engagementId: string, isStaff: boolean) {
    const findings = await this.prisma.tenant.finding.findMany({
      where: {
        engagementId,
        // client contacts see only published; staff see everything
        ...(isStaff ? {} : { publishedAt: { not: null } }),
      },
      orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
      select: { id: true, severity: true, status: true, affectedAsset: true, cvssScore: true, publishedAt: true },
    });

    const summary = { critical: 0, high: 0, medium: 0, low: 0, info: 0 } as Record<string, number>;
    for (const f of findings) summary[f.severity] = (summary[f.severity] ?? 0) + 1;

    return { findings, summary };
  }

  async create(
    input: { orgId: string; type: EngagementType; reference: string; title: string; leadConsultantId?: string },
  ): Promise<{ engagementId: string }> {
    const engagement = await this.prisma.tenant.engagement.create({
      data: {
        orgId: input.orgId,
        type: input.type,
        reference: input.reference,
        title: input.title,
        leadConsultantId: input.leadConsultantId ?? null,
        state: "scoped",
      },
    });
    return { engagementId: engagement.id };
  }
}
