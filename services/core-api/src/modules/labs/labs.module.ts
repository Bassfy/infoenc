import { Module } from "@nestjs/common";
import { CommerceModule } from "../commerce/commerce.module.js";
import { LabQuotaService } from "./lab-quota.service.js";

/**
 * Labs module (Phase 2 doc 07). Lab definitions, session lifecycle, flag submission, and the quota
 * gate. Imports CommerceModule for the entitlement read model that quota enforcement consults. The
 * orchestrator client (mTLS to the lab cluster) and session lifecycle build out on this base.
 */
@Module({
  imports: [CommerceModule],
  providers: [LabQuotaService],
  exports: [LabQuotaService],
})
export class LabsModule {}
