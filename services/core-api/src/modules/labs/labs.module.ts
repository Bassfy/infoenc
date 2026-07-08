import { Module } from "@nestjs/common";
import { CommerceModule } from "../commerce/commerce.module.js";
import { LabQuotaService } from "./lab-quota.service.js";
import { OrchestratorClient } from "./orchestrator.client.js";
import { LabSessionService } from "./lab-session.service.js";
import { FlagSubmissionService } from "./flag-submission.service.js";

/**
 * Labs module (Phase 2 doc 07). Session lifecycle, quota gate, orchestrator bridge (mTLS to the
 * lab cluster), and flag submission. Imports CommerceModule for the entitlement read model that
 * quota enforcement consults; CryptoService (flag-seed encryption) comes from the global platform.
 */
@Module({
  imports: [CommerceModule],
  providers: [LabQuotaService, OrchestratorClient, LabSessionService, FlagSubmissionService],
  exports: [LabQuotaService, LabSessionService, FlagSubmissionService],
})
export class LabsModule {}
