import { Module } from "@nestjs/common";
import { LlmGateway } from "./llm-gateway.service.js";
import { WorkflowEngine } from "./workflow-engine.service.js";
import { GateService } from "./gate.service.js";
import { PentestReportWorkflow } from "./workflows/pentest-report.workflow.js";

/**
 * Automation module (Phase 2 doc 03 §5, doc 07 P1) — the AI-operated back office. The LLM gateway
 * (one Claude client with per-workflow data boundaries), the workflow engine (traceability + the
 * human gate), the human-review queue, and the FR-AU workflow implementations. CryptoService and
 * PrismaService come from the global platform module.
 *
 * Workflows land here in priority order (M first): FR-AU-050 (pentest report) is the showcase — it
 * exercises the crown-jewel data boundary and the no-fabrication rule. FR-AU-011 (proposal draft),
 * FR-AU-021 (ticket classification), FR-AU-010 (lead qualification enrichment), and the rest follow
 * the same engine + gate pattern.
 */
@Module({
  providers: [LlmGateway, WorkflowEngine, GateService, PentestReportWorkflow],
  exports: [WorkflowEngine, GateService, PentestReportWorkflow],
})
export class AutomationModule {}
