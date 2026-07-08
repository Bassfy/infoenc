import { ForbiddenException, Injectable } from "@nestjs/common";
import type { FindingStatus } from "@prisma/client";
import type { Principal } from "@infoenc/contracts/auth";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { CryptoService } from "../../platform/crypto/crypto.service.js";

/**
 * Finding status + retest workflow (FR-CO-032/035). The client and the consultant drive a finding
 * through remediation with a guarded state machine — a client can request retest and mark risk
 * accepted, but only a consultant can verify a finding resolved (you don't get to close your own
 * finding). All actions are RLS-scoped to the org and status history is preserved via comments.
 *
 * Transitions:
 *   open ──client──▶ remediating ──client──▶ retest_requested ──consultant──▶ resolved
 *   open ──client──▶ accepted_risk        (client accepts, with rationale)
 *   * ──consultant──▶ false_positive       (consultant only)
 */
type Actor = "client" | "consultant";

const TRANSITIONS: Record<FindingStatus, Array<{ to: FindingStatus; by: Actor }>> = {
  open: [
    { to: "remediating", by: "client" },
    { to: "accepted_risk", by: "client" },
    { to: "false_positive", by: "consultant" },
  ],
  remediating: [
    { to: "retest_requested", by: "client" },
    { to: "accepted_risk", by: "client" },
  ],
  retest_requested: [
    { to: "resolved", by: "consultant" }, // only a consultant verifies remediation
    { to: "remediating", by: "consultant" }, // retest failed, back to remediating
  ],
  accepted_risk: [{ to: "open", by: "consultant" }], // reopen if risk posture changes
  resolved: [],
  false_positive: [],
};

@Injectable()
export class FindingStatusService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  async transition(
    actor: Principal,
    findingId: string,
    to: FindingStatus,
    note?: string,
  ): Promise<{ status: FindingStatus }> {
    const finding = await this.prisma.tenant.finding.findUnique({ where: { id: findingId } });
    if (!finding) throw new ForbiddenException("not authorized for this finding"); // RLS-scoped

    const actorRole: Actor = actor.isStaff ? "consultant" : "client";
    const allowed = TRANSITIONS[finding.status].find((t) => t.to === to && t.by === actorRole);
    if (!allowed) {
      throw new ForbiddenException(
        `illegal transition ${finding.status} → ${to} by ${actorRole}`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.finding.update({ where: { id: findingId }, data: { status: to } });
      if (note) {
        // Status-change notes are sensitive (may reveal remediation detail) → encrypted like bodies.
        await tx.findingComment.create({
          data: {
            findingId,
            orgId: finding.orgId,
            authorId: actor.userId,
            bodyCipher: await this.crypto.encrypt(`[${finding.status}→${to}] ${note}`),
          },
        });
      }
    });

    return { status: to };
  }
}
