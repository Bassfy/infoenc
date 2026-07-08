import type { EngagementType } from "@prisma/client";

/**
 * Lead qualification scoring (Phase 2 doc 05, FR-CO-022 / FR-AU-010). Pure and deterministic so it
 * is unit-testable and explainable — a lead's temperature must be defensible, not a black box
 * (NFR-075: automated decisions affecting users are transparent). The AI enrichment step (FR-AU-010)
 * augments the `signals` input; this function turns signals into a score + temperature + routing.
 */

export interface LeadSignals {
  hasCompanyDomain: boolean; // business email, not gmail/outlook
  companySizeEstimate?: number; // from enrichment
  budgetIndicated: boolean; // scoping form budget field
  timelineWeeks?: number; // urgency
  complianceDriver: boolean; // PCI/ISO/NCA/SAMA named → non-discretionary demand
  serviceInterest?: EngagementType;
  repeatContact: boolean; // existing account
}

export type LeadTemperature = "hot" | "warm" | "cold";
export type LeadRoute = "consultant_calendar" | "nurture" | "newsletter";

export interface ScoredLead {
  score: number; // 0..100
  temperature: LeadTemperature;
  route: LeadRoute;
}

/** High-value service families skew a lead warmer (larger ACV, doc 03 §4). */
const HIGH_VALUE: ReadonlySet<EngagementType> = new Set<EngagementType>([
  "red_team",
  "purple_team",
  "compliance",
  "incident_response",
  "mssp",
  "ad_assessment",
  "cloud_review",
]);

export function scoreLead(signals: LeadSignals): ScoredLead {
  let score = 0;
  if (signals.hasCompanyDomain) score += 15;
  if (signals.budgetIndicated) score += 25;
  if (signals.complianceDriver) score += 20; // compliance = non-discretionary spend
  if (signals.repeatContact) score += 15;
  if (signals.serviceInterest && HIGH_VALUE.has(signals.serviceInterest)) score += 10;
  if (signals.companySizeEstimate && signals.companySizeEstimate >= 200) score += 10;
  if (signals.timelineWeeks !== undefined && signals.timelineWeeks <= 8) score += 15; // urgency
  score = Math.min(100, score);

  const temperature: LeadTemperature = score >= 60 ? "hot" : score >= 35 ? "warm" : "cold";
  const route: LeadRoute =
    temperature === "hot" ? "consultant_calendar" : temperature === "warm" ? "nurture" : "newsletter";

  return { score, temperature, route };
}
