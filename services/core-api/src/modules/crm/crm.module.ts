import { Module } from "@nestjs/common";
import { LeadService } from "./lead.service.js";
import { ProposalService } from "./proposal.service.js";
import { AccountService } from "./account.service.js";
import { LeadController } from "./lead.controller.js";
import { TurnstileService } from "./turnstile.service.js";

/**
 * CRM module (Phase 2 doc 05, FR-AD-020s). Public scoping intake (LeadController), lead pipeline +
 * scoring, proposals + the won→engagement flywheel. Lead intake emits crm.lead.created for the
 * FR-AU-010 automation.
 */
@Module({
  controllers: [LeadController],
  providers: [LeadService, ProposalService, AccountService, TurnstileService],
  exports: [LeadService, ProposalService, AccountService],
})
export class CrmModule {}
