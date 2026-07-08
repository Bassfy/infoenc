import { z } from "zod";

/**
 * Scoping-form intake contracts (Phase 2 doc 05, FR-CO-020). Each service family has its own
 * structured form (not a generic "contact us"); the shared envelope below carries the common fields
 * plus a per-service `scoping` payload validated by the service-specific schema on the client.
 */
export const engagementInterest = z.enum([
  "pentest_network",
  "pentest_web",
  "pentest_api",
  "pentest_mobile",
  "red_team",
  "purple_team",
  "cloud_review",
  "ad_assessment",
  "vuln_assessment",
  "compliance",
  "incident_response",
  "forensics",
  "code_review",
  "mssp",
]);
export type EngagementInterest = z.infer<typeof engagementInterest>;

export const scopingSubmission = z.object({
  contactEmail: z.string().email(),
  contactName: z.string().min(1).max(120).optional(),
  companyName: z.string().min(1).max(160).optional(),
  interest: engagementInterest,
  // per-service structured answers (asset counts, environments, compliance driver, window…)
  scoping: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])),
  // signals the qualifier uses (some derived server-side from enrichment)
  budgetIndicated: z.boolean().default(false),
  timelineWeeks: z.number().int().positive().max(104).optional(),
  complianceDriver: z.boolean().default(false),
  // attribution
  utm: z.record(z.string(), z.string()).optional(),
  referrer: z.string().optional(),
  // bot defense token (Cloudflare Turnstile) — verified server-side (NFR-013)
  turnstileToken: z.string().min(1),
});
export type ScopingSubmission = z.infer<typeof scopingSubmission>;
