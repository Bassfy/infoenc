import { describe, expect, it, vi, beforeEach } from "vitest";
import { WorkflowEngine } from "./workflow-engine.service.js";

/**
 * Workflow-engine tests (doc 07 P1 ground rules). Lock the two guarantees: customer-facing output
 * is human-gated by default, and autonomy runs only when explicitly earned. A regression that lets
 * an un-approved draft ship would be a serious trust failure — these catch it.
 */
describe("WorkflowEngine", () => {
  let prisma: {
    automationWorkflow: { findUnique: ReturnType<typeof vi.fn> };
    automationRun: { create: ReturnType<typeof vi.fn>; update: ReturnType<typeof vi.fn> };
    automationGate: { create: ReturnType<typeof vi.fn> };
  };
  let engine: WorkflowEngine;

  const okStep = {
    run: async () => ({
      result: { text: "draft", model: "claude-opus-4-8", inputTokens: 100, outputTokens: 200 },
      output: { reportMarkdown: "draft" },
    }),
  };

  function setup(workflow: { enabled: boolean; autonomyEnabled: boolean } | null) {
    prisma = {
      automationWorkflow: { findUnique: vi.fn().mockResolvedValue(workflow ? { id: "wf", ...workflow } : null) },
      automationRun: { create: vi.fn().mockResolvedValue({ id: "run-1" }), update: vi.fn() },
      automationGate: { create: vi.fn() },
    };
    engine = new WorkflowEngine(prisma as never);
  }

  it("human-gates a customer-facing workflow: status gated, gate row created, output NOT auto-shipped", async () => {
    setup({ enabled: true, autonomyEnabled: false });
    const res = await engine.execute({
      workflowKey: "FR-AU-050",
      triggerRef: "evt-1",
      scopeRef: "eng-1",
      inputs: {},
      gatePolicy: "human_approve",
      step: okStep,
    });
    expect(res.status).toBe("gated");
    expect(prisma.automationGate.create).toHaveBeenCalledOnce();
  });

  it("does NOT run auto even with gatePolicy=auto until autonomy is earned", async () => {
    setup({ enabled: true, autonomyEnabled: false }); // configured auto but not yet trusted
    const res = await engine.execute({
      workflowKey: "FR-AU-021",
      triggerRef: "evt-2",
      scopeRef: null,
      inputs: {},
      gatePolicy: "auto",
      step: okStep,
    });
    expect(res.status).toBe("gated"); // still gated — autonomy not earned
  });

  it("runs auto only when gatePolicy=auto AND autonomy earned", async () => {
    setup({ enabled: true, autonomyEnabled: true });
    const res = await engine.execute({
      workflowKey: "FR-AU-021",
      triggerRef: "evt-3",
      scopeRef: null,
      inputs: {},
      gatePolicy: "auto",
      step: okStep,
    });
    expect(res.status).toBe("completed");
    expect(prisma.automationGate.create).not.toHaveBeenCalled();
  });

  it("records the data-boundary scopeRef on the run for audit", async () => {
    setup({ enabled: true, autonomyEnabled: false });
    await engine.execute({
      workflowKey: "FR-AU-050",
      triggerRef: "evt-4",
      scopeRef: "eng-42",
      inputs: { engagementId: "eng-42" },
      gatePolicy: "human_approve",
      step: okStep,
    });
    expect(prisma.automationRun.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ scopeRef: "eng-42" }) }),
    );
  });

  it("records a failed run instead of throwing when a step errors (fallback to queue, not silence)", async () => {
    setup({ enabled: true, autonomyEnabled: false });
    const res = await engine.execute({
      workflowKey: "FR-AU-050",
      triggerRef: "evt-5",
      scopeRef: "eng-1",
      inputs: {},
      gatePolicy: "human_approve",
      step: { run: async () => { throw new Error("LLM_REFUSED"); } },
    });
    expect(res.status).toBe("failed");
    expect(prisma.automationRun.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "failed", error: "LLM_REFUSED" }) }),
    );
  });
});
