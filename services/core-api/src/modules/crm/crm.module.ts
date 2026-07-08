import { Module } from "@nestjs/common";
import { LeadService } from "./lead.service.js";

/**
 * CRM module (Phase 2 doc 05, FR-AD-020s). Lead pipeline, scoring/routing, proposals, account 360.
 * Lead intake emits crm.lead.created for the automation layer (FR-AU-010) to enrich and follow up.
 */
@Module({
  providers: [LeadService],
  exports: [LeadService],
})
export class CrmModule {}
