import { Module } from "@nestjs/common";
import { EngagementService } from "./engagement.service.js";
import { FindingService } from "./finding.service.js";
import { EvidenceService } from "./evidence.service.js";

/**
 * Engagements module (Phase 2 doc 05, doc 06 §4) — crown-jewel data. Findings/evidence bodies are
 * field-level encrypted (CryptoService from the global platform); RLS scopes everything to the
 * client org; publish/download go through the authz gate with step-up. EvidenceService needs a
 * StorageSigner binding (S3 presigner) provided at app composition.
 */
@Module({
  providers: [EngagementService, FindingService, EvidenceService],
  exports: [EngagementService, FindingService, EvidenceService],
})
export class EngagementsModule {}
