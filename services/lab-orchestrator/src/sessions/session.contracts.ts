import { z } from "zod";

/**
 * Lab-orchestrator API contracts (Phase 2 doc 07). This service owns the isolated lab Kubernetes
 * cluster and exposes ONE mTLS API consumed only by core-api. It is deployed in the lab VPC with no
 * route to the app VPC (ADR-008) — the network wall is structural, this API is the single bridge.
 */

export const provisionRequest = z.object({
  labId: z.string().uuid(),
  scenarioKey: z.string(),
  scenarioVersion: z.string(),
  userId: z.string().uuid(),
  ttlSeconds: z.number().int().min(60).max(14_400),
});
export type ProvisionRequest = z.infer<typeof provisionRequest>;

export const provisionResult = z.object({
  orchestratorRef: z.string(), // "<namespace>/<sessionId>" in the lab cluster
  gatewayUrl: z.string().url(),
  sessionSecret: z.string(), // per-session flag seed; core-api envelope-encrypts before persisting
});
export type ProvisionResult = z.infer<typeof provisionResult>;

export const sessionStatus = z.object({
  state: z.enum(["provisioning", "ready", "active", "expired", "terminated", "failed"]),
  computeSeconds: z.number().int(),
});
export type SessionStatus = z.infer<typeof sessionStatus>;
