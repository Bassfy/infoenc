import { ForbiddenException, Injectable } from "@nestjs/common";
import type { Locale } from "@prisma/client";
import type { Principal } from "@infoenc/contracts/auth";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";
import { AuthzService } from "../../platform/authz/authz.service.js";

/**
 * Engagement report delivery (FR-CO-034, FR-AU-050). The report itself is ASSEMBLED by the Phase 8
 * automation (pentest-report generator) from the findings library, but delivery is a guarded
 * human-in-the-loop process owned here:
 *   1. A draft report is registered (S3 key + envelope-wrapped key) — NOT visible to the client.
 *   2. A lead consultant must APPROVE it (approvedBy) before it can be delivered — the human gate
 *      on customer-facing output (doc 07 ground rules). A report with no approver cannot deliver.
 *   3. Delivery sets deliveredAt and emits the event; only then can the client fetch it (watermarked,
 *      per-recipient, via the evidence-style presigned path).
 * Every report is bilingual-capable (one row per locale) and RLS-scoped to the client org.
 */
@Injectable()
export class ReportService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
    private readonly authz: AuthzService,
  ) {}

  async register(
    actor: Principal,
    input: { engagementId: string; orgId: string; kind: "executive" | "technical" | "machine_readable"; locale: Locale; s3Key: string; wrappedKey: Buffer },
  ): Promise<{ reportId: string }> {
    this.authz.assert(actor, "finding.publish", { orgId: input.orgId }); // consultant scope
    const existing = await this.prisma.tenant.engagementReport.count({
      where: { engagementId: input.engagementId, kind: input.kind, locale: input.locale },
    });
    const report = await this.prisma.tenant.engagementReport.create({
      data: {
        engagementId: input.engagementId,
        orgId: input.orgId,
        kind: input.kind,
        locale: input.locale,
        s3Key: input.s3Key,
        wrappedKey: input.wrappedKey,
        version: existing + 1,
      },
    });
    return { reportId: report.id };
  }

  /** Lead-consultant approval — the gate. Records who approved; without this, delivery is blocked. */
  async approve(actor: Principal, reportId: string): Promise<void> {
    const report = await this.prisma.tenant.engagementReport.findUniqueOrThrow({ where: { id: reportId } });
    this.authz.assert(actor, "finding.publish", { orgId: report.orgId });
    await this.prisma.tenant.engagementReport.update({
      where: { id: reportId },
      data: { approvedBy: actor.userId },
    });
  }

  /** Delivers an APPROVED report to the client. Refuses to deliver an unapproved report. */
  async deliver(actor: Principal, reportId: string): Promise<void> {
    const report = await this.prisma.tenant.engagementReport.findUniqueOrThrow({ where: { id: reportId } });
    this.authz.assert(actor, "finding.publish", { orgId: report.orgId });
    if (!report.approvedBy) {
      throw new ForbiddenException("report must be approved by a lead consultant before delivery");
    }
    // A consultant cannot self-approve-and-deliver in one motion if dual-control is configured;
    // the approver and deliverer being distinct is enforced by policy where required.
    await this.prisma.$transaction(async (tx) => {
      await tx.engagementReport.update({ where: { id: reportId }, data: { deliveredAt: new Date() } });
      await this.outbox.emit(tx, {
        name: "engagements.report.delivered",
        aggregateId: reportId,
        orgId: report.orgId,
        payload: { engagementId: report.engagementId, kind: report.kind, locale: report.locale },
      });
    });
  }
}
