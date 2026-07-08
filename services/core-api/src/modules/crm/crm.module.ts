import { Module } from "@nestjs/common";
import { LeadService } from "./lead.service.js";
import { ProposalService } from "./proposal.service.js";

/**
 * CRM module (Phase 2 doc 05, FR-AD-020s). Lead pipeline, scoring/routing, proposals, account 360.
 * Lead intake emits crm.lead.created for the automation layer (FR-AU-010); ProposalService owns the
 * won→engagement flywheel conversion (doc 04 J3).
 */
@Module({
  providers: [LeadService, ProposalService],
  exports: [LeadService, ProposalService],
})
export class CrmModule {}
