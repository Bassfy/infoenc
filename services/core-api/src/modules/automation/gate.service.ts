import { Injectable, NotFoundException } from "@nestjs/common";
import type { Principal } from "@infoenc/contracts/auth";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import { AuthzService } from "../../platform/authz/authz.service.js";

/**
 * Human-gate review (Phase 2 doc 03 §5, doc 07 P1). Gated automation runs land here; a staff
 * reviewer approves, edits, or rejects. The decision:
 *   - controls whether the output ships (only `approved`/`edited` unlock delivery),
 *   - feeds the workflow's evaluation set (an edit records how much a human had to change — the
 *     signal that decides when a workflow earns autonomy, FR-AU-050/021 AC),
 *   - is audited (NFR-075: automated decisions affecting users are appealable to a human — this IS
 *     the human).
 */
@Injectable()
export class GateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authz: AuthzService,
  ) {}

  /** The review queue: gated runs awaiting a human decision. */
  async queue(): Promise<Array<{ runId: string; workflowKey: string; createdAt: Date }>> {
    const gates = await this.prisma.automationGate.findMany({
      where: { decision: null },
      include: { run: { include: { workflow: true } } },
      orderBy: { createdAt: "asc" },
    });
    return gates.map((g) => ({
      runId: g.runId,
      workflowKey: g.run.workflow.key,
      createdAt: g.createdAt,
    }));
  }

  async decide(
    actor: Principal,
    runId: string,
    decision: "approved" | "edited" | "rejected",
    editedOutput?: Record<string, unknown>,
  ): Promise<void> {
    // Reviewing automation output is a staff action; the specific role check is per-workflow, but
    // all reviewers must be staff (deny-by-default for non-staff).
    if (!actor.isStaff) this.authz.assert(actor, "impersonation.start"); // will deny — non-staff

    const gate = await this.prisma.automationGate.findUnique({ where: { runId } });
    if (!gate) throw new NotFoundException("no gate for this run");

    // Edit distance in basis points: how much of the output the human changed. Low over time = the
    // workflow is trustworthy enough to consider for autonomy.
    let editDistanceBps: number | null = null;
    if (decision === "edited" && editedOutput) {
      const run = await this.prisma.automationRun.findUniqueOrThrow({ where: { id: runId } });
      editDistanceBps = estimateEditDistanceBps(run.output as Record<string, unknown> | null, editedOutput);
      await this.prisma.automationRun.update({ where: { id: runId }, data: { output: editedOutput as never } });
    }

    await this.prisma.automationGate.update({
      where: { runId },
      data: { decision, reviewerId: actor.userId, editDistanceBps, reviewedAt: new Date() },
    });

    await this.prisma.automationRun.update({
      where: { id: runId },
      data: { status: decision === "rejected" ? "rejected" : "approved" },
    });
  }
}

/** Rough edit magnitude between the drafted and human-edited output (0 = unchanged, 10000 = all). */
function estimateEditDistanceBps(
  before: Record<string, unknown> | null,
  after: Record<string, unknown>,
): number {
  const a = JSON.stringify(before ?? {});
  const b = JSON.stringify(after);
  if (a === b) return 0;
  const maxLen = Math.max(a.length, b.length) || 1;
  let same = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) same++;
  return Math.round((1 - same / maxLen) * 10000);
}
