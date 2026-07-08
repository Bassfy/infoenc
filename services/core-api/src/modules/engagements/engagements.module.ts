import { Module } from "@nestjs/common";
import { EngagementService } from "./engagement.service.js";
import { FindingService } from "./finding.service.js";
import { FindingStatusService } from "./finding-status.service.js";
import { EvidenceService } from "./evidence.service.js";
import { ReportService } from "./report.service.js";

/**
 * Engagements module (Phase 2 doc 05, doc 06 §4) — crown-jewel data. Findings/evidence bodies are
 * field-level encrypted (CryptoService from the global platform); RLS scopes everything to the
 * client org; publish/download go through the authz gate with step-up. EvidenceService needs a
 * StorageSigner binding (S3 presigner) provided at app composition.
 */
@Module({
  providers: [EngagementService, FindingService, FindingStatusService, EvidenceService, ReportService],
  exports: [EngagementService, FindingService, FindingStatusService, EvidenceService, ReportService],
})
export class EngagementsModule {}
