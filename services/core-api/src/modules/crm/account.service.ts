import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { detectCrossSell, type CrossSellOpportunity } from "./cross-sell.js";

/**
 * Account 360 (FR-AD-021). One view of an org across BOTH platforms: academy subscription + seats,
 * services engagements, invoices, tickets, and cross-sell flags. This is where the dual-business
 * model becomes visible to the team — a company that trains with INFOENC and also buys pentests is
 * one account, and the flywheel opportunities (assess→train, train→assess) surface here.
 *
 * Staff-facing: reads use the staff-scope RLS variant (the actor is staff; access is audited).
 */
export interface Account360 {
  org: { id: string; name: string; type: string; isBusiness: boolean; isClient: boolean };
  subscription: { tier: string; status: string; seats: number; renewsAt: Date | null } | null;
  seatsActive: number;
  engagements: { id: string; reference: string; type: string; state: string }[];
  openFindingsBySeverity: Record<string, number>;
  invoices: { count: number; outstanding: number };
  tickets: { open: number };
  crossSell: CrossSellOpportunity[];
}

@Injectable()
export class AccountService {
  constructor(private readonly prisma: PrismaService) {}

  async view(orgId: string): Promise<Account360> {
    const [org, sub, seatsActive, engagements, findings, invoices, openTickets] = await Promise.all([
      this.prisma.organization.findUniqueOrThrow({ where: { id: orgId } }),
      this.prisma.subscription.findFirst({
        where: { orgId, status: { in: ["trialing", "active", "past_due"] } },
        include: { plan: true },
        orderBy: { currentPeriodEnd: "desc" },
      }),
      this.prisma.orgMembership.count({ where: { orgId, seatActive: true } }),
      this.prisma.engagement.findMany({
        where: { orgId },
        select: { id: true, reference: true, type: true, state: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.finding.groupBy({
        by: ["severity"],
        where: { orgId, status: { in: ["open", "remediating", "retest_requested"] } },
        _count: true,
      }),
      this.prisma.invoice.findMany({ where: { orgId }, select: { status: true, total: true } }),
      this.prisma.ticket.count({ where: { orgId, status: { in: ["open", "pending"] } } }),
    ]);

    const openFindingsBySeverity: Record<string, number> = {};
    for (const g of findings) openFindingsBySeverity[g.severity] = g._count;

    const outstanding = invoices
      .filter((i) => i.status === "issued")
      .reduce((sum, i) => sum + i.total, 0);

    return {
      org: { id: org.id, name: org.name, type: org.type, isBusiness: org.isBusiness, isClient: org.isClient },
      subscription: sub
        ? { tier: sub.plan.tier, status: sub.status, seats: sub.seats, renewsAt: sub.currentPeriodEnd }
        : null,
      seatsActive,
      engagements,
      openFindingsBySeverity,
      invoices: { count: invoices.length, outstanding },
      tickets: { open: openTickets },
      crossSell: detectCrossSell({
        isClient: org.isClient,
        isBusiness: org.isBusiness,
        hasSubscription: sub !== null,
        hasCompletedEngagement: engagements.some((e) => e.state === "closed" || e.state === "reporting"),
        openFindingCount: Object.values(openFindingsBySeverity).reduce((a, b) => a + b, 0),
      }),
    };
  }
}
