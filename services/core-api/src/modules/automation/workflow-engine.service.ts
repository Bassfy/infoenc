import { Injectable, Logger } from "@nestjs/common";
import type { GatePolicy } from "@prisma/client";
import { PrismaService } from "../../platform/prisma/prisma.service.js";
import type { LlmResult } from "./llm-gateway.service.js";

/**
 * Workflow engine (Phase 2 doc 03 §5, doc 07 P1 ground rules). Wraps every automation run with:
 *   - FULL TRACEABILITY: an AutomationRun row records trigger, inputs, model+version, tokens, the
 *     data-boundary scopeRef, and output — the audit trail every automated action must leave.
 *   - THE HUMAN GATE: workflows whose output is customer-facing default to `human_approve`; the run
 *     lands in an approval queue (AutomationGate) as `gated`, and the output does NOT ship until a
 *     human approves. Only workflows that have earned autonomy through measured accuracy run `auto`.
 *   - FALLBACK TO A QUEUE, never to silence: a failed run is recorded `failed`, surfaced to ops.
 */
export interface WorkflowStep {
  /** Produces the LLM output + usage; the engine records the trace and applies the gate. */
  run: () => Promise<{ result: LlmResult; output: Record<string, unknown> }>;
}

@Injectable()
export class WorkflowEngine {
  private readonly log = new Logger(WorkflowEngine.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Executes a workflow with full tracing and the gate policy. Returns the run id so the caller can
   * link the artifact (proposal, report) to its automation run for accountability.
   */
  async execute(params: {
    workflowKey: string;
    triggerRef: string; // source event id / schedule / actor
    /** The data-boundary this run was permitted to read (e.g. an engagementId). Recorded + audited. */
    scopeRef: string | null;
    inputs: Record<string, unknown>;
    gatePolicy: GatePolicy;
    step: WorkflowStep;
  }): Promise<{ runId: string; status: "completed" | "gated" | "failed"; output?: Record<string, unknown> }> {
    const workflow = await this.prisma.automationWorkflow.findUnique({ where: { key: params.workflowKey } });
    if (!workflow || !workflow.enabled) {
      this.log.warn(`workflow ${params.workflowKey} missing or disabled`);
      return { runId: "", status: "failed" };
    }

    const run = await this.prisma.automationRun.create({
      data: {
        workflowId: workflow.id,
        status: "running",
        triggerRef: params.triggerRef,
        inputs: params.inputs as never,
        scopeRef: params.scopeRef,
      },
    });

    try {
      const { result, output } = await params.step.run();

      // Autonomy is earned: a workflow runs `auto` only if it's both configured for auto AND has
      // passed its accuracy gate (autonomyEnabled). Otherwise it's human-gated regardless.
      const runsAuto = params.gatePolicy === "auto" && workflow.autonomyEnabled;
      const status = runsAuto ? "completed" : "gated";

      await this.prisma.automationRun.update({
        where: { id: run.id },
        data: {
          status,
          output: output as never,
          model: result.model,
          modelVersion: result.model,
          tokensUsed: result.inputTokens + result.outputTokens,
          finishedAt: new Date(),
        },
      });

      if (!runsAuto) {
        // Land in the human-review queue; the output does not ship until approved.
        await this.prisma.automationGate.create({ data: { runId: run.id } });
      }

      return { runId: run.id, status, output };
    } catch (err) {
      const message = err instanceof Error ? err.message : "unknown error";
      await this.prisma.automationRun.update({
        where: { id: run.id },
        data: { status: "failed", error: message, finishedAt: new Date() },
      });
      this.log.error(`workflow ${params.workflowKey} run ${run.id} failed: ${message}`);
      return { runId: run.id, status: "failed" };
    }
  }
}
