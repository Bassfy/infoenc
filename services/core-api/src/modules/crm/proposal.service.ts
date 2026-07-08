import { BadRequestException, Injectable } from "@nestjs/common";
import type { EngagementType } from "@prisma/client";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { OutboxService } from "../../platform/outbox/outbox.service.js";

/**
 * Proposals + the won→engagement conversion (Phase 2 doc 05, FR-CO-024, doc 04 J3).
 *
 * A proposal is drafted from a qualified lead's scoping data (the FR-AU-011 automation produces the
 * draft; a consultant reviews before it's sent). This service owns the proposal lifecycle
 * (draft→sent→viewed→signed/expired) and — critically — the FLYWHEEL: when a proposal is signed,
 * the lead converts into a `client` org with the contact as owner, and the engagement is created.
 * That single transaction turns a marketing lead into a paying services relationship.
 */
const REFERENCE_PREFIX = "ENG";

@Injectable()
export class ProposalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly outbox: OutboxService,
  ) {}

  /** Creates a proposal draft against a lead. The body/PDF is produced by FR-AU-011 + review. */
  async createDraft(input: {
    leadId: string;
    currency: string;
    amount: number;
    generatedByRunId?: string;
  }): Promise<{ proposalId: string }> {
    const lead = await this.prisma.lead.findUniqueOrThrow({ where: { id: input.leadId } });
    if (lead.stage === "won" || lead.stage === "lost") {
      throw new BadRequestException("lead is already closed");
    }
    const proposal = await this.prisma.proposal.create({
      data: {
        leadId: input.leadId,
        currency: input.currency,
        amount: input.amount,
        status: "draft",
        generatedByRunId: input.generatedByRunId ?? null,
      },
    });
    await this.prisma.lead.update({ where: { id: input.leadId }, data: { stage: "proposal" } });
    return { proposalId: proposal.id };
  }

  async markSent(proposalId: string): Promise<void> {
    await this.prisma.proposal.update({
      where: { id: proposalId },
      data: { status: "sent", sentAt: new Date(), expiresAt: new Date(Date.now() + 30 * 86_400_000) },
    });
  }

  async markViewed(proposalId: string): Promise<void> {
    await this.prisma.proposal.updateMany({
      where: { id: proposalId, viewedAt: null },
      data: { status: "viewed", viewedAt: new Date() },
    });
  }

  /**
   * THE FLYWHEEL. A signed proposal converts the lead into a client org and opens the engagement —
   * atomically, so a partial conversion can never leave a signed deal without an engagement.
   */
  async accept(input: {
    proposalId: string;
    contactUserId: string; // the signer's user account (created/linked at portal invite)
    engagementType: EngagementType;
    engagementTitle: string;
  }): Promise<{ orgId: string; engagementId: string }> {
    return this.prisma.$transaction(async (tx) => {
      const proposal = await tx.proposal.findUniqueOrThrow({ where: { id: input.proposalId }, include: { lead: true } });
      if (proposal.status === "signed") throw new BadRequestException("proposal already signed");
      const lead = proposal.lead;

      // 1. Client org (reuse if the lead already links one, e.g. an existing academy customer).
      const orgId =
        lead.orgId ??
        (
          await tx.organization.create({
            data: {
              type: "client",
              isClient: true,
              name: lead.companyName ?? lead.contactName ?? lead.contactEmail,
              slug: `client-${proposal.leadId.slice(0, 8)}`,
            },
          })
        ).id;

      // 2. Contact becomes the client-org owner (portal access).
      await tx.orgMembership.upsert({
        where: { orgId_userId: { orgId, userId: input.contactUserId } },
        create: { orgId, userId: input.contactUserId, role: "owner", clientRole: "client_owner", seatActive: true },
        update: { clientRole: "client_owner" },
      });

      // 3. Open the engagement.
      const reference = `${REFERENCE_PREFIX}-${new Date().getFullYear()}-${proposal.leadId.slice(0, 6)}`;
      const engagement = await tx.engagement.create({
        data: { orgId, type: input.engagementType, reference, title: input.engagementTitle, state: "scoped" },
      });

      // 4. Close the loop: proposal signed, lead won, org linked.
      await tx.proposal.update({ where: { id: input.proposalId }, data: { status: "signed", signedAt: new Date() } });
      await tx.lead.update({ where: { id: proposal.leadId }, data: { stage: "won", orgId } });

      await this.outbox.emit(tx, {
        name: "crm.lead.created", // reuse taxonomy; a dedicated won event is added with the CRM buildout
        aggregateId: proposal.leadId,
        orgId,
        payload: { leadId: proposal.leadId, converted: true, engagementId: engagement.id },
      });

      return { orgId, engagementId: engagement.id };
    });
  }
}
