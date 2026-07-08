import { Body, Controller, Post, Req } from "@nestjs/common";
import { createZodDto } from "nestjs-zod";
import type { Request } from "express";
import { scopingSubmission } from "@infoenc/contracts/crm";
import { Public } from "../../platform/auth/auth.guard.js";
import { LeadService } from "./lead.service.js";
import { TurnstileService } from "./turnstile.service.js";

class ScopingDto extends createZodDto(scopingSubmission) {}

/**
 * Public scoping-form intake (FR-CO-020/021). @Public (prospects aren't authenticated) but
 * Turnstile-verified against bots (NFR-013). Derives qualification signals from the submission +
 * the email domain, then hands to LeadService which scores, routes, and emits crm.lead.created.
 */
@Controller("api/v1/scoping")
export class LeadController {
  constructor(
    private readonly leads: LeadService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Public()
  @Post()
  async submit(@Body() dto: ScopingDto, @Req() req: Request): Promise<{ received: true; temperature: string }> {
    await this.turnstile.assertHuman(dto.turnstileToken, clientIp(req));

    const domain = dto.contactEmail.split("@")[1] ?? "";
    const isFreeMail = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com"].includes(domain);

    const result = await this.leads.intake({
      contactEmail: dto.contactEmail,
      contactName: dto.contactName,
      companyName: dto.companyName,
      interest: dto.interest,
      scopingData: dto.scoping,
      source: { ...(dto.utm ?? {}), referrer: dto.referrer ?? null },
      signals: {
        hasCompanyDomain: !isFreeMail && domain.length > 0,
        budgetIndicated: dto.budgetIndicated,
        complianceDriver: dto.complianceDriver,
        timelineWeeks: dto.timelineWeeks,
        serviceInterest: dto.interest,
        repeatContact: false, // set true by enrichment if the domain matches an existing account
      },
    });

    // Never leak the internal score/route to an anonymous submitter; just acknowledge.
    return { received: true, temperature: result.temperature };
  }
}

function clientIp(req: Request): string {
  return (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ?? req.ip ?? "";
}
